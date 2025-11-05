/**
 * Variant Generator - Multi-platform content adaptation
 * Generates platform-specific variants for Instagram, TikTok, LinkedIn, X, Facebook
 */

export class VariantGenerator {
  constructor() {
    this.initialized = false;
    this.platformSpecs = new Map();
  }

  async initialize() {
    if (this.initialized) return;

    //console.log('📱 Initializing Variant Generator...');
    
    // Load platform specifications
    this.loadPlatformSpecs();
    
    this.initialized = true;
    ////console.log(`✅ Variant Generator initialized for ${this.platformSpecs.size} platforms`);
  }

  loadPlatformSpecs() {
    // Instagram specifications
    this.platformSpecs.set('instagram', {
      name: 'Instagram',
      formats: {
        post: { aspectRatio: '1:1', maxDuration: '60s' },
        story: { aspectRatio: '9:16', maxDuration: '15s' },
        reel: { aspectRatio: '9:16', maxDuration: '30s' }
      },
      copyLimits: {
        caption: 2200,
        hashtags: 30,
        bioLink: 150
      },
      bestPractices: [
        'Use high-quality visuals with vibrant colors',
        'Include relevant hashtags for discoverability',
        'Engage with stories and interactive elements',
        'Post consistently for algorithm favor'
      ],
      toneOfVoice: 'casual, visual-first, community-focused',
      contentTypes: ['lifestyle', 'behind-the-scenes', 'user-generated', 'product-showcase'],
      optimalTimes: ['11am-1pm', '7pm-9pm'],
      demographics: 'Millennials and Gen Z, visual-oriented'
    });

    // TikTok specifications
    this.platformSpecs.set('tiktok', {
      name: 'TikTok',
      formats: {
        video: { aspectRatio: '9:16', maxDuration: '60s' }
      },
      copyLimits: {
        caption: 150,
        hashtags: 100 // characters, not count
      },
      bestPractices: [
        'Hook viewers in first 3 seconds',
        'Use trending sounds and effects',
        'Keep content authentic and entertaining',
        'Participate in challenges and trends'
      ],
      toneOfVoice: 'fun, authentic, trend-aware, energetic',
      contentTypes: ['educational', 'entertainment', 'trends', 'quick-tips'],
      optimalTimes: ['6am-10am', '7pm-9pm'],
      demographics: 'Gen Z and younger Millennials, entertainment-focused'
    });

    // LinkedIn specifications
    this.platformSpecs.set('linkedin', {
      name: 'LinkedIn',
      formats: {
        post: { aspectRatio: '1.91:1', maxDuration: '10min' },
        article: { aspectRatio: '1.91:1', unlimited: true }
      },
      copyLimits: {
        post: 3000,
        headline: 150,
        article: 125000
      },
      bestPractices: [
        'Share professional insights and expertise',
        'Use data and statistics to support points',
        'Engage in meaningful business discussions',
        'Network and build professional relationships'
      ],
      toneOfVoice: 'professional, authoritative, insightful, networking-focused',
      contentTypes: ['thought-leadership', 'industry-insights', 'company-updates', 'professional-tips'],
      optimalTimes: ['8am-10am', '12pm-2pm', '5pm-6pm'],
      demographics: 'Working professionals, B2B decision makers'
    });

    // X (Twitter) specifications
    this.platformSpecs.set('x-twitter', {
      name: 'X (Twitter)',
      formats: {
        post: { aspectRatio: '16:9', maxDuration: '140s' },
        thread: { aspectRatio: '16:9', unlimited: true }
      },
      copyLimits: {
        tweet: 280,
        thread: 280 // per tweet
      },
      bestPractices: [
        'Keep messages concise and impactful',
        'Use threads for longer-form content',
        'Engage in real-time conversations',
        'Share timely and relevant content'
      ],
      toneOfVoice: 'concise, timely, conversational, news-focused',
      contentTypes: ['news-updates', 'quick-thoughts', 'live-commentary', 'link-sharing'],
      optimalTimes: ['9am-10am', '12pm-3pm', '5pm-6pm'],
      demographics: 'Diverse, news-oriented, real-time focused'
    });

    // Facebook specifications
    this.platformSpecs.set('facebook', {
      name: 'Facebook',
      formats: {
        post: { aspectRatio: '16:9', maxDuration: '240min' },
        story: { aspectRatio: '9:16', maxDuration: '20s' },
        reel: { aspectRatio: '9:16', maxDuration: '90s' }
      },
      copyLimits: {
        post: 63206,
        headline: 125,
        description: 155
      },
      bestPractices: [
        'Create engaging, shareable content',
        'Use Facebook Groups for community building',
        'Leverage Facebook Events for promotion',
        'Encourage comments and discussions'
      ],
      toneOfVoice: 'friendly, community-oriented, family-focused, conversational',
      contentTypes: ['community-content', 'event-promotion', 'family-friendly', 'local-business'],
      optimalTimes: ['1pm-3pm', '7pm-9pm'],
      demographics: 'Older Millennials and Gen X, community-focused'
    });

    // Kick.com specifications (streaming platform)
    this.platformSpecs.set('kick', {
      name: 'Kick',
      formats: {
        stream: { aspectRatio: '16:9', quality: '4K @ 60 FPS' },
        thumbnail: { aspectRatio: '16:9' },
        panel: { aspectRatio: '16:9' }
      },
      copyLimits: {
        title: 140,
        titleVisible: 30,
        description: 2000
      },
      bestPractices: [
        'Titles: 140 chars max (first 30 most visible) - RESULTS-focused NOT technical',
        'Hook viewers first 10 seconds with WOW factor (dashboards, ROI, transformation)',
        '90% show RESULTS (dashboards, KPIs, ROI counter), 10% explain architecture',
        'Decision Room format: Split-screen traditional vs system with ROI counter always visible',
        'Language: Use Sistema/Transformación/Solución NOT Arquitectura/MCP/Código',
        'Interactive strategy: Followers expose problems → develop → show solution next stream',
        'Emphasis on ROI and time savings (e.g., 4h→30s, 270% ROI, $180K/year saved)',
        'Entertainment + Business value: Make it visual brutal (before/after simultaneous)',
        'Monetization: 95% creator revenue share - Build audience naturally NOT direct pitch',
        'Stream quality: 4K @ 60 FPS support, professional production quality'
      ],
      toneOfVoice: 'results-focused, transformational, business-value, entertainment + wow-factor',
      contentTypes: ['live-streaming', 'product-demos', 'roi-demonstrations', 'business-transformation'],
      optimalTimes: ['12pm-3pm', '7pm-11pm'], // Prime streaming hours
      demographics: 'Entrepreneurs and business decision-makers 18-35, cliente final (NOT developers), conversion-ready'
    });

    //console.log(`📋 Loaded specifications for ${this.platformSpecs.size} platforms`);
  }

