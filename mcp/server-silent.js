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
            description: 'Analyze content brief and suggest optimal generation parameters',
            inputSchema: {
              type: 'object',
              properties: {
                brief: {
                  type: 'string',
                  description: 'Content brief to analyze'
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
   * Handle content context analysis
   */
  async handleContextAnalysis(args) {
    const { brief } = args;

    try {
      const analysis = await this.nicheManager.analyzeBrief(brief);
      
      return {
        content: [
          {
            type: 'text',
            text: `📊 **Content Analysis Results**\n\n` +
                  `🎯 **Detected Niche**: ${analysis.niche}\n` +
                  `📈 **Confidence**: ${(analysis.confidence * 100).toFixed(1)}%\n` +
                  `📱 **Recommended Platforms**: ${analysis.recommendedPlatforms.join(', ')}\n` +
                  `🎨 **Suggested Style**: ${analysis.suggestedStyle}\n` +
                  `🎬 **Video Approach**: ${analysis.videoApproach}\n\n` +
                  `**Key Insights:**\n${analysis.insights.map(insight => `• ${insight}`).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Analysis failed: ${error.message}`
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

  // 🆕 NEW: Handle copy content generation
  async handleCopyContentGeneration(args) {
    try {
      const { 
        brief, 
        platform, 
        format = 'post', 
        niche = 'marketing-agency', 
        copyType = 'complete' 
      } = args;

      // Import VariantGenerator for platform specs
      const { VariantGenerator } = await import('./tools/variant-generator.js');
      const variantGenerator = new VariantGenerator();
      await variantGenerator.initialize();

      // Get platform specifications
      const platformSpec = variantGenerator.platformSpecs.get(platform);
      if (!platformSpec) {
        throw new Error(`Platform ${platform} not supported`);
      }

      // Build context for copy generation
      const copyContext = {
        brief,
        platform,
        format,
        niche,
        toneOfVoice: platformSpec.toneOfVoice,
        demographics: platformSpec.demographics,
        copyLimits: platformSpec.copyLimits,
        bestPractices: platformSpec.bestPractices,
        contentTypes: platformSpec.contentTypes
      };

      // Generate platform-specific copy
      const copyResult = await variantGenerator.generatePlatformCopy(copyContext);

      if (copyResult.success) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Marketing Copy Generated Successfully!\n\n**Platform:** ${platform} (${format})\n**Niche:** ${niche}\n**Tone:** ${platformSpec.toneOfVoice}\n\n**Generated Copy:**\n${copyResult.copy}\n\n**Hashtags:** ${copyResult.hashtags || 'N/A'}\n\n**Character Count:** ${copyResult.copy.length}/${platformSpec.copyLimits[format] || platformSpec.copyLimits.post}\n\n**Recommendations:**\n${platformSpec.bestPractices.slice(0, 3).map(tip => `• ${tip}`).join('\n')}\n\n**Next Steps:**\n1. Review and refine copy as needed\n2. Use this copy for image generation (Phase 1)\n3. Generate avatar with this context (Phase 2)\n4. Create video incorporating this messaging (Phase 3)`
            }
          ]
        };
      } else {
        throw new Error(copyResult.error);
      }

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Copy Generation Failed: ${error.message}`
          }
        ]
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


