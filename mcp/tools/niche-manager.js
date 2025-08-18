/**
 * Niche Manager - Industry-specific context detection and management
 * Provides auto-detection of industry niches and optimal context application
 */

import { promises as fs } from 'fs';
import path from 'path';

export class NicheManager {
  constructor() {
    this.niches = new Map();
    this.initialized = false;
    this.nichesDir = path.join(process.cwd(), 'mcp', 'niches');
  }

  async initialize() {
    if (this.initialized) return;

    //console.log('🎯 Initializing Niche Manager...');
    
    try {
      // Ensure niches directory exists
      await fs.mkdir(this.nichesDir, { recursive: true });
      
      // Load or create niche definitions
      await this.loadNicheDefinitions();
      
      this.initialized = true;
      ////console.log(`✅ Niche Manager initialized with ${this.niches.size} niches`);
    } catch (error) {
      //console.error('❌ Failed to initialize Niche Manager:', error);
      throw error;
    }
  }

  async loadNicheDefinitions() {
    const nicheDefinitions = [
      {
        id: 'marketing-agency',
        name: 'Marketing Agency',
        keywords: ['marketing', 'agency', 'brand', 'campaign', 'advertising', 'promotion', 'client', 'strategy'],
        targetAudience: 'Business professionals and decision makers',
        keyMessaging: ['professional excellence', 'proven results', 'strategic thinking', 'creative solutions'],
        visualStyle: 'modern professional, clean lines, corporate colors',
        optimalPlatforms: ['linkedin', 'x-twitter', 'facebook'],
        bestPractices: [
          'Focus on ROI and measurable results',
          'Use professional imagery and clean layouts',
          'Emphasize expertise and case studies',
          'Include clear call-to-actions'
        ],
        trends: [
          'Data-driven marketing approaches',
          'Personalized content strategies',
          'Multi-channel campaign integration'
        ]
      },
      {
        id: 'e-commerce',
        name: 'E-commerce',
        keywords: ['shop', 'buy', 'product', 'sale', 'discount', 'store', 'online', 'retail', 'purchase'],
        targetAudience: 'Online shoppers and consumers',
        keyMessaging: ['quality products', 'competitive prices', 'fast shipping', 'customer satisfaction'],
        visualStyle: 'clean product photography, bright colors, lifestyle contexts',
        optimalPlatforms: ['instagram', 'facebook', 'tiktok'],
        bestPractices: [
          'High-quality product images with multiple angles',
          'Clear pricing and shipping information',
          'Customer reviews and social proof',
          'Easy checkout process promotion'
        ],
        trends: [
          'Social commerce integration',
          'AR/VR product visualization',
          'Sustainable and eco-friendly messaging'
        ]
      },
      {
        id: 'real-estate',
        name: 'Real Estate',
        keywords: ['property', 'house', 'home', 'apartment', 'real estate', 'buy', 'sell', 'rent', 'investment'],
        targetAudience: 'Property buyers, sellers, and investors',
        keyMessaging: ['prime locations', 'investment opportunity', 'dream home', 'professional service'],
        visualStyle: 'architectural photography, warm lighting, lifestyle imagery',
        optimalPlatforms: ['facebook', 'instagram', 'linkedin'],
        bestPractices: [
          'Professional property photography',
          'Virtual tours and 360° views',
          'Local market expertise emphasis',
          'Testimonials from satisfied clients'
        ],
        trends: [
          'Virtual reality property tours',
          'Drone photography for exteriors',
          'Smart home technology highlights'
        ]
      },
      {
        id: 'fitness',
        name: 'Fitness & Health',
        keywords: ['fitness', 'gym', 'workout', 'health', 'training', 'exercise', 'nutrition', 'wellness'],
        targetAudience: 'Health-conscious individuals and fitness enthusiasts',
        keyMessaging: ['transform your body', 'achieve your goals', 'healthy lifestyle', 'expert guidance'],
        visualStyle: 'dynamic action shots, motivational imagery, before/after transformations',
        optimalPlatforms: ['instagram', 'tiktok', 'youtube'],
        bestPractices: [
          'Show real transformations and results',
          'Include workout demonstrations',
          'Emphasize community and support',
          'Use motivational and inspiring language'
        ],
        trends: [
          'Home workout solutions',
          'Wearable technology integration',
          'Mental health and wellness focus'
        ]
      },
      {
        id: 'food-beverage',
        name: 'Food & Beverage',
        keywords: ['food', 'restaurant', 'menu', 'drink', 'recipe', 'cuisine', 'dining', 'chef', 'delicious'],
        targetAudience: 'Food enthusiasts and potential diners',
        keyMessaging: ['fresh ingredients', 'authentic flavors', 'culinary excellence', 'memorable experience'],
        visualStyle: 'appetizing food photography, warm colors, lifestyle dining scenes',
        optimalPlatforms: ['instagram', 'tiktok', 'facebook'],
        bestPractices: [
          'High-quality food photography with proper lighting',
          'Show preparation process and behind-the-scenes',
          'Highlight unique ingredients or techniques',
          'Include customer dining experiences'
        ],
        trends: [
          'Plant-based and sustainable options',
          'Interactive cooking content',
          'Local sourcing and farm-to-table'
        ]
      },
      {
        id: 'auto',
        name: 'Automotive',
        keywords: ['car', 'auto', 'vehicle', 'drive', 'automotive', 'dealer', 'service', 'parts', 'maintenance'],
        targetAudience: 'Car buyers and automotive enthusiasts',
        keyMessaging: ['reliability', 'performance', 'innovation', 'value'],
        visualStyle: 'sleek vehicle photography, dynamic angles, lifestyle driving scenes',
        optimalPlatforms: ['facebook', 'instagram', 'youtube'],
        bestPractices: [
          'Showcase vehicle features and technology',
          'Include performance specifications',
          'Show vehicles in attractive settings',
          'Emphasize safety and reliability'
        ],
        trends: [
          'Electric vehicle adoption',
          '360° vehicle viewing experiences',
          'Autonomous driving features'
        ]
      }
    ];

    // Save each niche definition and load into memory
    for (const niche of nicheDefinitions) {
      const filePath = path.join(this.nichesDir, `${niche.id}.json`);
      
      try {
        // Check if file exists, if not create it
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(filePath, JSON.stringify(niche, null, 2));
        ////console.log(`📝 Created niche definition: ${niche.id}`);
      }
      
      // Load into memory
      this.niches.set(niche.id, niche);
    }
  }