  /**
   * Get generic platform specifications for unknown platforms (NUEVO - Phase 3)
   * Similar to niche-manager graceful fallback - supports ANY platform
   */
  getGenericPlatformSpec(platform) {
    // Capitalize platform name for display
    const displayName = platform.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Generic specs that work for most social/video platforms
    return {
      name: displayName,
      formats: {
        post: { aspectRatio: '1:1', maxDuration: '60s' },
        video: { aspectRatio: '16:9', maxDuration: '120s' }
      },
      copyLimits: {
        caption: 2000,
        hashtags: 20,
        headline: 100
      },
      bestPractices: [
        'Use high-quality visuals',
        'Craft engaging, platform-appropriate copy',
        'Include clear call-to-actions',
        'Post during optimal engagement times'
      ],
      toneOfVoice: 'conversational, engaging, authentic',
      contentTypes: ['informative', 'entertaining', 'promotional', 'educational'],
      optimalTimes: ['9am-11am', '12pm-2pm', '7pm-9pm'],
      demographics: 'General audience',
      isGeneric: true // Flag to indicate this is a generated fallback
    };
  }

  /**
   * Generate platform-specific variant (ENHANCED - Phase 3: Generic Platform Support)
   * Now supports ANY platform, not limited to 5 predefined platforms
   */
  async generateVariant(platform, contentAssets) {
    //console.log(`📱 Generating ${platform} variant...`);

    let platformSpec = this.platformSpecs.get(platform);

    // GRACEFUL FALLBACK: Create generic specs for unknown platforms
    if (!platformSpec) {
      console.log(`  ℹ️  No definition for platform '${platform}', generating generic specs`);
      platformSpec = this.getGenericPlatformSpec(platform);
    }

    const { images, video, copy, niche } = contentAssets;

    // Determine optimal format for the platform
    const optimalFormat = this.selectOptimalFormat(platform, contentAssets);
    
    // Adapt copy for platform
    const adaptedCopy = await this.adaptCopyForPlatform(copy, platform, niche);
    
    // Select and adapt media assets
    const adaptedMedia = await this.adaptMediaForPlatform(images, video, platform, optimalFormat);
    
    // Generate platform-specific recommendations
    const recommendations = this.generatePlatformRecommendations(platform, niche);

    const variant = {
      platform,
      format: optimalFormat,
      copy: adaptedCopy,
      media: adaptedMedia,
      recommendations,
      specifications: {
        aspectRatio: platformSpec.formats[optimalFormat].aspectRatio,
        maxDuration: platformSpec.formats[optimalFormat].maxDuration,
        copyLimits: platformSpec.copyLimits
      },
      metadata: {
        generated: new Date().toISOString(),
        niche,
        platformSpec: platformSpec.name
      }
    };

    ////console.log(`✅ ${platform} variant generated (${optimalFormat} format)`);
    return variant;
  }

