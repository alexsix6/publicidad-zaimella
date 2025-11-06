/**
 * Scene Composer - Video scene generation and composition
 * Supports 3 modes: presentation, interaction, demonstration
 */

export class SceneComposer {
  constructor() {
    this.initialized = false;
    this.sceneTemplates = new Map();
  }

  async initialize() {
    if (this.initialized) return;

    //console.log('🎬 Initializing Scene Composer...');
    
    // Load scene templates
    this.loadSceneTemplates();
    
    this.initialized = true;
    //console.log('✅ Scene Composer initialized');
  }

  loadSceneTemplates() {
    // VEO3 OPTIMIZED TEMPLATES - Based on proven successful examples
    
    // Template 1: Cinematic Product Reveal (with avatar and dialogue)
    this.sceneTemplates.set('veo3_cinematic', {
      name: 'Veo3 Cinematic Reveal',
      maxWords: 250,
      structure: '[Shot Type] + [Subject + Action] + [Environment] + [Audio]',
      template: `{shotType} of {subject} {action} in {environment}.
{character}: "{dialogue}"
AUDIO: {audioDescription}
{visualDetails}
{cameraMovement}
{lighting}
Duration: 8-12 seconds.`,
      audioFormat: 'AUDIO: [description]',
      dialogueFormat: 'Character: "text"',
      cinematographyTerms: true
    });

    // Template 2: Magic Transformation (Corona style)
    this.sceneTemplates.set('veo3_transform', {
      name: 'Veo3 Magic Transform',
      maxWords: 200,
      structure: '[Initial State] + [Transformation] + [Final Result] + [Key Visuals]',
      template: `{shotType} showing {initialState}.
Magical transformation begins with {transformEffect}.
{product} transforms into {finalResult}.
AUDIO: {audioDescription}
{keyVisuals}
{environmentDetails}
Duration: 8-10 seconds.`,
      audioFormat: 'AUDIO: [description]',
      transformationFocus: true,
      cinematographyTerms: true
    });

    // Template 3: Tech Innovation Reveal (Tesla style)
    this.sceneTemplates.set('veo3_tech', {
      name: 'Veo3 Tech Reveal',
      maxWords: 230,
      structure: '[Tech Setup] + [Innovation Moment] + [Benefits] + [Call to Action]',
      template: `{shotType} of {techSetup} in {environment}.
{innovationMoment} reveals {keyFeature}.
{benefits} demonstrated clearly.
AUDIO: {audioDescription}
{visualEffects}
{brandingElements}
Duration: 10-12 seconds.`,
      audioFormat: 'AUDIO: [description]',
      techFocus: true,
      cinematographyTerms: true
    });

    // Original presentation mode templates (maintained for compatibility)
    this.sceneTemplates.set('presentation', {
      'marketing-agency': {
        structure: 'professional_boardroom',
        cameraMovement: 'slow_zoom_in',
        lighting: 'corporate_bright',
        elements: ['charts', 'graphs', 'professional_presenter']
      },
      'e-commerce': {
        structure: 'product_showcase',
        cameraMovement: 'rotating_360',
        lighting: 'studio_bright',
        elements: ['product_highlight', 'lifestyle_context', 'price_display']
      },
      'real-estate': {
        structure: 'property_walkthrough',
        cameraMovement: 'smooth_dolly',
        lighting: 'natural_warm',
        elements: ['exterior_establishing', 'interior_highlights', 'neighborhood_context']
      },
      'fitness': {
        structure: 'transformation_showcase',
        cameraMovement: 'dynamic_cuts',
        lighting: 'motivational_bright',
        elements: ['before_after', 'workout_montage', 'results_focus']
      },
      'food-beverage': {
        structure: 'culinary_presentation',
        cameraMovement: 'appetizing_closeups',
        lighting: 'warm_inviting',
        elements: ['ingredient_focus', 'preparation_process', 'final_presentation']
      },
      'auto': {
        structure: 'vehicle_reveal',
        cameraMovement: 'cinematic_sweep',
        lighting: 'dramatic_automotive',
        elements: ['exterior_beauty', 'interior_features', 'performance_shots']
      }
    });

    // Interaction mode templates
    this.sceneTemplates.set('interaction', {
      'marketing-agency': {
        structure: 'client_consultation',
        cameraMovement: 'conversation_angles',
        lighting: 'professional_soft',
        elements: ['handshake', 'document_review', 'strategy_discussion']
      },
      'e-commerce': {
        structure: 'customer_experience',
        cameraMovement: 'user_journey',
        lighting: 'lifestyle_natural',
        elements: ['browsing_experience', 'product_interaction', 'satisfaction_moment']
      },
      'real-estate': {
        structure: 'agent_client_tour',
        cameraMovement: 'following_tour',
        lighting: 'natural_bright',
        elements: ['property_discussion', 'feature_pointing', 'decision_moment']
      },
      'fitness': {
        structure: 'trainer_client_session',
        cameraMovement: 'workout_follow',
        lighting: 'gym_dynamic',
        elements: ['exercise_demonstration', 'form_correction', 'encouragement']
      },
      'food-beverage': {
        structure: 'chef_customer_interaction',
        cameraMovement: 'kitchen_to_table',
        lighting: 'restaurant_warm',
        elements: ['cooking_demonstration', 'tasting_moment', 'satisfaction_reaction']
      },
      'auto': {
        structure: 'test_drive_experience',
        cameraMovement: 'driver_perspective',
        lighting: 'road_dynamic',
        elements: ['feature_explanation', 'driving_experience', 'satisfaction_confirmation']
      }
    });

    // Demonstration mode templates
    this.sceneTemplates.set('demonstration', {
      'marketing-agency': {
        structure: 'results_demonstration',
        cameraMovement: 'data_visualization',
        lighting: 'presentation_focused',
        elements: ['metrics_display', 'case_study_walkthrough', 'roi_emphasis']
      },
      'e-commerce': {
        structure: 'product_demonstration',
        cameraMovement: 'feature_focus',
        lighting: 'demonstration_clear',
        elements: ['unboxing_experience', 'feature_highlights', 'usage_scenarios']
      },
      'real-estate': {
        structure: 'property_features_demo',
        cameraMovement: 'feature_tour',
        lighting: 'feature_highlighting',
        elements: ['smart_home_features', 'space_utilization', 'amenity_showcase']
      },
      'fitness': {
        structure: 'workout_demonstration',
        cameraMovement: 'exercise_focus',
        lighting: 'instructional_clear',
        elements: ['proper_form_demo', 'progression_levels', 'safety_tips']
      },
      'food-beverage': {
        structure: 'recipe_demonstration',
        cameraMovement: 'step_by_step',
        lighting: 'cooking_instructional',
        elements: ['ingredient_prep', 'technique_demonstration', 'plating_artistry']
      },
      'auto': {
        structure: 'feature_demonstration',
        cameraMovement: 'feature_closeup',
        lighting: 'technical_clear',
        elements: ['technology_showcase', 'performance_metrics', 'safety_features']
      }
    });

    //console.log(`📋 Loaded ${this.sceneTemplates.size} scene mode templates`);
  }