  /**
   * Auto-detect niche from brief content
   */
  async detectNiche(brief) {
    const briefLower = brief.toLowerCase();
    const nicheScores = new Map();

    // Score each niche based on keyword matches
    for (const [nicheId, niche] of this.niches) {
      let score = 0;
      
      for (const keyword of niche.keywords) {
        if (briefLower.includes(keyword)) {
          score += 1;
        }
      }
      
      // Normalize score by number of keywords
      const normalizedScore = score / niche.keywords.length;
      nicheScores.set(nicheId, normalizedScore);
    }

    // Find the highest scoring niche
    let bestNiche = 'marketing-agency'; // default
    let bestScore = 0;

    for (const [nicheId, score] of nicheScores) {
      if (score > bestScore) {
        bestNiche = nicheId;
        bestScore = score;
      }
    }

    //console.log(`🎯 Auto-detected niche: ${bestNiche} (confidence: ${(bestScore * 100).toFixed(1)}%)`);
    
    return bestNiche;
  }

  /**
   * Analyze brief and provide recommendations
   */
  async analyzeBrief(brief) {
    const detectedNiche = await this.detectNiche(brief);
    const nicheData = this.niches.get(detectedNiche);
    
    if (!nicheData) {
      throw new Error(`Niche ${detectedNiche} not found`);
    }

    // Calculate confidence based on keyword matches
    const briefLower = brief.toLowerCase();
    let matches = 0;
    for (const keyword of nicheData.keywords) {
      if (briefLower.includes(keyword)) {
        matches++;
      }
    }
    const confidence = matches / nicheData.keywords.length;

    // Determine video approach based on niche
    const videoApproaches = {
      'marketing-agency': 'Professional presentation with data visualization',
      'e-commerce': 'Product showcase with lifestyle context',
      'real-estate': 'Property tour with ambient narration',
      'fitness': 'Dynamic workout demonstration',
      'food-beverage': 'Appetizing close-ups with preparation process',
      'auto': 'Vehicle showcase with performance highlights'
    };

    return {
      niche: detectedNiche,
      confidence,
      recommendedPlatforms: nicheData.optimalPlatforms,
      suggestedStyle: nicheData.visualStyle,
      videoApproach: videoApproaches[detectedNiche] || 'General presentation style',
      insights: [
        `Target audience: ${nicheData.targetAudience}`,
        `Key messaging should focus on: ${nicheData.keyMessaging.slice(0, 2).join(' and ')}`,
        `Visual style should be: ${nicheData.visualStyle}`,
        `Best performing platforms: ${nicheData.optimalPlatforms.join(', ')}`
      ]
    };
  }

