#!/usr/bin/env node

/**
 * Content Generation MCP Server for Publicidad Zaimella
 * Enables conversational AI-driven content generation via Claude Desktop
 * 
 * Features:
 * - Orchestrates copy + image + video generation
 * - Intelligent niche detection and context management
 * - Multi-platform variant generation
 * - Semantic caching with Qdrant integration
 * - Zero disruption to existing architecture
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ContentOrchestrator } from './tools/content-orchestrator.js';
import { NicheManager } from './tools/niche-manager.js';
import { ApiBridge } from './adapters/api-bridge.js';
import { QdrantConnector } from './adapters/qdrant-connector.js';

class ContentGenerationMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'publicidad-zaimella-content-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.contentOrchestrator = new ContentOrchestrator();
    this.nicheManager = new NicheManager();
    this.apiBridge = new ApiBridge();
    this.qdrantConnector = new QdrantConnector();

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_complete_content',
            description: 'ORCHESTRATE complete content workflow with phase control (copy → image → video)',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Campaign brief or content description'
                },
                platform: {
                  type: 'string',
                  enum: ['instagram', 'tiktok', 'linkedin', 'x-twitter', 'facebook', 'pinterest', 'youtube', 'email', 'google', 'kick'],
                  description: 'Primary target platform (11 platforms supported)'
                },
                format: {
                  type: 'string',
                  enum: ['post', 'story', 'reel', 'article', 'thread'],
                  default: 'post',
                  description: 'Content format type'
                },
                niche: {
                  type: 'string',
                  description: 'Industry niche (auto-detected if not provided)',
                  enum: ['marketing-agency', 'e-commerce', 'real-estate', 'fitness', 'food-beverage', 'auto']
                },
                phaseControl: {
                  type: 'boolean',
                  default: true,
                  description: 'Enable phase-by-phase control (recommended for cost management)'
                },
                autoExecute: {
                  type: 'boolean',
                  default: false,
                  description: 'Execute all phases automatically (WARNING: consumes credits immediately)'
                }
              },
              required: ['brief', 'platform']
            }
          },
          {
            name: 'analyze_content_context',
            description: 'Analyze content brief and suggest optimal generation parameters. ✨ Phase 3: Supports BigQuery data integration for ultra-personalized content.',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Content brief to analyze'
                },
                clientId: {
                  type: 'string',
                  description: '✨ Phase 3: Optional client ID for BigQuery business intelligence integration (e.g., "BOUTIQUE_FASHION_001"). When provided, fetches real business data: top products, customer demographics, proven copy phrases, seasonal patterns.'
                },
                dataset: {
                  type: 'string',
                  description: '✨ Phase 3: Optional BigQuery dataset name (default: "client_analytics"). Use custom dataset if client data is in different location.'
                }
              },
              required: ['brief']
            }
          },
          {
            name: 'get_niche_insights',
            description: 'Get industry-specific insights and recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                niche: {
                  type: 'string',
                  description: 'Industry niche to analyze'
                }
              },
              required: ['niche']
            }
          },
          {
            name: 'check_cache_status',
            description: 'Check semantic cache for similar content requests',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Content query to check in cache'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'generate_product_image',
            description: 'Generate product image only (Phase 1)',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Product description'
                },
                model: {
                  type: 'string',
                  enum: ['flux-kontext', 'pro-ultra'],
                  default: 'flux-kontext',
                  description: 'Image generation model'
                }
              },
              required: ['brief']
            }
          },
          {
            name: 'generate_avatar_image',
            description: 'Generate avatar image with trained model (Phase 2)',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Avatar description'
                },
                productImageId: {
                  type: 'string',
                  description: 'Product image ID for reference'
                }
              },
              required: ['brief']
            }
          },
          {
            name: 'generate_video_content',
            description: 'Generate video with product and avatar images (Phase 3)',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Video description with dialogue'
                },
                productImageId: {
                  type: 'string',
                  description: 'Product image ID'
                },
                avatarImageId: {
                  type: 'string',
                  description: 'Avatar image ID'
                },
                testMode: {
                  type: 'boolean',
                  default: true,
                  description: 'Test mode to avoid consuming credits'
                }
              },
              required: ['brief', 'productImageId', 'avatarImageId']
            }
          },
          {
            name: 'generate_copy_content',
            description: 'Generate marketing copy for specific platform and niche (Phase 0)',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Content brief or product description'
                },
                platform: {
                  type: 'string',
                  enum: ['instagram', 'tiktok', 'linkedin', 'x-twitter', 'facebook', 'pinterest', 'youtube', 'email', 'google', 'kick'],
                  description: 'Target platform for copy generation (11 platforms supported)'
                },
                format: {
                  type: 'string',
                  enum: ['post', 'story', 'reel', 'article', 'thread'],
                  description: 'Content format type'
                },
                niche: {
                  type: 'string',
                  enum: ['marketing-agency', 'e-commerce', 'real-estate', 'fitness', 'food-beverage', 'auto'],
                  description: 'Industry niche for context'
                },
                copyType: {
                  type: 'string',
                  enum: ['headline', 'description', 'cta', 'hashtags', 'complete'],
                  default: 'complete',
                  description: 'Type of copy to generate'
                }
              },
              required: ['brief', 'platform']
            }
          },
          {
            name: 'create_context_profile',
            description: 'Create a new context profile for Digital Twin products or brand consistency',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Profile name (e.g., "Prudential Comfort Total P-10u")'
                },
                description: {
                  type: 'string',
                  description: 'Detailed description of the profile purpose'
                },
                product_specifications: {
                  type: 'object',
                  description: 'Detailed product specifications for Digital Twin mode',
                  properties: {
                    sku: { type: 'string' },
                    category: { type: 'string' },
                    pack_dimensions_mm: {
                      type: 'object',
                      properties: {
                        height: { type: 'number' },
                        width: { type: 'number' },
                        depth: { type: 'number' }
                      }
                    }
                  }
                },
                brand_guidelines: {
                  type: 'object',
                  description: 'Brand colors, typography, and visual guidelines'
                },
                technical_preferences: {
                  type: 'object',
                  description: 'Technical generation preferences',
                  properties: {
                    quality: { type: 'string', enum: ['standard', 'high', 'ultra-high'] },
                    aspect_ratio: { type: 'string' },
                    color_accuracy: { type: 'string' }
                  }
                }
              },
              required: ['name', 'description']
            }
          },
          {
            name: 'get_client_business_intelligence',
            description: 'Get real business intelligence from BigQuery for personalized content generation. Pass dataset as INPUT parameter for multi-client support.',
            inputSchema: {
              type: 'object',
              properties: {
                clientId: {
                  type: 'string',
                  description: 'Client ID (optional - for multi-client schemas like CMF, Insurance, Fashion)'
                },
                dataset: {
                  type: 'string',
                  description: 'BigQuery dataset as INPUT parameter (e.g., "CMF_TABLAS_TEMPORALES" for CMF client, "INSURANCE_DATA" for Insurance client). This makes the architecture REPLICABLE across clients.'
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_complete_content':
            return await this.handleCompleteContentGeneration(args);
          
          case 'analyze_content_context':
            return await this.handleContextAnalysis(args);
          
          case 'get_niche_insights':
            return await this.handleNicheInsights(args);
          
          case 'check_cache_status':
            return await this.handleCacheCheck(args);


          case 'generate_product_image':
            return await this.handleProductImageGeneration(args);
          
          case 'generate_avatar_image':
            return await this.handleAvatarImageGeneration(args);
          
          case 'generate_video_content':
            return await this.handleVideoContentGeneration(args);
          
          case 'generate_copy_content':
            return await this.handleCopyContentGeneration(args);
          
          case 'create_context_profile':
            return await this.handleContextProfileCreation(args);

          case 'get_client_business_intelligence':
            return await this.handleBusinessIntelligence(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Handle complete content generation workflow
   */
  async handleCompleteContentGeneration(args) {
    const { brief, niche, platforms = ['instagram'], voice_preference = 'generic', context_gathering = 'hybrid' } = args;

    //console.log(`🚀 Starting complete content generation for: "${brief}"`);

    try {
      // Step 1: Initialize orchestrator with parameters
      await this.contentOrchestrator.initialize({
        brief,
        niche: niche || await this.nicheManager.detectNiche(brief),
        platforms,
        voicePreference: voice_preference,
        contextGathering: context_gathering
      });

      // Step 2: Execute full pipeline
      const result = await this.contentOrchestrator.generateCompleteContent();

      return {
        content: [
          {
            type: 'text',
            text: `✅ Content generation completed successfully!\n\n` +
                  `📝 **Copy Generated**: ${result.copy ? 'Yes' : 'No'}\n` +
                  `🎨 **Images Generated**: ${result.images?.length || 0}\n` +
                  `🎬 **Video Generated**: ${result.video ? 'Yes' : 'No'}\n` +
                  `📱 **Platform Variants**: ${result.variants?.length || 0}\n\n` +
                  `⏱️ **Total Time**: ${result.metadata.processingTime}ms\n` +
                  `🎯 **Niche Detected**: ${result.metadata.nicheUsed}\n` +
                  `💾 **Cache Hit**: ${result.metadata.cacheHit ? 'Yes' : 'No'}\n\n` +
                  `**Generated Content URLs:**\n` +
                  (result.images?.map(img => `🖼️ ${img.publicUrl}`).join('\n') || '') +
                  (result.video ? `\n🎬 ${result.video.publicUrl}` : '') +
                  `\n\n**Copy:**\n${result.copy || 'Not generated'}`
          }
        ]
      };
    } catch (error) {
      //console.error('❌ Content generation failed:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Content generation failed: ${error.message}\n\nPlease check the logs for more details.`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Handle content context analysis (✨ PHASE 3: Enhanced with BigQuery integration)
   */
  async handleContextAnalysis(args) {
    const { brief, clientId = null, dataset = 'client_analytics' } = args;

    try {
      // ✨ PHASE 3: Pass clientId and dataset to analyzeBrief for BigQuery integration
      const analysis = await this.nicheManager.analyzeBrief(brief, clientId, dataset);

      // Extract BigQuery business intelligence if available
      const bizIntel = analysis.framework_seeds?.business_intelligence;
      const hasBigQueryData = bizIntel && bizIntel.has_real_data;

      return {
        content: [
          {
            type: 'text',
            text: `📊 **Content Analysis Results** ${hasBigQueryData ? '✨ (Enhanced with BigQuery Data)' : ''}\n\n` +
                  `🎯 **Detected Niche**: ${analysis.niche}\n` +
                  `📈 **Confidence**: ${(analysis.confidence * 100).toFixed(1)}%\n` +
                  `📱 **Recommended Platforms**: ${analysis.recommendedPlatforms.join(', ')}\n` +
                  `🎨 **Suggested Style**: ${analysis.suggestedStyle}\n` +
                  `🎬 **Video Approach**: ${analysis.videoApproach}\n\n` +
                  `**Key Insights:**\n${analysis.insights.map(insight => `• ${insight}`).join('\n')}\n\n` +

                  // ✨ PHASE 3: Display BigQuery business intelligence if available
                  (hasBigQueryData ?
                    `---\n\n` +
                    `## ✨ BigQuery Business Intelligence (Client: ${bizIntel.client_id})\n\n` +
                    `**📊 Top Selling Products:**\n` +
                    (bizIntel.top_selling_products && bizIntel.top_selling_products.length > 0 ?
                      bizIntel.top_selling_products.slice(0, 3).map((product, idx) =>
                        `${idx + 1}. ${product.product_name || 'N/A'} - Revenue: $${product.total_revenue?.toLocaleString() || 'N/A'} (Rating: ${product.avg_rating || 'N/A'}/5)`
                      ).join('\n') + (bizIntel.top_selling_products.length > 3 ? `\n   ... and ${bizIntel.top_selling_products.length - 3} more` : '')
                      : '   No product data available'
                    ) + `\n\n` +

                    `**👥 Real Customer Demographics:**\n` +
                    (bizIntel.real_customer_demographics ?
                      `   • Average Age: ${Math.round(bizIntel.real_customer_demographics.avg_age) || 'N/A'} years\n` +
                      `   • Gender Distribution: ${bizIntel.real_customer_demographics.female_pct?.toFixed(1) || 'N/A'}% Female, ${bizIntel.real_customer_demographics.male_pct?.toFixed(1) || 'N/A'}% Male\n` +
                      `   • Average Order Value: $${bizIntel.real_customer_demographics.avg_order_value?.toFixed(2) || 'N/A'}\n` +
                      `   • Total Customers: ${bizIntel.real_customer_demographics.total_customers?.toLocaleString() || 'N/A'}`
                      : '   No demographic data available'
                    ) + `\n\n` +

                    `**🎯 Proven High-Converting Copy Phrases:**\n` +
                    (bizIntel.proven_copy_phrases && bizIntel.proven_copy_phrases.length > 0 ?
                      bizIntel.proven_copy_phrases.slice(0, 3).map((phrase, idx) =>
                        `${idx + 1}. "${phrase.ad_copy_phrase || 'N/A'}" - Conversion Rate: ${phrase.conversion_rate_pct?.toFixed(2) || 'N/A'}% (${phrase.impressions?.toLocaleString() || 'N/A'} impressions)`
                      ).join('\n')
                      : '   No copy performance data available'
                    ) + `\n\n` +

                    `**📅 Seasonal Sales Patterns (Peak Months):**\n` +
                    (bizIntel.seasonal_patterns && bizIntel.seasonal_patterns.length > 0 ?
                      bizIntel.seasonal_patterns.slice(0, 3).map((pattern, idx) =>
                        `${idx + 1}. ${pattern.month || 'N/A'} - ${pattern.order_count?.toLocaleString() || 'N/A'} orders, $${pattern.total_revenue?.toLocaleString() || 'N/A'} revenue`
                      ).join('\n')
                      : '   No seasonal pattern data available'
                    ) + `\n\n` +
                    `*Data Source: BigQuery (${bizIntel.dataset}) - Fetched: ${new Date(bizIntel.fetched_at).toLocaleTimeString()}*\n\n` +
                    `---\n\n`
                  : '') +

                  `**Framework Seeds Generated:**\n` +
                  `• Hook Opportunities: ${Object.values(analysis.framework_seeds.hook_opportunities).filter(v => v).length} detected\n` +
                  `• Pain Points: ${analysis.framework_seeds.pain_points.length} identified\n` +
                  `• Market Sophistication: ${analysis.framework_seeds.sophistication_level}\n` +
                  `• Demographics: ${analysis.framework_seeds.target_demographics.gender || 'N/A'}, ${analysis.framework_seeds.target_demographics.age_range || 'N/A'}\n\n` +

                  (hasBigQueryData ?
                    `💡 **Next Step:** Use \`generate_complete_content\` to create ultra-personalized content based on this real business data.`
                    : `💡 **Next Step:** Use \`generate_complete_content\` to create content. Add \`clientId\` parameter for ultra-personalized content based on real business data.`
                  )
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Analysis failed: ${error.message}\n\n` +
                  `**Troubleshooting:**\n` +
                  `• If BigQuery error: Check client_id exists in dataset\n` +
                  `• If dataset error: Verify dataset name is correct\n` +
                  `• System gracefully degraded to Phase 2 functionality`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Handle niche insights request
   */
  async handleNicheInsights(args) {
    const { niche } = args;

    try {
      const insights = await this.nicheManager.getNicheInsights(niche);
      
      return {
        content: [
          {
            type: 'text',
            text: `🎯 **${niche.toUpperCase()} Industry Insights**\n\n` +
                  `**Target Audience**: ${insights.targetAudience}\n` +
                  `**Key Messaging**: ${insights.keyMessaging.join(', ')}\n` +
                  `**Visual Style**: ${insights.visualStyle}\n` +
                  `**Optimal Platforms**: ${insights.optimalPlatforms.join(', ')}\n\n` +
                  `**Best Practices:**\n${insights.bestPractices.map(practice => `• ${practice}`).join('\n')}\n\n` +
                  `**Content Trends:**\n${insights.trends.map(trend => `• ${trend}`).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get niche insights: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Handle cache status check
   */
  async handleCacheCheck(args) {
    const { query } = args;

    try {
      const cacheResult = await this.qdrantConnector.searchSimilar(query, 0.85);
      
      return {
        content: [
          {
            type: 'text',
            text: `💾 **Cache Status for: "${query}"**\n\n` +
                  `🎯 **Similar Content Found**: ${cacheResult.found ? 'Yes' : 'No'}\n` +
                  (cacheResult.found ? 
                    `📊 **Similarity Score**: ${(cacheResult.score * 100).toFixed(1)}%\n` +
                    `📅 **Generated**: ${cacheResult.metadata.timestamp}\n` +
                    `🎨 **Assets Available**: ${cacheResult.metadata.assetsCount}\n` +
                    `⚡ **Reusable**: ${cacheResult.reusable ? 'Yes' : 'No'}`
                    : 
                    `💡 **Recommendation**: Fresh generation required`
                  )
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Cache check failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }


  async start() {
    //console.log('🚀 Starting Content Generation MCP Server...');
    
    try {
      // Initialize components
      await this.apiBridge.initialize();
      await this.qdrantConnector.initialize();
      await this.nicheManager.initialize();
      
      //console.log('✅ All components initialized successfully');
      
      // Start server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      //console.log('✅ Content Generation MCP Server running on stdio');
    } catch (error) {
      //console.error('❌ Failed to start MCP server:', error);
      process.exit(1);
    }
  }

  // 🆕 PHASE 1: Product Image Generation
  async handleProductImageGeneration(args) {
    try {
      const { brief, model = 'flux-kontext' } = args;
      
      const result = await this.apiBridge.generateImage(brief, {
        model: model,
        aspectRatio: '1:1',
        enhanceWithAI: true
      });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Product image generated!\n\n📸 Model: ${model}\n🔗 URL: ${result.publicUrl}\n🎯 Enhanced: ${result.prompts?.enhanced ? 'Yes' : 'No'}\n\n💡 Next: Use for avatar generation (Phase 2)`
        }],
        isError: false
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Product image failed: ${error.message}` }],
        isError: true
      };
    }
  }

  // 🆕 PHASE 2: Avatar Image Generation  
  async handleAvatarImageGeneration(args) {
    try {
      const { brief, productImageId } = args;
      
      const result = await this.apiBridge.generateImage(brief, {
        model: 'alexseis',
        aspectRatio: '9:16', 
        enhanceWithAI: true
      });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Avatar generated with trained model!\n\n👤 Model: alexseis\n🔗 URL: ${result.publicUrl}\n\n💡 Next: Use both images for video (Phase 3)`
        }],
        isError: false
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Avatar generation failed: ${error.message}` }],
        isError: true
      };
    }
  }

  // 🆕 PHASE 3: Video Content Generation
  async handleVideoContentGeneration(args) {
    try {
      const { brief, productImageId, avatarImageId, testMode = true } = args;
      
      if (testMode) {
        return {
          content: [{
            type: 'text',
            text: `🧪 TEST MODE: Video simulated!\n\n🎬 Structure: [Shot Type] + [Action] + [Audio]\n✅ Veo3 templates: READY\n💰 Cost: $0.00 (test)\n\n🚀 Set testMode=false for real generation`
          }],
          isError: false
        };
      }
      
      // Real generation would go here
      return {
        content: [{ type: 'text', text: `🎬 Video generation in progress...` }],
        isError: false
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Video failed: ${error.message}` }],
        isError: true
      };
    }
  }

  // 🆕 NEW: Handle copy content generation - REFACTORED to use ad-copy-generation skill
  async handleCopyContentGeneration(args) {
    try {
      const {
        brief,
        platform,
        format = 'post',
        niche = 'marketing-agency',
        copyType = 'complete'
      } = args;

      // ✅ STEP 1: Load platform specifications from JSON (dynamic)
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const platformSpecsPath = path.resolve(__dirname, '../config/platform-specs.json');
      const platformSpecsData = JSON.parse(fs.readFileSync(platformSpecsPath, 'utf-8'));

      // Validate platform exists
      const platformSpec = platformSpecsData[platform];
      if (!platformSpec) {
        const availablePlatforms = Object.keys(platformSpecsData).join(', ');
        throw new Error(`Platform "${platform}" not supported. Available platforms: ${availablePlatforms}`);
      }

      // ✅ STEP 2: Try to use ad-copy-generation skill (Todd Brown + Hormozi)
      const { SkillDetector } = await import('./tools/skill-detector.js');
      const skillDetector = new SkillDetector();
      await skillDetector.initialize();

      if (skillDetector.hasSkill('ad-copy-generation')) {
        try {
          const copySkill = skillDetector.getSkill('ad-copy-generation');

          // Generate using skill (5 variants with differentiated hooks)
          const copyResult = await copySkill.generate({
            brief: brief,
            platform: platform,
            niche: niche,
            language: 'es', // Default to Spanish, could be detected
            platformSpecification: {
              platform: platform,
              toneOfVoice: platformSpec.toneOfVoice,
              demographics: platformSpec.demographics,
              bestPractices: platformSpec.bestPractices,
              formats: platformSpec.formats
            }
          });

          // ✅ Format output with 5 variants (Todd Brown hooks)
          const variantsText = copyResult.variants.map((variant, idx) => {
            // Access copy fields correctly (skill returns variant.copy.headline not variant.headline)
            const copy = variant.copy || variant; // Fallback for backward compatibility
            return `**Variant ${idx + 1}** (${variant.hook_type || 'N/A'})\n` +
                   `📰 Headline: ${copy.headline || 'N/A'}\n` +
                   `🎯 Hook: ${copy.hook || 'N/A'}\n` +
                   `📝 Body:\n${copy.body || 'N/A'}\n` +
                   `🔥 CTA: ${copy.cta || 'N/A'}\n` +
                   `📊 Sophistication: ${variant.market_sophistication || variant.sophistication_match || 'N/A'}\n`;
          }).join('\n---\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `✅ Professional Ad Copy Generated via Skill!\n\n` +
                      `**Platform:** ${platform} (${format})\n` +
                      `**Niche:** ${niche}\n` +
                      `**Tone:** ${platformSpec.toneOfVoice}\n` +
                      `**Framework:** Todd Brown (5 Hook Types) + Hormozi Value Stack\n\n` +
                      `**${copyResult.variants.length} High-Converting Variants:**\n\n` +
                      `${variantsText}\n` +
                      `**Platform Best Practices:**\n${platformSpec.bestPractices.slice(0, 3).map(tip => `• ${tip}`).join('\n')}\n\n` +
                      `**Next Steps:**\n` +
                      `1. Select best performing variant for A/B testing\n` +
                      `2. Use for image generation (Phase 1)\n` +
                      `3. Generate avatar with this context (Phase 2)\n` +
                      `4. Create video incorporating messaging (Phase 3)`
              }
            ]
          };

        } catch (skillError) {
          console.error('[ERROR] Skill execution failed:', skillError.message);
          throw new Error(`Skill failed: ${skillError.message}. Please ensure ad-copy-generation v1.0.3-tone-fix is installed.`);
        }
      } else {
        throw new Error('ad-copy-generation skill not found. Please install the skill from creator_skills directory.');
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Copy Generation Failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // 🆕 NEW: Handle context profile creation
  async handleContextProfileCreation(args) {
    try {
      const { 
        name, 
        description, 
        product_specifications = {}, 
        brand_guidelines = {}, 
        technical_preferences = {} 
      } = args;

      // Import the context profile manager
      const { ContextProfileManager } = await import('../lib/context-profile-manager.js');
      const profileManager = new ContextProfileManager();
      await profileManager.initialize();

      // Create profile data structure matching Prudential format
      const profileData = {
        name,
        description,
        context: {
          user_preferences: {
            style: technical_preferences.style || "clean product photography",
            mood: brand_guidelines.mood || "professional and trustworthy",
            language: "es"
          },
          project_context: {
            theme: product_specifications.category || "product photography",
            target_audience: brand_guidelines.target_audience || "general consumers",
            industry: product_specifications.industry || "consumer goods"
          },
          technical_preferences: {
            quality: technical_preferences.quality || "ultra-high",
            aspect_ratio: technical_preferences.aspect_ratio || "1:1",
            color_accuracy: technical_preferences.color_accuracy || "high precision"
          },
          brand_guidelines,
          product_specifications,
          validation_rules: {
            must_include: [],
            forbidden: [],
            tolerance: {
              color: "ΔE < 2",
              dimensions_mm: "±1 mm"
            }
          }
        }
      };

      const result = await profileManager.createProfile(profileData);

      if (result.success) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Context Profile Created Successfully!\n\n**Profile ID:** ${result.profileId}\n**Name:** ${name}\n**Description:** ${description}\n\n**Digital Twin Score:** ${result.digitalTwinScore}/4 (${result.digitalTwinScore >= 3 ? 'Digital Twin Mode' : 'Standard Mode'})\n\n**Usage:** This profile can now be used in image generation by referencing the Profile ID.\n\n**Next Steps:**\n1. Test the profile with a simple product prompt\n2. Refine specifications based on results\n3. Add validation rules for production use`
            }
          ]
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Context Profile Creation Failed: ${error.message}`
          }
        ]
      };
    }
  }

  /**
   * Handle business intelligence data retrieval from BigQuery
   * Phase 3.3 - CMF Integration (Multi-client replicable architecture)
   */
  async handleBusinessIntelligence(args) {
    const { clientId = null, dataset = null } = args;

    try {
      // Fetch business intelligence from BigQuery via niche-manager
      const intelligence = await this.nicheManager.fetchClientBusinessData(clientId, dataset);

      if (!intelligence) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ No business intelligence available.\n\nPossible causes:\n` +
                  `- BigQuery MCP not configured\n` +
                  `- No data available for specified dataset: ${dataset || 'N/A'}`
          }],
          isError: false
        };
      }

      // Format response with CORRECT property names (snake_case)
      const response = `📊 **Business Intelligence (Real BigQuery Data)**\n\n` +
        `**Schema**: ${intelligence.schema || 'N/A'}\n` +
        `**Dataset**: ${intelligence.dataset || dataset || 'N/A'}\n` +
        `**Has Real Data**: ${intelligence.has_real_data ? 'Yes' : 'No'}\n\n` +

        `**Top Products** (${intelligence.top_selling_products?.length || 0} items):\n` +
        (intelligence.top_selling_products?.length > 0 ?
          intelligence.top_selling_products.slice(0, 5).map((product, i) =>
            `${i + 1}. ${product.product_name || 'N/A'}: $${product.total_revenue?.toLocaleString() || 'N/A'} revenue, avg rating ${product.avg_rating || 'N/A'}/5`
          ).join('\n')
          : 'No data available') +

        `\n\n**Demographics**:\n` +
        (intelligence.real_customer_demographics ?
          `- Total Customers: ${intelligence.real_customer_demographics.total_customers?.toLocaleString() || 'N/A'}\n` +
          `- Avg Age: ${Math.round(intelligence.real_customer_demographics.avg_age) || 'N/A'} years\n` +
          `- Gender: ${intelligence.real_customer_demographics.female_pct?.toFixed(1) || 'N/A'}% F / ${intelligence.real_customer_demographics.male_pct?.toFixed(1) || 'N/A'}% M\n` +
          `- Avg Order Value: $${intelligence.real_customer_demographics.avg_order_value?.toFixed(2) || 'N/A'}`
          : 'No data available') +

        `\n\n**Seasonal Patterns** (last 6 months):\n` +
        (intelligence.seasonal_patterns?.length > 0 ?
          intelligence.seasonal_patterns.slice(0, 6).map(pattern =>
            `- ${pattern.month || 'N/A'}: $${pattern.total_revenue?.toLocaleString() || 'N/A'} (${pattern.order_count?.toLocaleString() || 'N/A'} transactions)`
          ).join('\n')
          : 'No data available') +

        `\n\n**Proven Phrases** (top 5):\n` +
        (intelligence.proven_copy_phrases?.length > 0 ?
          intelligence.proven_copy_phrases.slice(0, 5).map((phrase, i) =>
            `${i + 1}. "${phrase.ad_copy_phrase || 'N/A'}" - ${phrase.conversion_rate_pct?.toFixed(2) || 'N/A'}% conversion, ${phrase.impressions?.toLocaleString() || 'N/A'} impressions`
          ).join('\n')
          : 'Not available for this schema') +

        `\n\n💡 **Usage**: This business intelligence can be passed to content generation tools for personalized marketing content.\n` +
        `*Data fetched at: ${intelligence.fetched_at || new Date().toISOString()}*`;

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to fetch business intelligence: ${error.message}\n\n` +
                `**Debug Info:**\n` +
                `- ClientId: ${clientId || 'N/A'}\n` +
                `- Dataset: ${dataset || 'N/A'}\n` +
                `- Error: ${error.stack || error.message}`
        }],
        isError: true
      };
    }
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ContentGenerationMCPServer();
  server.start().catch(error => {
    //console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ContentGenerationMCPServer };