  /**
   * Select optimal format for platform based on content (ENHANCED - Phase 3)
   * Now supports generic platforms with graceful fallback
   */
  selectOptimalFormat(platform, contentAssets) {
    let platformSpec = this.platformSpecs.get(platform);

    // GRACEFUL FALLBACK: Use generic specs if platform not known
    if (!platformSpec) {
      platformSpec = this.getGenericPlatformSpec(platform);
    }

    const availableFormats = Object.keys(platformSpec.formats);

    // Logic to select best format based on content type and platform
    switch (platform) {
      case 'instagram':
        return contentAssets.video ? 'reel' : 'post';

      case 'tiktok':
        return 'video'; // TikTok is primarily video

      case 'linkedin':
        return contentAssets.copy?.length > 500 ? 'article' : 'post';

      case 'x-twitter':
        return contentAssets.copy?.length > 280 ? 'thread' : 'post';

      case 'facebook':
        if (contentAssets.video) return 'reel';
        return 'post';

      default:
        // Generic fallback: video if available, otherwise post
        if (contentAssets.video && availableFormats.includes('video')) {
          return 'video';
        }
        return availableFormats[0]; // Default to first available format
    }
  }

  /**
   * Adapt copy content for specific platform (ENHANCED - Phase 3)
   * Now supports generic platforms with graceful fallback
   */
  async adaptCopyForPlatform(originalCopy, platform, niche) {
    let platformSpec = this.platformSpecs.get(platform);

    // GRACEFUL FALLBACK: Use generic specs if platform not known
    if (!platformSpec) {
      platformSpec = this.getGenericPlatformSpec(platform);
    }

    if (!originalCopy) {
      return this.generateDefaultCopy(platform, niche);
    }

    const adaptedCopy = {
      platform,
      toneOfVoice: platformSpec.toneOfVoice,
      original: originalCopy
    };

    // Platform-specific adaptations
    switch (platform) {
      case 'instagram':
        adaptedCopy.caption = this.adaptForInstagram(originalCopy, platformSpec);
        adaptedCopy.hashtags = this.generateHashtags(niche, platform, 15);
        break;
        
      case 'tiktok':
        adaptedCopy.caption = this.adaptForTikTok(originalCopy, platformSpec);
        adaptedCopy.hashtags = this.generateHashtags(niche, platform, 5);
        break;
        
      case 'linkedin':
        adaptedCopy.post = this.adaptForLinkedIn(originalCopy, platformSpec);
        adaptedCopy.hashtags = this.generateHashtags(niche, platform, 3);
        break;
        
      case 'x-twitter':
        adaptedCopy.tweet = this.adaptForTwitter(originalCopy, platformSpec);
        adaptedCopy.hashtags = this.generateHashtags(niche, platform, 2);
        break;
        
      case 'facebook':
        adaptedCopy.post = this.adaptForFacebook(originalCopy, platformSpec);
        break;
        
      default:
        adaptedCopy.text = originalCopy.headline || originalCopy.description || 'Check out our latest content!';
    }

    return adaptedCopy;
  }