  /**
   * Compose video scene based on configuration
   * ENHANCED: Now with strategic frameworks (avatar, mechanism, offer)
   */
  async composeScene(config) {
    const { mode = 'presentation', niche, productImage, avatarImage, style, brief, enhancedBrief, keyMessaging, targetAudience, avatarProfile, mechanism, offer } = config;

    ////console.log(`🎬 Composing ${mode} scene for ${niche} niche with strategic frameworks`);

    // Get template for the mode and niche
    const modeTemplates = this.sceneTemplates.get(mode);
    const template = modeTemplates?.[niche] || modeTemplates?.['marketing-agency']; // fallback

    if (!template) {
      throw new Error(`No template found for mode: ${mode}, niche: ${niche}`);
    }

    // Build scene composition WITH campaign context + strategic frameworks
    const scene = {
      mode,
      niche,
      template: template.structure,
      prompt: await this.buildScenePrompt(template, config), // Now includes frameworks
      technical: {
        cameraMovement: template.cameraMovement,
        lighting: template.lighting,
        elements: template.elements
      },
      assets: {
        productImage,
        avatarImage
      },
      // ✅ ENHANCED: Metadata about context AND frameworks used
      contextUsed: {
        hasBrief: !!brief,
        hasKeyMessaging: !!keyMessaging,
        hasTargetAudience: !!targetAudience,
        hasAvatarProfile: !!avatarProfile,
        hasMechanism: !!mechanism,
        hasOffer: !!offer
      }
    };

    ////console.log(`✅ Scene composed: ${scene.template} with ${scene.technical.elements.length} elements`);
    return scene;
  }