  /**
   * Get detailed insights for a specific niche
   */
  async getNicheInsights(nicheId) {
    const niche = this.niches.get(nicheId);
    
    if (!niche) {
      throw new Error(`Niche ${nicheId} not found`);
    }

    return {
      id: niche.id,
      name: niche.name,
      targetAudience: niche.targetAudience,
      keyMessaging: niche.keyMessaging,
      visualStyle: niche.visualStyle,
      optimalPlatforms: niche.optimalPlatforms,
      bestPractices: niche.bestPractices,
      trends: niche.trends,
      keywords: niche.keywords
    };
  }

  /**
   * Get optimal context profile for a niche
   */
  async getOptimalContextProfile(nicheId) {
    // This would integrate with existing context profiles system
    // For now, return a mock structure
    const niche = this.niches.get(nicheId);
    
    if (!niche) {
      return null;
    }

    return {
      id: `${nicheId}_optimal_profile`,
      name: `${niche.name} Optimal Profile`,
      context: {
        user_preferences: {
          style: niche.visualStyle,
          target_audience: niche.targetAudience
        },
        project_context: {
          niche: nicheId,
          key_messaging: niche.keyMessaging
        },
        technical_preferences: {
          platforms: niche.optimalPlatforms,
          quality: 'ultra-high'
        }
      }
    };
  }

  /**
   * Learn from successful content generation
   */
  async updateNicheFromSuccess(nicheId, brief, results, feedback) {
    const niche = this.niches.get(nicheId);
    
    if (!niche) {
      //console.warn(`Cannot update unknown niche: ${nicheId}`);
      return;
    }

    // Extract new keywords from successful brief
    const briefWords = brief.toLowerCase().split(/\s+/);
    const newKeywords = briefWords.filter(word => 
      word.length > 3 && 
      !niche.keywords.includes(word) &&
      /^[a-z]+$/.test(word) // Only alphabetic words
    );

    if (newKeywords.length > 0) {
      niche.keywords.push(...newKeywords.slice(0, 3)); // Add up to 3 new keywords
      
      // Save updated niche
      const filePath = path.join(this.nichesDir, `${nicheId}.json`);
      await fs.writeFile(filePath, JSON.stringify(niche, null, 2));
      
      //console.log(`📈 Updated niche ${nicheId} with new keywords: ${newKeywords.join(', ')}`);
    }
  }

  /**
   * Get all available niches
   */
  getAllNiches() {
    return Array.from(this.niches.values()).map(niche => ({
      id: niche.id,
      name: niche.name,
      targetAudience: niche.targetAudience,
      optimalPlatforms: niche.optimalPlatforms
    }));
  }

  /**
   * Get niche statistics
   */
  getNicheStats() {
    const stats = {};
    
    for (const [nicheId, niche] of this.niches) {
      stats[nicheId] = {
        keywordsCount: niche.keywords.length,
        platformsCount: niche.optimalPlatforms.length,
        messagingPoints: niche.keyMessaging.length,
        bestPracticesCount: niche.bestPractices.length
      };
    }

    return {
      totalNiches: this.niches.size,
      niches: stats
    };
  }
}