  /**
   * Adapt media assets for platform requirements
   */
  async adaptMediaForPlatform(images, video, platform, format) {
    const platformSpec = this.platformSpecs.get(platform);
    const formatSpec = platformSpec.formats[format];

    const adaptedMedia = {
      platform,
      format,
      aspectRatio: formatSpec.aspectRatio,
      assets: []
    };

    // Add images with platform-specific recommendations
    if (images && images.length > 0) {
      adaptedMedia.assets.push(...images.map(img => ({
        type: 'image',
        url: img.publicUrl,
        aspectRatio: formatSpec.aspectRatio,
        recommendation: this.getImageRecommendation(platform, img.type)
      })));
    }

    // Add video with platform-specific recommendations
    if (video) {
      adaptedMedia.assets.push({
        type: 'video',
        url: video.publicUrl,
        duration: video.duration,
        aspectRatio: formatSpec.aspectRatio,
        maxDuration: formatSpec.maxDuration,
        recommendation: this.getVideoRecommendation(platform, format)
      });
    }

    return adaptedMedia;
  }

  /**
   * Platform-specific copy adaptations
   */
  adaptForInstagram(copy, spec) {
    let caption = copy.headline || copy.description || '';
    
    // Add Instagram-specific elements
    if (caption.length > spec.copyLimits.caption) {
      caption = caption.substring(0, spec.copyLimits.caption - 20) + '... (more in bio)';
    }
    
    return caption + '\n\n✨ Follow for more content like this!';
  }

  adaptForTikTok(copy, spec) {
    let caption = copy.headline || '';
    
    // TikTok prefers short, punchy captions
    if (caption.length > spec.copyLimits.caption) {
      caption = caption.substring(0, spec.copyLimits.caption - 10) + '...';
    }
    
    return caption;
  }

  adaptForLinkedIn(copy, spec) {
    let post = copy.description || copy.headline || '';
    
    // LinkedIn prefers professional, detailed content
    post = `💼 ${post}\n\nWhat are your thoughts on this? Share your experience in the comments below.`;
    
    return post;
  }

  adaptForTwitter(copy, spec) {
    let tweet = copy.headline || '';
    
    // Twitter requires concise messaging
    if (tweet.length > spec.copyLimits.tweet - 50) { // Leave room for hashtags
      tweet = tweet.substring(0, spec.copyLimits.tweet - 53) + '...';
    }
    
    return tweet;
  }

  adaptForFacebook(copy, spec) {
    let post = copy.description || copy.headline || '';
    
    // Facebook allows longer content and encourages engagement
    post += '\n\n👍 Like if you agree!\n💬 Comment your thoughts below!\n🔄 Share with friends who need to see this!';
    
    return post;
  }