  /**
   * Build detailed scene prompt for video generation
   * ENHANCED: Now with strategic frameworks (avatar, mechanism, offer)
   */
  async buildScenePrompt(template, config) {
    const { niche, style, productImage, avatarImage, brief, enhancedBrief, keyMessaging, targetAudience, avatarProfile, mechanism, offer } = config;

    // ✅ EXTRACT PRODUCT CONTEXT from brief
    const productContext = this.extractProductContext(brief, enhancedBrief, keyMessaging);

    // Base scene description
    let prompt = `${template.structure.replace(/_/g, ' ')}, `;

    // ✅ ADD PRODUCT/CAMPAIGN CONTEXT (if available)
    if (productContext.productName) {
      prompt += `featuring ${productContext.productName}, `;
    }

    if (productContext.keyBenefit) {
      prompt += `showcasing ${productContext.keyBenefit}, `;
    }

    // ✅ ADD UNIQUE MECHANISM (if available)
    if (mechanism && mechanism.mechanism_variants && mechanism.mechanism_variants.length > 0) {
      const topMechanism = mechanism.mechanism_variants[0];
      const mechanismName = topMechanism.name || 'innovative solution';
      prompt += `demonstrating ${mechanismName}, `;
    }

    // ✅ ADD AVATAR PROFILE PSYCHOGRAPHICS (if available)
    if (avatarProfile && avatarProfile.pain_points_and_desires) {
      const dreamOutcome = avatarProfile.pain_points_and_desires.dream_outcome?.description;
      if (dreamOutcome) {
        prompt += `visualizing transformation: ${dreamOutcome}, `;
      }
    }

    // Add lighting
    prompt += `${template.lighting.replace(/_/g, ' ')} lighting, `;

    // Add camera movement
    prompt += `${template.cameraMovement.replace(/_/g, ' ')} camera movement, `;

    // Add style
    if (style) {
      prompt += `${style} visual style, `;
    }

    // ✅ ADD TARGET AUDIENCE CONTEXT (enhanced with avatar profile)
    if (avatarProfile) {
      const demographics = avatarProfile.demographics || {};
      const ageRange = demographics.age_range || '';
      const gender = demographics.gender || '';
      if (ageRange && gender) {
        prompt += `appealing to ${gender} ${ageRange}, `;
      }
    } else if (targetAudience) {
      const audienceTone = this.getAudienceTone(targetAudience);
      if (audienceTone) {
        prompt += `${audienceTone} tone for target audience, `;
      }
    }

    // Add niche-specific elements
    const elementDescriptions = template.elements.map(element =>
      this.getElementDescription(element, niche)
    ).join(', ');

    prompt += elementDescriptions;

    // ✅ ADD KEY MESSAGING (if available and space permits)
    if (productContext.keyMessage && prompt.length < 400) {
      prompt += `, emphasizing: ${productContext.keyMessage}`;
    }

    // Add technical video specifications
    prompt += ', professional video quality, 8 seconds duration, cinematic composition';

    // Ensure prompt is under 500 characters for Veo 3
    if (prompt.length > 480) {
      prompt = prompt.substring(0, 477) + '...';
    }

    return prompt;
  }

  /**
   * Extract product context from brief and messaging
   */
  extractProductContext(brief, enhancedBrief, keyMessaging) {
    const context = {
      productName: null,
      keyBenefit: null,
      keyMessage: null
    };

    // Try to extract product name from brief (simple heuristic)
    if (brief) {
      // Look for patterns like "our [product]", "the [product]", "presenting [product]"
      const productMatch = brief.match(/(?:our|the|presenting|introducing|new)\s+([a-zA-Z0-9\s-]{3,30})(?:\s+is|\s+that|\s+which|,|\.)/i);
      if (productMatch) {
        context.productName = productMatch[1].trim();
      }
    }

    // Extract key benefit from keyMessaging
    if (keyMessaging && Array.isArray(keyMessaging) && keyMessaging.length > 0) {
      context.keyBenefit = keyMessaging[0]; // First key message
      if (keyMessaging.length > 1) {
        context.keyMessage = keyMessaging[1]; // Second key message
      }
    } else if (typeof keyMessaging === 'string') {
      context.keyBenefit = keyMessaging;
    }

    // Fallback: Extract from enhancedBrief
    if (!context.keyBenefit && enhancedBrief) {
      // Look for benefit patterns
      const benefitMatch = enhancedBrief.match(/(?:benefit|advantage|feature|solve|provide|deliver)(?:s)?:?\s+([^.,!?]{10,60})/i);
      if (benefitMatch) {
        context.keyBenefit = benefitMatch[1].trim();
      }
    }

    return context;
  }