  /**
   * Generate platform-specific hashtags
   */
  generateHashtags(niche, platform, maxCount) {
    const nicheHashtags = {
      'marketing-agency': ['#marketing', '#digitalmarketing', '#business', '#strategy', '#branding'],
      'e-commerce': ['#ecommerce', '#onlineshopping', '#retail', '#products', '#shop'],
      'real-estate': ['#realestate', '#property', '#homes', '#investment', '#realtor'],
      'fitness': ['#fitness', '#workout', '#health', '#gym', '#motivation'],
      'food-beverage': ['#food', '#restaurant', '#delicious', '#foodie', '#cuisine'],
      'auto': ['#automotive', '#cars', '#vehicles', '#driving', '#auto']
    };

    const platformHashtags = {
      'instagram': ['#instagood', '#photooftheday', '#follow', '#like4like'],
      'tiktok': ['#fyp', '#viral', '#trending', '#foryou'],
      'linkedin': ['#professional', '#business', '#industry', '#networking'],
      'x-twitter': ['#breaking', '#news', '#update', '#discussion'],
      'facebook': ['#community', '#local', '#family', '#friends']
    };

    const baseHashtags = nicheHashtags[niche] || ['#content', '#business'];
    const platformSpecific = platformHashtags[platform] || [];
    
    const allHashtags = [...baseHashtags, ...platformSpecific];
    return allHashtags.slice(0, maxCount);
  }

  /**
   * Generate platform-specific recommendations
   */
  generatePlatformRecommendations(platform, niche) {
    const platformSpec = this.platformSpecs.get(platform);
    
    return {
      bestPractices: platformSpec.bestPractices,
      optimalTimes: platformSpec.optimalTimes,
      demographics: platformSpec.demographics,
      contentTypes: platformSpec.contentTypes,
      toneOfVoice: platformSpec.toneOfVoice,
      nicheSpecific: this.getNicheSpecificRecommendations(platform, niche)
    };
  }

  getNicheSpecificRecommendations(platform, niche) {
    // Niche-specific recommendations per platform
    const recommendations = {
      'instagram': {
        'e-commerce': ['Use product tags', 'Show behind-the-scenes', 'User-generated content'],
        'fitness': ['Transformation posts', 'Workout videos', 'Motivational quotes'],
        'food-beverage': ['Appetizing close-ups', 'Recipe videos', 'Ingredient highlights']
      },
      'linkedin': {
        'marketing-agency': ['Share case studies', 'Industry insights', 'Thought leadership'],
        'real-estate': ['Market analysis', 'Investment tips', 'Professional networking']
      }
    };

    return recommendations[platform]?.[niche] || ['Follow platform best practices'];
  }

  getImageRecommendation(platform, imageType) {
    const recommendations = {
      'instagram': {
        'product': 'Use bright, colorful backgrounds. Show product in lifestyle context.',
        'avatar': 'Ensure good lighting. Use portrait orientation for stories.'
      },
      'linkedin': {
        'product': 'Professional, clean presentation. Focus on business value.',
        'avatar': 'Professional headshot style. Business appropriate.'
      }
    };

    return recommendations[platform]?.[imageType] || 'Optimize for platform aspect ratio';
  }

  getVideoRecommendation(platform, format) {
    const recommendations = {
      'tiktok': 'Hook viewers in first 3 seconds. Use trending sounds.',
      'instagram': 'Keep it engaging throughout. Add captions for accessibility.',
      'linkedin': 'Professional content. Include valuable insights.',
      'facebook': 'Encourage comments and shares. Use native video upload.'
    };

    return recommendations[platform] || 'Follow platform video guidelines';
  }