  /**
   * Get tone based on target audience
   */
  getAudienceTone(targetAudience) {
    if (!targetAudience) return null;

    const audienceStr = typeof targetAudience === 'string'
      ? targetAudience.toLowerCase()
      : JSON.stringify(targetAudience).toLowerCase();

    // Map audience characteristics to video tone
    if (audienceStr.includes('professional') || audienceStr.includes('executive') || audienceStr.includes('b2b')) {
      return 'professional and authoritative';
    } else if (audienceStr.includes('young') || audienceStr.includes('millennial') || audienceStr.includes('gen z')) {
      return 'energetic and modern';
    } else if (audienceStr.includes('luxury') || audienceStr.includes('premium') || audienceStr.includes('high-end')) {
      return 'elegant and sophisticated';
    } else if (audienceStr.includes('family') || audienceStr.includes('parent')) {
      return 'warm and trustworthy';
    }

    return null; // No specific tone override
  }

  /**
   * Get description for scene elements
   */
  getElementDescription(element, niche) {
    const descriptions = {
      // General elements
      'charts': 'business charts and graphs displayed',
      'graphs': 'performance metrics visualization',
      'professional_presenter': 'confident business professional presenting',
      
      // Product elements
      'product_highlight': 'product prominently featured and well-lit',
      'lifestyle_context': 'product shown in real-life usage scenario',
      'price_display': 'pricing information clearly visible',
      
      // Real estate elements
      'exterior_establishing': 'beautiful property exterior establishing shot',
      'interior_highlights': 'key interior spaces showcased',
      'neighborhood_context': 'surrounding neighborhood and amenities',
      
      // Fitness elements
      'before_after': 'transformation results comparison',
      'workout_montage': 'dynamic exercise sequence',
      'results_focus': 'emphasis on achieved fitness goals',
      
      // Food elements
      'ingredient_focus': 'fresh, high-quality ingredients featured',
      'preparation_process': 'skilled cooking techniques demonstrated',
      'final_presentation': 'beautifully plated finished dish',
      
      // Auto elements
      'exterior_beauty': 'sleek vehicle exterior design highlighted',
      'interior_features': 'premium interior details showcased',
      'performance_shots': 'dynamic driving performance captured',
      
      // Interaction elements
      'handshake': 'professional greeting and agreement',
      'document_review': 'collaborative document examination',
      'strategy_discussion': 'engaged strategic conversation',
      'browsing_experience': 'intuitive product browsing',
      'product_interaction': 'hands-on product engagement',
      'satisfaction_moment': 'customer satisfaction and joy',
      
      // Demonstration elements
      'metrics_display': 'clear performance metrics shown',
      'case_study_walkthrough': 'successful project examples',
      'roi_emphasis': 'return on investment highlighted',
      'unboxing_experience': 'exciting product unboxing moment',
      'feature_highlights': 'key product features demonstrated',
      'usage_scenarios': 'practical product applications shown'
    };

    return descriptions[element] || element.replace(/_/g, ' ');
  }

  /**
   * Get available scene modes
   */
  getAvailableModes() {
    return Array.from(this.sceneTemplates.keys());
  }

  /**
   * Get template details for a specific mode and niche
   */
  getTemplateDetails(mode, niche) {
    const modeTemplates = this.sceneTemplates.get(mode);
    return modeTemplates?.[niche] || null;
  }

  /**
   * Validate scene configuration
   */
  validateSceneConfig(config) {
    const { mode, niche } = config;
    
    const errors = [];
    
    if (!mode) {
      errors.push('Scene mode is required');
    } else if (!this.sceneTemplates.has(mode)) {
      errors.push(`Invalid scene mode: ${mode}. Available modes: ${this.getAvailableModes().join(', ')}`);
    }
    
    if (!niche) {
      errors.push('Niche is required for scene composition');
    }
    
    if (mode && niche) {
      const modeTemplates = this.sceneTemplates.get(mode);
      if (!modeTemplates?.[niche]) {
        //console.warn(`No specific template for ${mode}/${niche}, will use fallback`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * VEO3 SPECIFIC METHODS - Optimized for Veo3 API requirements
   */

  /**
   * Compose Veo3-optimized scene with Spanish → English pipeline
   */
  async composeVeo3Scene(spanishPrompt, options = {}) {
    const {
      niche = 'higiene-personal',
      template = 'veo3_cinematic',
      includeDialogue = false,
      audioSync = true
    } = options;

    ////console.log(`🎬 Composing Veo3 scene: "${spanishPrompt}"`);
    //console.log(`🎯 Template: ${template}, Niche: ${niche}`);

    // Parse Spanish intent
    const intent = this.parseSpanishIntent(spanishPrompt);
    
    // Get Veo3 template
    const veo3Template = this.sceneTemplates.get(template);
    if (!veo3Template) {
      throw new Error(`Veo3 template ${template} not found`);
    }

    // Apply niche-specific enhancements
    const nicheEnhancements = this.getVeo3NicheEnhancements(niche);
    
    // Build Veo3-optimized prompt
    const veo3Prompt = this.buildVeo3Prompt(intent, veo3Template, nicheEnhancements, {
      includeDialogue,
      audioSync
    });

    // Validate against Veo3 requirements
    const validation = this.validateVeo3Requirements(veo3Prompt);

    const scene = {
      mode: 'veo3_optimized',
      template: template,
      niche: niche,
      originalSpanish: spanishPrompt,
      finalPrompt: veo3Prompt.prompt,
      audioInstructions: veo3Prompt.audio,
      dialogue: veo3Prompt.dialogue,
      validation: validation,
      metadata: {
        wordCount: veo3Prompt.prompt.split(' ').length,
        hasDialogue: includeDialogue,
        audioSync: audioSync,
        cinematographyTerms: veo3Template.cinematographyTerms
      }
    };

    ////console.log(`✅ Veo3 scene composed (${scene.metadata.wordCount} words)`);
    return scene;
  }

  /**
   * Parse Spanish intent for Veo3 processing
   */
  parseSpanishIntent(spanishPrompt) {
    const intent = {
      product: null,
      action: null,
      character: null,
      emotion: null,
      environment: null,
      dialogue: null
    };

    // Product detection
    const productKeywords = {
      'pañal': 'diaper product',
      'consultoría': 'consulting services',
      'comida': 'food product',
      'tecnología': 'tech innovation',
      'producto': 'product'
    };

    // Action detection
    const actionKeywords = {
      'presentar': 'present professionally',
      'mostrar': 'showcase elegantly',
      'revelar': 'reveal dramatically',
      'transformar': 'transform magically',
      'demostrar': 'demonstrate clearly'
    };

    // Character detection
    const characterKeywords = {
      'avatar': 'professional presenter',
      'presentador': 'skilled presenter',
      'experto': 'industry expert',
      'consultor': 'business consultant'
    };

    // Extract intent
    for (const [spanish, english] of Object.entries(productKeywords)) {
      if (spanishPrompt.toLowerCase().includes(spanish)) {
        intent.product = english;
        break;
      }
    }

    for (const [spanish, english] of Object.entries(actionKeywords)) {
      if (spanishPrompt.toLowerCase().includes(spanish)) {
        intent.action = english;
        break;
      }
    }

    for (const [spanish, english] of Object.entries(characterKeywords)) {
      if (spanishPrompt.toLowerCase().includes(spanish)) {
        intent.character = english;
        break;
      }
    }

    // Detect dialogue request
    if (spanishPrompt.includes('hablando') || spanishPrompt.includes('diciendo') || spanishPrompt.includes('explicando')) {
      intent.dialogue = 'requested';
    }

    return intent;
  }

  /**
   * Get Veo3 niche-specific enhancements
   */
  getVeo3NicheEnhancements(niche) {
    const enhancements = {
      'higiene-personal': {
        style: 'clean, medical-grade, trustworthy',
        lighting: 'bright, clinical, soft shadows',
        colors: 'white, light blue, mint green',
        environment: 'clean bathroom, medical facility, spa-like setting',
        audioTone: 'professional, reassuring, gentle',
        shotTypes: ['Close-up product shot', 'Medium shot of presenter', 'Wide establishing shot'],
        cameraMovements: ['Smooth dolly in', 'Gentle pan', 'Static professional framing']
      },
      'consultoria': {
        style: 'corporate, modern, confident',
        lighting: 'professional office lighting, warm undertones',
        colors: 'navy blue, gray, white, gold accents',
        environment: 'modern office, conference room, executive setting',
        audioTone: 'authoritative, professional, trustworthy',
        shotTypes: ['Medium two-shot', 'Over-shoulder conversation', 'Wide conference room'],
        cameraMovements: ['Professional pan', 'Confident push-in', 'Steady corporate framing']
      },
      'alimentacion': {
        style: 'vibrant, appetizing, warm',
        lighting: 'warm, golden hour, food photography lighting',
        colors: 'warm oranges, rich browns, fresh greens',
        environment: 'kitchen, restaurant, dining setting, market',
        audioTone: 'inviting, warm, enthusiastic',
        shotTypes: ['Extreme close-up food', 'Medium chef shot', 'Wide kitchen scene'],
        cameraMovements: ['Appetizing close-up dolly', 'Warm pan across ingredients', 'Inviting pull-back reveal']
      },
      'tecnologia': {
        style: 'futuristic, sleek, innovative',
        lighting: 'cool LED lighting, blue tones, dramatic shadows',
        colors: 'electric blue, silver, black, neon accents',
        environment: 'tech lab, modern office, futuristic setting',
        audioTone: 'cutting-edge, confident, inspiring',
        shotTypes: ['Dynamic tracking shot', 'Tech reveal close-up', 'Futuristic wide shot'],
        cameraMovements: ['Tech-inspired dolly', 'Innovative crane movement', 'Sleek tracking shot']
      }
    };

    return enhancements[niche] || enhancements['higiene-personal'];
  }

  /**
   * Build Veo3-optimized prompt
   */
  buildVeo3Prompt(intent, template, nicheEnhancements, options) {
    const { includeDialogue, audioSync } = options;

    // Select appropriate shot type based on intent and niche
    const shotType = this.selectOptimalShotType(intent, nicheEnhancements);
    const cameraMovement = this.selectOptimalCameraMovement(intent, nicheEnhancements);

    // Build prompt using template
    let prompt = template.template;

    // Replace placeholders with specific content
    const replacements = {
      '{shotType}': shotType,
      '{subject}': intent.product || 'product',
      '{action}': intent.action || 'being presented',
      '{environment}': nicheEnhancements.environment.split(',')[0].trim(),
      '{character}': intent.character || 'professional presenter',
      '{dialogue}': includeDialogue ? this.generateSpanishDialogue(intent, nicheEnhancements) : '',
      '{audioDescription}': this.generateAudioDescription(nicheEnhancements, audioSync),
      '{visualDetails}': this.generateVisualDetails(nicheEnhancements),
      '{cameraMovement}': cameraMovement,
      '{lighting}': nicheEnhancements.lighting.split(',')[0].trim(),
      '{initialState}': `${intent.product || 'product'} in standard presentation`,
      '{transformEffect}': 'cinematic lighting transition with magical sparkle effects',
      '{finalResult}': `premium ${intent.product || 'product'} with enhanced appeal`,
      '{keyVisuals}': nicheEnhancements.colors,
      '{environmentDetails}': nicheEnhancements.environment,
      '{techSetup}': `modern ${intent.product || 'technology'} demonstration setup`,
      '{innovationMoment}': 'cutting-edge technology activation',
      '{keyFeature}': `revolutionary ${intent.product || 'feature'} capabilities`,
      '{benefits}': 'clear advantages and superior performance',
      '{visualEffects}': 'sleek tech animations with professional polish',
      '{brandingElements}': 'subtle brand integration with premium aesthetic'
    };

    // Apply replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Ensure prompt is under 250 words
    const words = prompt.split(' ');
    if (words.length > 250) {
      prompt = words.slice(0, 247).join(' ') + '...';
    }

    return {
      prompt: prompt.trim(),
      audio: replacements['{audioDescription}'],
      dialogue: replacements['{dialogue}'],
      wordCount: prompt.split(' ').length
    };
  }

  /**
   * Select optimal shot type based on intent and niche
   */
  selectOptimalShotType(intent, nicheEnhancements) {
    const shotTypes = nicheEnhancements.shotTypes;
    
    // Logic based on intent
    if (intent.product && intent.product.includes('diaper')) {
      return shotTypes[0]; // Close-up for products
    } else if (intent.character) {
      return shotTypes[1]; // Medium shot for presenters
    } else {
      return shotTypes[2] || shotTypes[0]; // Wide or fallback to first
    }
  }

  /**
   * Select optimal camera movement
   */
  selectOptimalCameraMovement(intent, nicheEnhancements) {
    const movements = nicheEnhancements.cameraMovements;
    
    if (intent.action && intent.action.includes('reveal')) {
      return movements[0]; // Dynamic for reveals
    } else if (intent.action && intent.action.includes('present')) {
      return movements[1]; // Smooth for presentations
    } else {
      return movements[2] || movements[0]; // Static or fallback
    }
  }

  /**
   * Generate Spanish dialogue (preserved as requested)
   */
  generateSpanishDialogue(intent, nicheEnhancements) {
    const dialogues = {
      'diaper product': 'Presenter: "La máxima protección y suavidad para tu bebé"',
      'consulting services': 'Expert: "Transformamos tu negocio con estrategias innovadoras"',
      'food product': 'Chef: "Sabores auténticos que despiertan tus sentidos"',
      'tech innovation': 'Innovator: "La tecnología del futuro, disponible hoy"'
    };

    return dialogues[intent.product] || 'Presenter: "Descubre la excelencia en cada detalle"';
  }

  /**
   * Generate audio description with sync instructions
   */
  generateAudioDescription(nicheEnhancements, audioSync) {
    let audioDesc = `Professional ${nicheEnhancements.audioTone} narration with subtle background music`;
    
    if (audioSync) {
      audioDesc += ', synchronized audio timing for optimal lip-sync';
    }
    
    audioDesc += ', clear pronunciation emphasizing key product benefits';
    
    return audioDesc;
  }

  /**
   * Generate visual details
   */
  generateVisualDetails(nicheEnhancements) {
    return `${nicheEnhancements.style} visual approach with ${nicheEnhancements.colors} color palette, professional composition`;
  }

  /**
   * Validate against Veo3 requirements
   */
  validateVeo3Requirements(veo3Prompt) {
    const validation = {
      wordCount: veo3Prompt.wordCount <= 250,
      hasAudioTag: veo3Prompt.prompt.includes('AUDIO:'),
      hasCinematography: /shot|camera|lighting/i.test(veo3Prompt.prompt),
      hasDialogueFormat: veo3Prompt.dialogue ? veo3Prompt.prompt.includes(':') && veo3Prompt.prompt.includes('"') : true,
      hasEnvironment: /environment|setting|location/i.test(veo3Prompt.prompt),
      hasDuration: veo3Prompt.prompt.includes('Duration:')
    };

    const passedChecks = Object.values(validation).filter(Boolean).length;
    const totalChecks = Object.keys(validation).length;

    return {
      ...validation,
      score: passedChecks / totalChecks,
      passed: passedChecks >= totalChecks * 0.8,
      summary: `${passedChecks}/${totalChecks} Veo3 requirements met`
    };
  }

  /**
   * Get available Veo3 templates
   */
  getVeo3Templates() {
    const veo3Templates = [];
    
    for (const [key, template] of this.sceneTemplates.entries()) {
      if (key.startsWith('veo3_')) {
        veo3Templates.push({
          id: key,
          name: template.name,
          maxWords: template.maxWords,
          structure: template.structure,
          audioFormat: template.audioFormat,
          features: {
            dialogueFormat: template.dialogueFormat || false,
            transformationFocus: template.transformationFocus || false,
            techFocus: template.techFocus || false,
            cinematographyTerms: template.cinematographyTerms || false
          }
        });
      }
    }

    return veo3Templates;
  }

  /**
   * Get scene composition statistics (enhanced)
   */
  getStats() {
    const stats = {
      totalModes: this.sceneTemplates.size,
      modesAvailable: Array.from(this.sceneTemplates.keys()),
      veo3Templates: this.getVeo3Templates().length,
      templatesPerMode: {}
    };

    for (const [mode, templates] of this.sceneTemplates) {
      if (typeof templates === 'object' && !templates.name) {
        stats.templatesPerMode[mode] = Object.keys(templates).length;
      } else {
        stats.templatesPerMode[mode] = 1; // Single template object
      }
    }

    return stats;
  }
}