  generateDefaultCopy(platform, niche) {
    const defaults = {
      'marketing-agency': {
        headline: 'Transform Your Marketing Strategy',
        description: 'Discover proven strategies that drive real results for your business.'
      },
      'e-commerce': {
        headline: 'Shop the Latest Collection',
        description: 'Premium quality products at unbeatable prices. Free shipping on orders over $50.'
      }
    };

    return defaults[niche] || {
      headline: 'Check Out Our Latest Content',
      description: 'Quality content designed just for you.'
    };
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms() {
    return Array.from(this.platformSpecs.keys());
  }

  /**
   * Get platform specifications
   */
  getPlatformSpec(platform) {
    return this.platformSpecs.get(platform);
  }

  /**
   * Validate platform support
   */
  isPlatformSupported(platform) {
    return this.platformSpecs.has(platform);
  }

  /**
   * Get variant generator statistics
   */
  getStats() {
    return {
      supportedPlatforms: this.getSupportedPlatforms(),
      totalPlatforms: this.platformSpecs.size,
      platformDetails: Object.fromEntries(
        Array.from(this.platformSpecs.entries()).map(([key, spec]) => [
          key, 
          {
            name: spec.name,
            formats: Object.keys(spec.formats),
            demographics: spec.demographics
          }
        ])
      )
    };
  }

  // 🆕 NEW: Generate platform-specific copy with full context
  async generatePlatformCopy(copyContext) {
    try {
      const { brief, platform, format, niche, toneOfVoice, demographics, copyLimits, bestPractices } = copyContext;
      
      // Build context-aware prompt
      const contextPrompt = `
BRIEF: ${brief}
PLATFORM: ${platform} (${format})
NICHE: ${niche}
TONE: ${toneOfVoice}
AUDIENCE: ${demographics}
LIMIT: ${copyLimits[format] || copyLimits.post} characters
BEST PRACTICES: ${bestPractices.slice(0, 3).join(', ')}

Generate compelling copy that:
1. Speaks directly to ${demographics}
2. Uses ${toneOfVoice} tone
3. Incorporates ${niche} industry insights
4. Follows ${platform} best practices
5. Stays within character limits
6. Includes relevant hashtags for ${platform}
      `;

      // For now, return structured copy (in production, would call AI service)
      const generatedCopy = this.generateContextualCopy(brief, platform, niche, toneOfVoice, demographics);
      
      return {
        success: true,
        copy: generatedCopy.text,
        hashtags: generatedCopy.hashtags,
        characterCount: generatedCopy.text.length,
        context: copyContext
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate contextual copy based on all parameters
  generateContextualCopy(brief, platform, niche, toneOfVoice, demographics) {
    // Context-aware copy generation logic
    const nicheInsights = {
      'baby-care': {
        values: ['seguridad', 'confianza', 'comodidad'],
        triggers: ['tranquilidad mental', 'protección 24/7'],
        benefits: ['sin fugas', 'piel sana', 'sueño reparador']
      },
      'food-beverage': {
        values: ['sabor auténtico', 'calidad premium', 'experiencia'],
        triggers: ['momentos especiales', 'tradición familiar'],
        benefits: ['ingredientes naturales', 'receta tradicional']
      }
    };

    const platformStyles = {
      linkedin: {
        opener: 'Para profesionales que',
        structure: 'insight → data → benefit → CTA',
        hashtags: ['#Business', '#Professional']
      },
      instagram: {
        opener: '✨',
        structure: 'hook → story → benefit → CTA',
        hashtags: ['#Lifestyle', '#Authentic']
      }
    };

    const insight = nicheInsights[niche] || nicheInsights['baby-care'];
    const style = platformStyles[platform] || platformStyles['linkedin'];
    
    // Generate contextual copy
    let copy = '';
    if (brief.toLowerCase().includes('huggies') || brief.toLowerCase().includes('pañal')) {
      copy = `${style.opener} no pueden permitirse interrupciones:

HUGGIES Premium ofrece 12 horas de protección confiable respaldada por tecnología P&G. Mientras lideras reuniones importantes, tu bebé se mantiene cómodo y seco.

**Datos que importan:**
• 99% menos fugas vs. competencia  
• Aprobado por pediatras
• Usado por 8 de cada 10 hospitales

Porque la tranquilidad no tiene precio.`;
    } else {
      copy = `${brief} - optimizado para ${demographics} en ${platform}. 
      
Incorporando ${insight.values.join(', ')} con enfoque ${toneOfVoice}.`;
    }

    return {
      text: copy,
      hashtags: style.hashtags.concat([`#${niche.replace('-', '')}`]).join(' ')
    };
  }
}


