/**
 * Content Orchestrator - Main workflow engine for complete content generation
 * Implements the 9-step pipeline: Context → Images → Video → Copy → Variants
 */

import { ApiBridge } from '../adapters/api-bridge.js';
import { QdrantConnector } from '../adapters/qdrant-connector.js';
import { NicheManager } from './niche-manager.js';
import { SceneComposer } from './scene-composer.js';
import { VariantGenerator } from './variant-generator.js';
import { SkillDetector } from './skill-detector.js';
import { contextProfileManager } from '../../lib/context-profile-manager.js';
import { composeImages, getRecommendedLayout } from '../../lib/image-compositor.js';
import { composeSceneWithContext } from '../../lib/context-composer.js'; // 🔥 NEW: Context Coherence
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ContentOrchestrator {
  constructor() {
    this.apiBridge = new ApiBridge();
    this.qdrantConnector = new QdrantConnector();
    this.nicheManager = new NicheManager();
    this.sceneComposer = new SceneComposer();
    this.variantGenerator = new VariantGenerator();
    this.skillDetector = new SkillDetector();
    this.contextProfileManager = contextProfileManager;

    this.initialized = false;
    this.currentSession = null;
    this.skillsUsageLog = []; // Track skill usage
  }

  async initialize(sessionConfig) {
    if (!this.initialized) {
      //console.log("Initializing Content Orchestrator...");

      // Initialize all components (including SkillDetector and ContextProfileManager)
      await Promise.all([
        this.apiBridge.initialize(),
        this.qdrantConnector.initialize(),
        this.nicheManager.initialize(),
        this.sceneComposer.initialize(),
        this.variantGenerator.initialize(),
        this.skillDetector.initialize(),
        this.contextProfileManager.initialize()
      ]);

      this.initialized = true;
      //console.log('✅ Content Orchestrator initialized');

      // Log skills status
      const skillsStatus = this.skillDetector.getStatus();
      //console.log(`🎓 Skills available: ${skillsStatus.skillsAvailable} [${skillsStatus.skills.join(', ')}]`);

      // Log context profiles status
      const profilesList = this.contextProfileManager.listProfiles();
      //console.log(`📋 Context Profiles available: ${profilesList.length}`);
    }

    // Set up current session
    this.currentSession = {
      id: this.generateSessionId(),
      config: sessionConfig,
      startTime: Date.now(),
      steps: [],
      results: {}
    };

    //console.log(`🎯 Session initialized: ${this.currentSession.id}`);
    ////console.log(`📝 Brief: "${sessionConfig.brief}"`);
    //console.log(`🏷️ Niche: ${sessionConfig.niche}`);
    //console.log(`📱 Platforms: ${sessionConfig.platforms.join(', ')}`);
  }

  /**
   * Execute complete content generation pipeline (9 steps)
   */
  async generateCompleteContent() {
    if (!this.currentSession) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    const session = this.currentSession;
    const startTime = Date.now();

    try {
      console.log('🚀 Starting complete content generation pipeline...');

      // STEP 0: Context Profile Resolution (NEW - Phase 1)
      await this.executeStep('context_profile_resolution', async () => {
        let contextProfileId = session.config.contextProfileId;

        // Auto-select if not provided
        if (!contextProfileId) {
          console.log('🔍 No contextProfileId provided, attempting auto-selection...');
          const autoSelection = await this.contextProfileManager.autoSelectProfile(
            session.config.brief,
            'image'
          );

          if (autoSelection.success && autoSelection.profileId) {
            contextProfileId = autoSelection.profileId;
            //console.log(`✅ Auto-selected Context Profile: ${contextProfileId}`);
          } else {
            //console.log('⚠️ No Context Profile auto-selected, proceeding without profile');
            return {
              contextProfileId: null,
              profile: null,
              isDigitalTwin: false,
              brand_guidelines: {},
              platform_specifications: {}
            };
          }
        }

        // Load profile
        const profile = await this.contextProfileManager.loadProfile(contextProfileId);

        if (!profile) {
          //console.log(`⚠️ Context Profile ${contextProfileId} not found, proceeding without profile`);
          return {
            contextProfileId: null,
            profile: null,
            isDigitalTwin: false,
            brand_guidelines: {},
            platform_specifications: {}
          };
        }

        // Detect Digital Twin mode
        const isDigitalTwin = this.contextProfileManager.isDigitalTwinProfile(profile);

        if (isDigitalTwin) {
          //console.log(`🎯 Digital Twin mode detected - High-precision requirements enabled`);
        }

        return {
          contextProfileId,
          profile,
          isDigitalTwin,
          brand_guidelines: profile.context.brand_guidelines || {},
          platform_specifications: profile.context.platform_specifications || {},
          validation_rules: profile.context.validation_rules || {},
          product_specifications: profile.context.product_specifications || {}
        };
      });

      // STEP 1: Context Gathering
      await this.executeStep('context_gathering', async () => {
        return await this.gatherContext(session.config);
      });

      // STEP 2: Cache Check
      await this.executeStep('cache_check', async () => {
        return await this.checkSemanticCache(session.config.brief);
      });

      // STEP 3: Niche Context Application
      await this.executeStep('niche_context', async () => {
        return await this.applyNicheContext(session.config.niche, session.results.context_gathering);
      });

      // ✅ STEP 4: Customer Avatar Profile Generation (MOVED UP - Priority #1)
      // Generate strategic frameworks BEFORE visual assets
      await this.executeStep('customer_avatar_profile', async () => {
        return await this.generateCustomerAvatarProfile(session.config.brief, session.results.niche_context);
      });

      // ✅ STEP 5: Unique Mechanism Generation (MOVED UP - Priority #2)
      await this.executeStep('unique_mechanism', async () => {
        return await this.generateUniqueMechanism(
          session.config.brief,
          session.results.customer_avatar_profile,
          session.results.niche_context
        );
      });

      // ✅ STEP 6: Grand Slam Offer Generation (MOVED UP - Priority #3)
      await this.executeStep('grand_slam_offer', async () => {
        return await this.generateGrandSlamOffer(
          session.config.brief,
          session.results.customer_avatar_profile,
          session.results.unique_mechanism,
          session.config.pricing || { base_price: 149, currency: 'USD', billing_cycle: 'monthly' },
          session.results.niche_context
        );
      });

      // ✅ STEP 7: Copy Generation (MOVED UP - Priority #4) 🔥 NUEVO ORDER
      // Generate copy FIRST with Todd Brown hooks + Hormozi value stack
      await this.executeStep('copy_generation', async () => {
        return await this.generateCopyContent(
          session.config.brief,
          session.results.customer_avatar_profile,
          session.results.unique_mechanism,
          session.results.grand_slam_offer,
          session.results.niche_context
        );
      });

      // ✅ STEP 8: Product Image Generation (NOW WITH COPY CONTEXT) 🔥 NUEVO
      await this.executeStep('product_image', async () => {
        return await this.generateProductImage(
          session.results.niche_context,
          session.results.customer_avatar_profile,
          session.results.unique_mechanism,
          session.results.grand_slam_offer,
          session.results.copy_generation // 🔥 NEW: Copy context for visual alignment
        );
      });

      // ✅ STEP 9: Avatar/Person Image Generation (NOW WITH COPY CONTEXT) 🔥 NUEVO
      await this.executeStep('avatar_image', async () => {
        return await this.generateAvatarImage(
          session.results.niche_context,
          session.results.product_image,
          session.results.customer_avatar_profile,
          session.results.copy_generation // 🔥 NEW: Copy context for avatar scene
        );
      });

      // ✅ STEP 10: Video Scene Composition (NOW WITH COPY SCRIPT + LANGUAGE + DIGITAL TWIN) 🔥 NUEVO
      await this.executeStep('video_generation', async () => {
        // 🆕 PHASE 2: Detect language from brief
        const detectedLanguage = this.detectLanguageFromBrief(session.config.brief);

        // 🆕 PHASE 3: Get contextProfileId for Digital Twin support
        const contextProfileResolution = session.results.context_profile_resolution;
        const contextProfileId = contextProfileResolution?.contextProfileId || null;
        const isDigitalTwin = contextProfileResolution?.isDigitalTwin || false;

        if (contextProfileId && isDigitalTwin) {
          console.log(`  🎯 Digital Twin mode: ${contextProfileId} will be used for video`);
        }

        return await this.generateVideoContent(
          session.results.product_image,
          session.results.avatar_image,
          session.results.niche_context,
          session.config.brief,
          session.results.customer_avatar_profile,
          session.results.unique_mechanism,
          session.results.grand_slam_offer,
          session.results.copy_generation, // 🔥 Copy content for video script
          detectedLanguage, // 🆕 PHASE 2: Language parameter
          contextProfileId // 🆕 PHASE 3: Context Profile ID for Digital Twin
        );
      });

      // ✅ STEP 11: Landing Page Structure Generation (uses landing-page-structure skill)
      await this.executeStep('landing_page_structure', async () => {
        return await this.generateLandingPageStructure(
          session.config.brief,
          session.results.customer_avatar_profile,
          session.results.unique_mechanism,
          session.results.grand_slam_offer,
          session.results.copy_generation,
          session.results.niche_context
        );
      });

      // STEP 12: Platform Variants
      await this.executeStep('platform_variants', async () => {
        return await this.generatePlatformVariants(
          session.config.platforms,
          session.results
        );
      });

      // STEP 13: Cache Storage
      await this.executeStep('cache_storage', async () => {
        return await this.storeInSemanticCache(session.config.brief, session.results);
      });

      // Compile final results
      const finalResults = this.compileFinalResults(session);
      
      //console.log(`🎉 Content generation completed in ${Date.now() - startTime}ms`);
      return finalResults;

    } catch (error) {
      //console.error('❌ Content generation pipeline failed:', error);
      throw new Error(`Pipeline failed at step ${session.steps.length}: ${error.message}`);
    }
  }

  /**
   * Execute a pipeline step with error handling and logging
   * ENHANCED: Graceful degradation for optional steps (image/video services)
   */
  async executeStep(stepName, stepFunction) {
    const stepStartTime = Date.now();
    //console.log(`📍 Executing step: ${stepName}`);

    // OPTIONAL STEPS: Can fail gracefully without breaking pipeline
    // (image/video services may not be available in all environments)
    const optionalSteps = ['product_image', 'avatar_image', 'video_generation'];
    const isOptionalStep = optionalSteps.includes(stepName);

    try {
      const result = await stepFunction();
      const duration = Date.now() - stepStartTime;

      this.currentSession.steps.push({
        name: stepName,
        status: 'completed',
        duration,
        timestamp: new Date().toISOString()
      });

      this.currentSession.results[stepName] = result;
      ////console.log(`✅ Step ${stepName} completed in ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - stepStartTime;

      this.currentSession.steps.push({
        name: stepName,
        status: isOptionalStep ? 'skipped' : 'failed',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // GRACEFUL DEGRADATION: Optional steps can fail without breaking pipeline
      if (isOptionalStep) {
    console.log(`[WARN] Optional step ${stepName} skipped (service unavailable): ${error.message}`);
        this.currentSession.results[stepName] = null; // Mark as null but continue
        return null;
      }

      // CRITICAL STEPS: Must succeed, throw error to halt pipeline
      //console.error(`❌ Step ${stepName} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  /**
   * STEP 1: Context Gathering (Hybrid approach)
   */
  async gatherContext(config) {
    const { brief, contextGathering = 'hybrid' } = config;
    
    //console.log(`🔍 Gathering context using ${contextGathering} approach`);

    const context = {
      originalBrief: brief,
      gatheringMethod: contextGathering,
      timestamp: new Date().toISOString()
    };

    switch (contextGathering) {
      case 'proactive':
        // Ask strategic questions upfront
        context.questions = await this.generateProactiveQuestions(brief);
        break;
        
      case 'reactive':
        // Generate based on brief, ask questions as needed
        context.assumptions = await this.generateReactiveAssumptions(brief);
        break;
        
      case 'hybrid':
      default:
        // Combine both approaches
        context.questions = await this.generateProactiveQuestions(brief);
        context.assumptions = await this.generateReactiveAssumptions(brief);
        break;
    }

    return context;
  }

  /**
   * STEP 2: Semantic Cache Check
   */
  async checkSemanticCache(query) {
    ////console.log(`💾 Checking semantic cache for: "${query}"`);
    
    const cacheResult = await this.qdrantConnector.searchSimilar(query, 0.85);
    
    if (cacheResult.found && cacheResult.reusable) {
      //console.log(`🎯 Cache hit! Similarity: ${(cacheResult.score * 100).toFixed(1)}%`);
      return {
        hit: true,
        similarity: cacheResult.score,
        content: cacheResult.content,
        metadata: cacheResult.metadata,
        canReuse: true
      };
    }

    //console.log('📝 No suitable cached content found, proceeding with fresh generation');
    return { hit: false, canReuse: false };
  }

  /**
   * STEP 3: Apply Niche Context
   */
  async applyNicheContext(niche, gatheredContext) {
    //console.log(`🎯 Applying ${niche} niche context`);
    
    const nicheInsights = await this.nicheManager.getNicheInsights(niche);
    const contextProfile = await this.nicheManager.getOptimalContextProfile(niche);
    
    return {
      niche,
      insights: nicheInsights,
      contextProfile,
      enhancedBrief: await this.enhanceBriefWithNiche(gatheredContext.originalBrief, nicheInsights),
      targetAudience: nicheInsights.targetAudience,
      keyMessaging: nicheInsights.keyMessaging,
      visualStyle: nicheInsights.visualStyle
    };
  }

  /**
   * STEP 7: Product Image Generation (ENHANCED - Now with strategic frameworks)
   */
  async generateProductImage(nicheContext, avatarProfile = null, mechanism = null, offer = null, copyContent = null) {
    //console.log('🎨 Generating product image with strategic frameworks + copy alignment...');

    // 🔥 NEW: Align visual with copy strategy if available
    let productPrompt;
    if (copyContent && copyContent.variants && copyContent.variants.length > 0) {
      productPrompt = await this.alignVisualWithCopy(
        nicheContext,
        avatarProfile,
        mechanism,
        offer,
        copyContent
      );
    } else {
      // Fallback: Original prompt building without copy alignment
      productPrompt = await this.buildProductPrompt(nicheContext, avatarProfile, mechanism, offer);
    }

    const imageOptions = {
      model: 'flux-kontext', // Máxima calidad para productos
      aspectRatio: '1:1', // Square for product shots
      enhanceWithAI: true,
      contextProfileId: nicheContext.contextProfile?.id
    };

    const result = await this.apiBridge.generateImage(productPrompt, imageOptions);

    return {
      type: 'product',
      prompt: productPrompt,
      usedFrameworks: {
        avatar: !!avatarProfile,
        mechanism: !!mechanism,
        offer: !!offer
      },
      ...result
    };
  }

  /**
   * STEP 8: Avatar/Person Image Generation (ENHANCED - Now with avatar profile)
   */
  async generateAvatarImage(nicheContext, productImageResult = null, avatarProfile = null, copyContent = null) {
    //console.log('👤 Generating avatar image with avatar profile + copy alignment...');

    // NEW: Consider copy context for avatar scene if available
    const copyContext = copyContent && copyContent.variants ? copyContent.variants[0] : null;
    if (copyContext) {
      console.log(`  [INFO] Avatar scene aligned with copy hook: ${copyContext.hook_type || 'generic'}`);
    }

    const productImageRef = productImageResult?.localPath || null;
    const avatarPrompt = await this.buildAvatarPrompt(nicheContext, productImageRef, avatarProfile, copyContext);

    // Detect if trained model is requested
    const detectedModel = this.detectTrainedModel(nicheContext.enhancedBrief);
    //console.log(`🎯 Detected model for avatar: ${detectedModel}`);

    const imageOptions = {
      model: detectedModel, // Smart model selection
      aspectRatio: '9:16', // Portrait for social
      enhanceWithAI: true,
      contextProfileId: nicheContext.contextProfile?.id
    };

    const result = await this.apiBridge.generateImage(avatarPrompt, imageOptions);

    return {
      type: 'avatar',
      prompt: avatarPrompt,
      usedAvatarProfile: !!avatarProfile,
      ...result
    };
  }

  /**
   * STEP 9: Video Scene Composition (ENHANCED - Now with strategic frameworks + LANGUAGE + DIGITAL TWIN)
   * OPTIONAL COMPOSITION: Only combines product + avatar if avatarImage exists
   * Otherwise uses product image alone with brief context
   * NOW INCLUDES: Brief context + Avatar profile + Mechanism + Offer for persuasive videos + Language + Context Profile ID
   */
  async generateVideoContent(productImage, avatarImage, nicheContext, brief, avatarProfile = null, mechanism = null, offer = null, copyContent = null, language = 'es', contextProfileId = null) {
    const languageName = language === 'es' ? 'Español' : 'English';
    console.log(`🎬 Generating video content with strategic frameworks + copy script... (Language: ${languageName})${contextProfileId ? ` [Profile: ${contextProfileId}]` : ''}`);

    // 🔥 NEW: Generate video script from copy content if available
    let videoScript = null;
    if (copyContent && copyContent.variants && copyContent.variants.length > 0) {
      videoScript = this.generateVideoScript(
        copyContent,
        mechanism,
        offer,
        avatarProfile
      );
      console.log(`  [INFO] Video script generated from copy hook: ${videoScript.hook_type}`);
    }

    // 🔥 NEW: Compose unified context with strategic frameworks (CONTEXT COHERENCE)
    const composedContext = composeSceneWithContext({
      nicheContext: nicheContext,
      avatarProfile: avatarProfile,
      mechanism: mechanism,
      offer: offer,
      copyContent: copyContent,
      brief: brief,
      assetType: 'video',
      options: {
        basePrompt: '', // Will be built from context
        videoScript: videoScript
      }
    });

    console.log(`  ✅ Context coherence applied: ${composedContext.strategicElements ? Object.keys(composedContext.strategicElements).length : 0} elements unified`);

    // Use SceneComposer to create video scenes with strategic frameworks
    const sceneConfig = {
      mode: 'presentation', // presentation, interaction, demonstration
      productImage: productImage.publicUrl,
      avatarImage: avatarImage?.publicUrl || null, // Optional
      niche: nicheContext.niche,
      style: nicheContext.visualStyle,
      // ✅ Campaign context
      brief: brief, // Original brief
      enhancedBrief: nicheContext.enhancedBrief, // Brief + niche context
      keyMessaging: nicheContext.keyMessaging, // Key messages from niche
      targetAudience: nicheContext.targetAudience, // Target audience
      // ✅ NEW: Strategic frameworks for persuasive videos
      avatarProfile: avatarProfile, // Customer avatar profile
      mechanism: mechanism, // Unique mechanism
      offer: offer, // Grand slam offer
      // 🔥 NEW: Unified context from composer
      unifiedContext: composedContext.unifiedContext // Context Coherence
    };

    const videoScene = await this.sceneComposer.composeScene(sceneConfig);

    // 🔥 OVERRIDE PROMPT: Use context-composed prompt instead of scene-composer prompt
    const enhancedPrompt = composedContext.prompts.main || videoScene.prompt;

    // ✅ OPTIONAL COMPOSITION: Only if avatarImage exists
    if (avatarImage && avatarImage.publicUrl) {
      //console.log('  🎨 Avatar detected: Composing product + avatar images...');

      // Get recommended layout based on niche
      const layout = getRecommendedLayout(nicheContext);
      //console.log(`  📐 Using layout: ${layout}`);

      try {
        // Compose images using Sharp.js
        const composedBuffer = await composeImages(
          productImage.replicateUrl || productImage.publicUrl,
          avatarImage.replicateUrl || avatarImage.publicUrl,
          {
            layout: layout,
            aspectRatio: '16:9', // Video default
            width: 1920,
            height: 1080
          }
        );

        // Save composed image to public/generated/composed/
        const timestamp = Date.now();
        const composedFilename = `composed_${timestamp}.jpg`;
        const composedDir = path.join(__dirname, '../../public/generated/composed');

        // Ensure directory exists
        await fs.mkdir(composedDir, { recursive: true });

        const composedPath = path.join(composedDir, composedFilename);
        await fs.writeFile(composedPath, composedBuffer);

        // Construct public URL
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';
        const composedImageUrl = `${baseUrl}/generated/composed/${composedFilename}`;

        //console.log(`  ✅ Composed image saved: ${composedImageUrl}`);

        // Use composed image for video generation
        const videoOptions = {
          imageUrl: composedImageUrl, // ✅ COMPOSED IMAGE (product + avatar)
          videoStyle: 'cinematic',
          aspectRatio: '16:9',
          duration: '8s',
          enhanceWithAI: true,
          // 🔥 NEW: Include video script if available
          videoScript: videoScript, // Script with Todd Brown hooks + Hormozi frameworks
          // 🆕 PHASE 2: Language parameter
          language: language, // 'es' or 'en'
          // 🆕 PHASE 3: Context Profile ID for Digital Twin
          contextProfileId: contextProfileId // Digital Twin profile ID
        };

        // 🔥 USE CONTEXT-COMPOSED PROMPT (Context Coherence)
        const result = await this.apiBridge.generateVideo(enhancedPrompt, videoOptions);

        return {
          scene: videoScene,
          composedImage: {
            url: composedImageUrl,
            layout: layout,
            localPath: composedPath
          },
          usedFrameworks: {
            avatar: !!avatarProfile,
            mechanism: !!mechanism,
            offer: !!offer,
            copyScript: !!videoScript // 🔥 NEW: Track if copy script was used
          },
          videoScript: videoScript, // 🔥 NEW: Include script in response
          ...result
        };

      } catch (compositionError) {
        // Fallback: If composition fails, use product image only
        console.error(`  [WARN] Image composition failed: ${compositionError.message}`);
        //console.log(`  [WARN] Falling back to product image only`);

        const videoOptions = {
          imageUrl: productImage.replicateUrl || productImage.publicUrl,
          videoStyle: 'cinematic',
          aspectRatio: '16:9',
          duration: '8s',
          enhanceWithAI: true,
          // 🔥 NEW: Include video script if available
          videoScript: videoScript, // Script with Todd Brown hooks + Hormozi frameworks
          // 🆕 PHASE 2: Language parameter
          language: language, // 'es' or 'en'
          // 🆕 PHASE 3: Context Profile ID for Digital Twin
          contextProfileId: contextProfileId // Digital Twin profile ID
        };

        // 🔥 USE CONTEXT-COMPOSED PROMPT (Context Coherence)
        const result = await this.apiBridge.generateVideo(enhancedPrompt, videoOptions);

        return {
          scene: videoScene,
          compositionFailed: true,
          usedProductOnly: true,
          usedFrameworks: {
            avatar: !!avatarProfile,
            mechanism: !!mechanism,
            offer: !!offer,
            copyScript: !!videoScript // 🔥 NEW: Track if copy script was used
          },
          videoScript: videoScript, // 🔥 NEW: Include script in response
          ...result
        };
      }
    } else {
      // ✅ NO AVATAR: Use product image only (valid scenario)
      //console.log('  📦 Product-only video: Using product image with brief context');

      const videoOptions = {
        imageUrl: productImage.replicateUrl || productImage.publicUrl,
        videoStyle: 'cinematic',
        aspectRatio: '16:9',
        duration: '8s',
        enhanceWithAI: true,
        // 🔥 NEW: Include video script if available
        videoScript: videoScript, // Script with Todd Brown hooks + Hormozi frameworks
        // 🆕 PHASE 2: Language parameter
        language: language, // 'es' or 'en'
        // 🆕 PHASE 3: Context Profile ID for Digital Twin
        contextProfileId: contextProfileId // Digital Twin profile ID
      };

      // 🔥 USE CONTEXT-COMPOSED PROMPT (Context Coherence)
      const result = await this.apiBridge.generateVideo(enhancedPrompt, videoOptions);

      return {
        scene: videoScene,
        usedProductOnly: true,
        avatarNotProvided: true,
        usedFrameworks: {
          avatar: !!avatarProfile,
          mechanism: !!mechanism,
          offer: !!offer,
          copyScript: !!videoScript // 🔥 NEW: Track if copy script was used
        },
        videoScript: videoScript, // 🔥 NEW: Include script in response
        ...result
      };
    }
  }

  /**
   * STEP 6.5: Customer Avatar Profile Generation (ENHANCED - Phase 1)
   * Uses avatar-construction skill with fallback
   * Now receives contextProfileId from Step 0
   */
  async generateCustomerAvatarProfile(brief, nicheContext) {
    //console.log('🎯 Generating customer avatar profile...');

    // Get contextProfileId from Step 0 results
    const contextProfileResolution = this.currentSession.results.context_profile_resolution;
    const contextProfileId = contextProfileResolution?.contextProfileId || null;

    if (contextProfileId) {
      //console.log(`  📋 Using Context Profile: ${contextProfileId}`);
      if (contextProfileResolution.isDigitalTwin) {
        //console.log(`  🎯 Digital Twin mode: High-precision avatar generation`);
      }
    }

    // Skill-First: Try to use avatar-construction skill
    if (this.skillDetector.hasSkill('avatar-construction')) {
      try {
        //console.log('  → Using avatar-construction skill');
        const avatarSkill = this.skillDetector.getSkill('avatar-construction');

        const avatarProfile = await avatarSkill.generate({
          brief: brief,
          nicheContext: nicheContext,
          industry: nicheContext.niche,
          contextProfileId: contextProfileId // ✅ Now uses Step 0 resolution
        });

        // Log success
        this.logSkillUsage('avatar-construction', 'success');
        //console.log('  ✓ Avatar profile generated via skill');

        return avatarProfile;

      } catch (error) {
        console.error('  ✗ Skill failed:', error.message);
        //console.log('  → Falling back to internal logic');
        this.logSkillUsage('avatar-construction', 'fallback', error.message);
        // Fallback below
      }
    } else {
      //console.log('  → avatar-construction skill not available, using fallback');
      this.logSkillUsage('avatar-construction', 'unavailable');
    }

    // Fallback: Internal logic (basic avatar profile)
    return this.generateAvatarProfileFallback(brief, nicheContext);
  }

  /**
   * Fallback method for avatar profile generation
   */
  async generateAvatarProfileFallback(brief, nicheContext) {
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        method: 'fallback',
        note: 'avatar-construction skill unavailable'
      },
      demographics: {
        age_range: '25-45',
        gender: 'Both',
        income_range: '$40,000-$100,000'
      },
      psychographics: {
        core_values: ['Success', 'Quality', 'Growth'],
        lifestyle: 'Busy professional'
      },
      pain_points_and_desires: {
        top_pain_points: [{ pain: 'Not achieving desired results', intensity: 'high' }],
        dream_outcome: { description: 'Achieve transformation effectively' }
      },
      market_sophistication: {
        primary_level: { level: 3, name: 'Solution Aware' }
      }
    };
  }

  /**
   * STEP 6.6: Unique Mechanism Generation (ENHANCED - Phase 1)
   * Uses unique-mechanism-generator skill with fallback
   * Now receives contextProfileId from Step 0
   */
  async generateUniqueMechanism(brief, customerAvatarProfile, nicheContext) {
    //console.log('🎯 Generating unique mechanism...');

    // Get contextProfileId from Step 0 results
    const contextProfileResolution = this.currentSession.results.context_profile_resolution;
    const contextProfileId = contextProfileResolution?.contextProfileId || null;

    if (contextProfileId) {
      //console.log(`  📋 Using Context Profile: ${contextProfileId}`);
      if (contextProfileResolution.isDigitalTwin) {
        //console.log(`  🎯 Digital Twin mode: High-precision mechanism generation`);
      }
    }

    // Skill-First: Try to use unique-mechanism-generator skill
    if (this.skillDetector.hasSkill('unique-mechanism-generator')) {
      try {
        //console.log('  → Using unique-mechanism-generator skill');
        const mechanismSkill = this.skillDetector.getSkill('unique-mechanism-generator');

        const mechanismResult = await mechanismSkill.generate({
          brief: brief,
          avatar: customerAvatarProfile,
          contextProfileId: contextProfileId // ✅ Now uses Step 0 resolution
        });

        // Log success
        this.logSkillUsage('unique-mechanism-generator', 'success');
        //console.log(`  ✓ Generated ${mechanismResult.mechanism_variants.length} mechanism variants via skill`);

        return mechanismResult;

      } catch (error) {
        console.error('  ✗ Skill failed:', error.message);
        //console.log('  → Falling back to internal logic');
        this.logSkillUsage('unique-mechanism-generator', 'fallback', error.message);
        // Fallback below
      }
    } else {
      //console.log('  → unique-mechanism-generator skill not available, using fallback');
      this.logSkillUsage('unique-mechanism-generator', 'unavailable');
    }

    // Fallback: Basic mechanism
    return this.generateMechanismFallback(brief, customerAvatarProfile);
  }

  /**
   * Fallback method for unique mechanism generation
   */
  async generateMechanismFallback(brief, customerAvatarProfile) {
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        method: 'fallback',
        note: 'unique-mechanism-generator skill unavailable'
      },
      mechanism_variants: [{
        id: 'mechanism_fallback',
        name: 'Complete Solution System',
        tagline: 'The comprehensive approach to achieving your goals',
        type: 'generic',
        scores: {
          believability_score: 70,
          differentiation_strength: 70,
          market_fit_score: 70,
          overall_quality: 70
        }
      }],
      recommended_mechanism: {
        mechanism_id: 'mechanism_fallback',
        recommendation_reason: 'Fallback mechanism - skill unavailable',
        confidence_score: 60
      }
    };
  }

  /**
   * STEP 6.7: Grand Slam Offer Generation (ENHANCED - Phase 1)
   * Uses grand-slam-offer-generator skill with fallback
   * Now receives contextProfileId from Step 0
   */
  async generateGrandSlamOffer(brief, customerAvatarProfile, uniqueMechanism, pricing, nicheContext) {
    //console.log('💰 Generating Grand Slam Offer...');

    // Get contextProfileId from Step 0 results
    const contextProfileResolution = this.currentSession.results.context_profile_resolution;
    const contextProfileId = contextProfileResolution?.contextProfileId || null;

    if (contextProfileId) {
      //console.log(`  📋 Using Context Profile: ${contextProfileId}`);
      if (contextProfileResolution.isDigitalTwin) {
        //console.log(`  🎯 Digital Twin mode: High-precision offer generation`);
      }
    }

    // Skill-First: Try to use grand-slam-offer-generator skill
    if (this.skillDetector.hasSkill('grand-slam-offer-generator')) {
      try {
        //console.log('  → Using grand-slam-offer-generator skill');
        const offerSkill = this.skillDetector.getSkill('grand-slam-offer-generator');

        // Use recommended mechanism or first variant
        const selectedMechanism = uniqueMechanism.mechanism_variants ?
          uniqueMechanism.mechanism_variants[0] : null;

        const offerResult = await offerSkill.generate({
          brief: brief,
          avatar: customerAvatarProfile,
          unique_mechanism: selectedMechanism,
          pricing: pricing,
          contextProfileId: contextProfileId // ✅ Now uses Step 0 resolution
        });

        // Log success
        this.logSkillUsage('grand-slam-offer-generator', 'success');
        //console.log(`  ✓ Generated Grand Slam Offer (${offerResult.scores.overall_grand_slam_score}/100) via skill`);

        return offerResult;

      } catch (error) {
        console.error('  ✗ Skill failed:', error.message);
        //console.log('  → Falling back to internal logic');
        this.logSkillUsage('grand-slam-offer-generator', 'fallback', error.message);
        // Fallback below
      }
    } else {
      //console.log('  → grand-slam-offer-generator skill not available, using fallback');
      this.logSkillUsage('grand-slam-offer-generator', 'unavailable');
    }

    // Fallback: Basic offer
    return this.generateOfferFallback(brief, pricing);
  }

  /**
   * Fallback method for Grand Slam Offer generation
   */
  async generateOfferFallback(brief, pricing) {
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        method: 'fallback',
        note: 'grand-slam-offer-generator skill unavailable'
      },
      offer: {
        value_equation: {
          calculated_value_score: 70
        },
        value_stack: {
          core_offer: {
            name: 'Complete Solution',
            value: pricing.base_price * 3,
            actual_price: pricing.base_price
          },
          bonuses: [],
          total_value: pricing.base_price * 3,
          actual_price: pricing.base_price,
          value_to_price_ratio: 3.0
        },
        guarantee: {
          type: 'money_back',
          duration: '60 days',
          strength_level: 'basic',
          credibility_boost: 70
        },
        urgency: {
          type: 'time_limited',
          message: 'Limited time offer',
          urgency_strength: 60
        }
      },
      scores: {
        offer_strength: 70,
        value_perception: 70,
        risk_reduction: 70,
        overall_grand_slam_score: 70
      }
    };
  }

  /**
   * STEP 7: Copy Generation (ENHANCED - Phase 1)
   * Uses ad-copy-generation skill with fallback
   * Now receives contextProfileId + platformSpecs from Step 0
   */
  async generateCopyContent(brief, customerAvatarProfile, uniqueMechanism, grandSlamOffer, nicheContext) {
    //console.log('📝 Generating copy content...');

    // Get contextProfileId and platformSpecs from Step 0 results
    const contextProfileResolution = this.currentSession.results.context_profile_resolution;
    const contextProfileId = contextProfileResolution?.contextProfileId || null;
    const platformSpecs = contextProfileResolution?.platform_specifications || {};

    if (contextProfileId) {
      //console.log(`  📋 Using Context Profile: ${contextProfileId}`);
      if (contextProfileResolution.isDigitalTwin) {
        //console.log(`  🎯 Digital Twin mode: High-precision copy generation`);
      }
    }

    // Get target platform (ENHANCED - Phase 3: Generic fallback)
    const targetPlatform = this.currentSession?.config?.platforms?.[0] || 'instagram';

    // Get platform-specific specifications
    const platformSpecification = platformSpecs[targetPlatform] || null;
    if (platformSpecification) {
      //console.log(`  📱 Using ${targetPlatform} specifications: ${platformSpecification.toneOfVoice || 'default'}`);
    }

    // Detect language from brief (NEW - FIX #2: Spanish language support)
    const detectedLanguage = this.detectLanguageFromBrief(brief);
    console.log(`  [INFO] Detected language: ${detectedLanguage} (${detectedLanguage === 'es' ? 'Español' : 'English'})`);

    // PHASE 3.2: Extract BigQuery business intelligence from nicheContext
    const business_intelligence = nicheContext?.framework_seeds?.business_intelligence || null;
    if (business_intelligence?.has_real_data) {
      console.log(`  [INFO] BigQuery data available: ${business_intelligence.top_selling_products?.length || 0} products, ${business_intelligence.proven_copy_phrases?.length || 0} proven phrases`);
    }

    // Skill-First: Try to use ad-copy-generation skill
    if (this.skillDetector.hasSkill('ad-copy-generation')) {
      try {
        //console.log('  → Using ad-copy-generation skill');
        const copySkill = this.skillDetector.getSkill('ad-copy-generation');

        const copyResult = await copySkill.generate({
          brief: brief,
          avatar: customerAvatarProfile,
          unique_mechanism: uniqueMechanism,
          grand_slam_offer: grandSlamOffer,
          nicheContext: nicheContext,
          platform: targetPlatform,
          language: detectedLanguage, // ✅ NEW: Language detection (es/en)
          contextProfileId: contextProfileId, // ✅ Now uses Step 0 resolution
          platformSpecification: platformSpecification, // ✅ NEW: Platform-specific specs (toneOfVoice, demographics, bestPractices)
          business_intelligence: business_intelligence // 🆕 PHASE 3.2: BigQuery business intelligence
        });

        // Log success
        this.logSkillUsage('ad-copy-generation', 'success');
        //console.log(`  ✓ Generated ${copyResult.variants.length} ad copy variants via skill`);

        return copyResult;

      } catch (error) {
        console.error('  ✗ Skill failed:', error.message);
        //console.log('  → Falling back to internal logic');
        this.logSkillUsage('ad-copy-generation', 'fallback', error.message);
        // Fallback below
      }
    } else {
      //console.log('  → ad-copy-generation skill not available, using fallback');
      this.logSkillUsage('ad-copy-generation', 'unavailable');
    }

    // Fallback: Internal logic (basic copy generation)
    return this.generateCopyFallback(nicheContext);
  }

  /**
   * Fallback method for copy generation
   */
  async generateCopyFallback(nicheContext) {
    const copyPrompt = this.buildCopyPrompt(nicheContext);

    return {
      metadata: {
        generated_at: new Date().toISOString(),
        method: 'fallback',
        note: 'ad-copy-generation skill unavailable'
      },
      variants: [
        {
          variant_id: 1,
          hook_type: 'generic',
          copy: {
            headline: await this.generateHeadline(nicheContext),
            body: await this.generateDescription(nicheContext),
            cta: await this.generateCTA(nicheContext)
          }
        }
      ]
    };
  }

  /**
   * STEP 7.5: Landing Page Structure Generation (ENHANCED - Phase 1)
   * Uses landing-page-structure skill with fallback
   * Now receives contextProfileId + brandGuidelines from Step 0
   */
  async generateLandingPageStructure(brief, customerAvatarProfile, uniqueMechanism, grandSlamOffer, copyContent, nicheContext) {
    //console.log('📄 Generating landing page structure...');

    // Get contextProfileId and brandGuidelines from Step 0 results
    const contextProfileResolution = this.currentSession.results.context_profile_resolution;
    const contextProfileId = contextProfileResolution?.contextProfileId || null;
    const brandGuidelines = contextProfileResolution?.brand_guidelines || {};

    if (contextProfileId) {
      //console.log(`  📋 Using Context Profile: ${contextProfileId}`);
      if (contextProfileResolution.isDigitalTwin) {
        //console.log(`  🎯 Digital Twin mode: High-precision landing page generation`);
      }
    }

    // Log brand guidelines if available
    if (brandGuidelines.color_spec) {
      //console.log(`  🎨 Using brand colors: ${brandGuidelines.color_spec.primary || 'default'}`);
    }
    if (brandGuidelines.typography) {
      //console.log(`  📝 Using brand typography: ${brandGuidelines.typography.primary_font || 'default'}`);
    }

    // Skill-First: Try to use landing-page-structure skill
    if (this.skillDetector.hasSkill('landing-page-structure')) {
      try {
        //console.log('  → Using landing-page-structure skill');
        const landingSkill = this.skillDetector.getSkill('landing-page-structure');

        // Use first copy variant as primary
        const primaryCopy = copyContent.variants ? copyContent.variants[0] : null;

        const landingResult = await landingSkill.generate({
          brief: brief,
          avatar: customerAvatarProfile,
          unique_mechanism: uniqueMechanism,
          grand_slam_offer: grandSlamOffer,
          primary_copy: primaryCopy,
          nicheContext: nicheContext,
          contextProfileId: contextProfileId, // ✅ Now uses Step 0 resolution
          brandGuidelines: brandGuidelines // ✅ NEW: Pantone colors, typography, visual style
        });

        // Log success
        this.logSkillUsage('landing-page-structure', 'success');
        //console.log(`  ✓ Generated landing page with ${landingResult.sections.length} sections via skill`);

        return landingResult;

      } catch (error) {
        console.error('  ✗ Skill failed:', error.message);
        //console.log('  → Falling back to internal logic');
        this.logSkillUsage('landing-page-structure', 'fallback', error.message);
        // Fallback below
      }
    } else {
      //console.log('  → landing-page-structure skill not available, using fallback');
      this.logSkillUsage('landing-page-structure', 'unavailable');
    }

    // Fallback: Basic landing page
    return this.generateLandingPageFallback(brief, grandSlamOffer);
  }

  /**
   * Fallback method for landing page structure generation
   */
  async generateLandingPageFallback(brief, grandSlamOffer) {
    return {
      metadata: {
        generated_at: new Date().toISOString(),
        method: 'fallback',
        note: 'landing-page-structure skill unavailable'
      },
      sections: [
        {
          section_id: 'hero',
          title: 'Transform Your Experience',
          content: brief,
          cta: {
            text: 'Get Started Now',
            style: 'primary'
          }
        },
        {
          section_id: 'offer',
          title: 'Special Offer',
          content: grandSlamOffer?.offer?.value_stack ?
            `Get ${grandSlamOffer.offer.value_stack.core_offer.name} for only $${grandSlamOffer.offer.value_stack.actual_price}` :
            'Limited time offer available',
          cta: {
            text: 'Claim Offer',
            style: 'primary'
          }
        }
      ],
      html_skeleton: '<div class="landing-page"><div class="hero">Hero Section</div><div class="offer">Offer Section</div></div>'
    };
  }

  /**
   * Log skill usage for analytics
   */
  logSkillUsage(skillName, status, errorMessage = null) {
    this.skillsUsageLog.push({
      skill: skillName,
      status: status, // 'success', 'fallback', 'unavailable'
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession?.id,
      error: errorMessage
    });
  }

  /**
   * STEP 8: Platform Variants Generation
   */
  async generatePlatformVariants(platforms, sessionResults) {
    //console.log(`📱 Generating variants for platforms: ${platforms.join(', ')}`);
    
    const variants = [];
    
    for (const platform of platforms) {
      const variant = await this.variantGenerator.generateVariant(platform, {
        images: [sessionResults.product_image, sessionResults.avatar_image],
        video: sessionResults.video_generation,
        copy: sessionResults.copy_generation,
        niche: sessionResults.niche_context.niche
      });
      
      variants.push(variant);
    }

    return variants;
  }

  /**
   * STEP 9: Store in Semantic Cache
   */
  async storeInSemanticCache(originalQuery, results) {
    //console.log('💾 Storing results in semantic cache...');
    
    const cacheContent = {
      images: [results.product_image, results.avatar_image],
      video: results.video_generation,
      copy: results.copy_generation,
      variants: results.platform_variants
    };

    const metadata = {
      niche: results.niche_context.niche,
      platforms: this.currentSession.config.platforms,
      processingTime: Date.now() - this.currentSession.startTime,
      assetsCount: 2 + 1 + results.platform_variants.length, // 2 images + 1 video + variants
      sessionId: this.currentSession.id
    };

    await this.qdrantConnector.storeContent(originalQuery, cacheContent, metadata);
    
    return { stored: true, metadata };
  }

  /**
   * Helper: Detect language from brief content
   * Default: Spanish (es) for Alex Seis / Latin America market
   */
  detectLanguageFromBrief(brief) {
    if (!brief || typeof brief !== 'string') {
      return 'es'; // Default Spanish
    }

    const lowerBrief = brief.toLowerCase();

    // English indicators
    const englishIndicators = [
      /\b(the|and|this|that|with|for|from|your|you|our|we|are|is)\b/g,
      /\b(marketing|business|product|service|customer|company)\b/g
    ];

    // Spanish indicators
    const spanishIndicators = [
      /\b(el|la|los|las|un|una|de|del|que|para|con|por|su|tu|nuestro)\b/g,
      /\b(sistema|transformación|solución|negocio|cliente|empresa|producto)\b/g
    ];

    let englishScore = 0;
    let spanishScore = 0;

    englishIndicators.forEach(regex => {
      const matches = lowerBrief.match(regex);
      if (matches) englishScore += matches.length;
    });

    spanishIndicators.forEach(regex => {
      const matches = lowerBrief.match(regex);
      if (matches) spanishScore += matches.length;
    });

    // If inconclusive or equal, default to Spanish (primary market)
    return spanishScore >= englishScore ? 'es' : 'en';
  }

  /**
   * Compile final results for return (UPDATED - Phase 4.3)
   */
  compileFinalResults(session) {
    const processingTime = Date.now() - session.startTime;

    // Calculate overall quality score
    // Copy quality: average of all variant quality_scores
    let copyQuality = null;
    if (session.results.copy_generation?.variants && Array.isArray(session.results.copy_generation.variants)) {
      const variantScores = session.results.copy_generation.variants
        .map(v => v.quality_score)
        .filter(s => s !== null && s !== undefined);
      if (variantScores.length > 0) {
        copyQuality = Math.round(variantScores.reduce((sum, score) => sum + score, 0) / variantScores.length);
      }
    }

    const mechanismQuality = session.results.unique_mechanism?.mechanism_variants?.[0]?.scores?.overall_quality || null;
    const offerQuality = session.results.grand_slam_offer?.scores?.overall_grand_slam_score || null;

    // Avatar confidence: check multiple possible locations
    const avatarConfidence = session.results.customer_avatar_profile?.generation_confidence
      || session.results.customer_avatar_profile?.confidence
      || session.results.customer_avatar_profile?.score
      || null;

    // Overall quality: weighted average of available scores
    let overallQuality = null;
    const qualityScores = [copyQuality, mechanismQuality, offerQuality, avatarConfidence].filter(s => s !== null);
    if (qualityScores.length > 0) {
      overallQuality = Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length);
    }

    return {
      success: true,
      sessionId: session.id,

      // Quality Score (TOP LEVEL - NEW)
      quality_score: overallQuality,

      // Content Assets (Images + Video)
      images: [
        session.results.product_image,
        session.results.avatar_image
      ],
      video: session.results.video_generation,

      // Strategic Components (Phase 4 - ENHANCED with scores)
      customer_avatar: {
        ...session.results.customer_avatar_profile,
        confidence: avatarConfidence
      },
      unique_mechanism: session.results.unique_mechanism,
      grand_slam_offer: session.results.grand_slam_offer,

      // Content Generation (ENHANCED with quality score)
      copy: {
        ...session.results.copy_generation,
        quality_score: copyQuality
      },
      landing_page: session.results.landing_page_structure,
      variants: session.results.platform_variants,

      // Metadata
      metadata: {
        processingTime,
        nicheUsed: session.results.niche_context.niche,
        cacheHit: session.results.cache_check.hit,
        stepsCompleted: session.steps.length,
        platforms: session.config.platforms,
        voicePreference: session.config.voicePreference,
        productImageRef: session.results.product_image?.localPath || null,

        // Phase 4 metadata (ENHANCED with quality tracking)
        pipelineVersion: '4.3.0',
        qualityScores: {
          overall: overallQuality,
          copy: copyQuality,
          mechanism: mechanismQuality,
          offer: offerQuality,
          avatar: avatarConfidence
        },
        mechanismQuality: mechanismQuality,
        offerScore: offerQuality,
        landingSections: session.results.landing_page_structure?.sections?.length || null
      }
    };
  }

  // Helper methods for prompt building (ENHANCED - Now with strategic frameworks)
  async buildProductPrompt(nicheContext, avatarProfile = null, mechanism = null, offer = null) {
    let prompt = `${nicheContext.enhancedBrief}, product photography style, ${nicheContext.visualStyle}`;

    // ✅ Enrich with avatar demographics if available
    if (avatarProfile && avatarProfile.demographics) {
      const demographics = avatarProfile.demographics;
      const ageRange = demographics.age_range || 'general audience';
      const gender = demographics.gender || 'all genders';
      const income = demographics.income_range || 'mid-range income';
      prompt += `, appealing to ${gender} aged ${ageRange} with ${income}`;
    }

    // ✅ Enrich with unique mechanism if available
    if (mechanism && mechanism.mechanism_variants && mechanism.mechanism_variants.length > 0) {
      const topMechanism = mechanism.mechanism_variants[0];
      const mechanismName = topMechanism.name || 'innovative solution';
      prompt += `, emphasizing ${mechanismName}`;
    }

    // ✅ Enrich with offer positioning if available
    if (offer && offer.offer && offer.offer.value_stack) {
      const valueRatio = offer.offer.value_stack.value_to_price_ratio || 3;
      prompt += `, premium packaging highlighting ${valueRatio}x value`;
    }

    prompt += `, professional lighting, clean background`;
    return prompt;
  }

  /**
   * 🔥 NEW FUNCTION: Align visual prompt with copy strategy
   * Integrates Todd Brown hooks + Hormozi value stack into visual generation
   *
   * @param {Object} nicheContext - Niche context information
   * @param {Object} avatarProfile - Customer avatar profile
   * @param {Object} mechanism - Unique mechanism from Todd Brown
   * @param {Object} offer - Grand Slam Offer from Hormozi
   * @param {Object} copyContent - Generated copy with variants and hooks
   * @returns {String} Enhanced visual prompt aligned with copy strategy
   */
  async alignVisualWithCopy(nicheContext, avatarProfile, mechanism, offer, copyContent) {
    console.log('[INFO] Aligning visual with copy strategy...');

    // Get best copy variant (first one is typically best scored)
    const primaryCopy = copyContent.variants[0];
    const hookType = primaryCopy.hook_type || 'generic';
    const headline = primaryCopy.copy?.headline || primaryCopy.headline || '';
    const mainMessage = headline.substring(0, 100); // First 100 chars for context

    console.log(`  📍 Copy hook type: ${hookType}`);

    // Hook-specific visual elements (Todd Brown hooks mapped to visuals)
    const hookVisuals = {
      'mechanism': 'innovative system visualization, transformation moment captured, unique technology display, before-after contrast',
      'proof': 'testimonial scene elements, results visualization with metrics, credibility symbols, success indicators',
      'big-promise': 'aspirational scene, dream outcome visualization, transformation complete, ultimate benefit shown',
      'enemy': 'problem visualization, frustration moment, contrast dramatically, pain point highlighted',
      'curiosity': 'mysterious element presence, intrigue visual cues, question-inducing scene, unexpected detail'
    };

    const hookVisual = hookVisuals[hookType] || hookVisuals['mechanism'];

    // Build base prompt from original function
    let visualPrompt = `${nicheContext.enhancedBrief}, product photography style, ${nicheContext.visualStyle}`;

    // Enrich with avatar demographics
    if (avatarProfile && avatarProfile.demographics) {
      const demographics = avatarProfile.demographics;
      const ageRange = demographics.age_range || 'general audience';
      const gender = demographics.gender || 'all genders';
      visualPrompt += `, scene featuring ${gender} aged ${ageRange}`;
    }

    // 🔥 INTEGRATE COPY HOOK VISUAL ELEMENTS
    visualPrompt += `, ${hookVisual}`;

    // Integrate mechanism visual elements
    if (mechanism && mechanism.mechanism_variants && mechanism.mechanism_variants.length > 0) {
      const topMechanism = mechanism.mechanism_variants[0];
      const mechanismName = topMechanism.name || 'innovative solution';
      const mechanismType = topMechanism.type || 'generic';

      // Visual representation of mechanism
      visualPrompt += `, visual representation of ${mechanismName} (${mechanismType} approach)`;
    }

    // Integrate Hormozi value stack visual cues
    if (offer && offer.offer && offer.offer.value_stack) {
      const valueRatio = offer.offer.value_stack.value_to_price_ratio || 3;
      const urgency = offer.offer.urgency?.type || 'none';

      visualPrompt += `, premium ${valueRatio}x value presentation`;

      if (urgency !== 'none') {
        visualPrompt += `, urgency visual cues (${urgency})`;
      }
    }

    // Add copy message alignment (subtle context from headline)
    if (mainMessage.length > 20) {
      // Extract key descriptive words from headline for visual context
      const keyWords = this.extractVisualKeywords(mainMessage);
      if (keyWords.length > 0) {
        visualPrompt += `, aligned with message theme: ${keyWords.join(', ')}`;
      }
    }

    visualPrompt += `, professional lighting, brand-consistent composition, conversion-optimized visual hierarchy`;

    console.log(`  [INFO] Visual prompt aligned with ${hookType} hook`);
    return visualPrompt;
  }

  /**
   * NEW FUNCTION: Generate video script from copy content
   * Creates video script aligned with Todd Brown storytelling + Hormozi value equation
   *
   * @param {Object} copyContent - Generated copy with variants
   * @param {Object} mechanism - Unique mechanism
   * @param {Object} offer - Grand Slam Offer
   * @param {Object} avatarProfile - Customer avatar profile
   * @returns {Object} Video script with timeline, voiceover, and strategic elements
   */
  generateVideoScript(copyContent, mechanism, offer, avatarProfile) {
    console.log('[INFO] Generating video script from copy content...');

    // Get primary copy variant
    const primaryCopy = copyContent.variants[0];
    const hookType = primaryCopy.hook_type || 'generic';
    const headline = primaryCopy.copy?.headline || primaryCopy.headline || '';
    const body = primaryCopy.copy?.body || primaryCopy.body || '';
    const cta = primaryCopy.copy?.cta || primaryCopy.cta || 'Learn More';

    // Extract value stack from offer
    const valueStack = offer?.offer?.value_stack?.bonuses || [];
    const urgency = offer?.offer?.urgency?.message || 'Limited time offer';
    const guarantee = offer?.offer?.guarantee?.type || 'satisfaction guarantee';

    // Extract mechanism story
    const mechanismName = mechanism?.mechanism_variants?.[0]?.name || 'unique solution';
    const mechanismTagline = mechanism?.mechanism_variants?.[0]?.tagline || '';

    // Time allocation for 8-second video (Todd Brown storytelling arc)
    const timeline = {
      open: { start: 0, end: 2, duration: 2 },    // Hook/Attention
      middle: { start: 2, end: 6, duration: 4 },  // Mechanism/Proof
      close: { start: 6, end: 8, duration: 2 }    // Offer/CTA
    };

    // Build script structure
    const script = {
      hook_type: hookType,
      total_duration: 8,

      timeline: [
        {
          phase: 'open',
          seconds: `0-${timeline.open.end}`,
          visual: `${hookType} hook visual introduction`,
          voiceover: headline.substring(0, 80), // Truncate for 2 seconds
          action: 'Attention grabber aligned with copy hook',
          todd_brown_element: `${hookType} hook (Level ${avatarProfile?.market_sophistication || 3} sophistication)`
        },
        {
          phase: 'middle',
          seconds: `${timeline.middle.start}-${timeline.middle.end}`,
          visual: mechanismTagline ? `${mechanismName} visualization` : 'Problem-solution demonstration',
          voiceover: body.substring(0, 180), // Truncate for 4 seconds
          action: 'Mechanism explanation or proof demonstration',
          todd_brown_element: `Unique Mechanism: ${mechanismName}`
        },
        {
          phase: 'close',
          seconds: `${timeline.close.start}-${timeline.close.end}`,
          visual: 'Value stack display + CTA overlay',
          voiceover: `${cta}. ${urgency}`,
          action: 'Value proposition + urgency + CTA',
          hormozi_element: `Value Stack (${valueStack.length} bonuses) + ${guarantee}`
        }
      ],

      // Full voiceover text (for Veo 3 or future TTS)
      full_voiceover: `${headline}. ${body.substring(0, 100)}. ${cta}. ${urgency}`,

      // Strategic frameworks embedded
      todd_brown_framework: {
        hook_type: hookType,
        mechanism_name: mechanismName,
        market_sophistication: avatarProfile?.market_sophistication || 3
      },

      hormozi_framework: {
        value_stack: valueStack.map(b => b.name || b),
        value_ratio: offer?.offer?.value_stack?.value_to_price_ratio || 3,
        urgency: urgency,
        risk_reversal: guarantee
      },

      // Metadata
      metadata: {
        generated_at: new Date().toISOString(),
        copy_variant_id: primaryCopy.variant_id || 1,
        alignment_score: 95 // Estimated - high alignment between copy and video
      }
    };

    console.log(`  [INFO] Video script generated with ${hookType} hook + Hormozi stack`);
    return script;
  }

  /**
   * Helper: Extract visual keywords from text
   */
  extractVisualKeywords(text) {
    // Remove common words and extract descriptive adjectives/nouns
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'including', 'until', 'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning', 'you', 'your', 'our', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);

    const words = text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    return words.slice(0, 3); // Top 3 descriptive words
  }

  async buildAvatarPrompt(nicheContext, productImageRef = null, avatarProfile = null, copyContext = null) {
    let basePrompt;

    // ✅ Use avatar profile if available (strategic approach)
    if (avatarProfile) {
      const demographics = avatarProfile.demographics || {};
      const psychographics = avatarProfile.psychographics || {};

      const gender = demographics.gender || 'person';
      const ageRange = demographics.age_range || '25-45';
      const lifestyle = psychographics.lifestyle || 'professional lifestyle';
      const coreValues = psychographics.core_values || ['quality', 'success'];
      const values = coreValues.slice(0, 2).join(' and ');

      basePrompt = `${gender} aged ${ageRange}, embodying ${lifestyle} lifestyle with values of ${values}, ${nicheContext.visualStyle}, professional portrait, authentic expression, engaging demeanor, high quality`;
    } else {
      // Fallback to generic demographics
      const demographics = nicheContext.targetAudience;
      basePrompt = `${demographics}, ${nicheContext.visualStyle}, professional portrait, engaging expression, high quality`;
    }

    // Add product image reference for visual consistency
    if (productImageRef) {
      basePrompt += `, interacting with product, consistent visual style and lighting`;
    }

    return basePrompt;
  }

  /**
   * Detect if brief requests trained model (Alexsei)
   */
  detectTrainedModel(brief) {
    const alexseiKeywords = ['alexsei', 'alexsix6', 'e7ed97cf', 'kontext:e7ed97cf'];
    const briefLower = brief.toLowerCase();
    
    for (const keyword of alexseiKeywords) {
      if (briefLower.includes(keyword)) {
        return 'alexseis'; // Maps to trained model
      }
    }
    
    return 'alexseis'; // Use trained model for avatars
  }

  buildCopyPrompt(nicheContext) {
    const keyMessaging = nicheContext.keyMessaging && Array.isArray(nicheContext.keyMessaging)
      ? nicheContext.keyMessaging.join(', ')
      : 'professional and effective solutions';
    const niche = nicheContext.niche || 'business';
    const targetAudience = nicheContext.targetAudience || 'professionals';
    return `Create marketing copy for ${niche} targeting ${targetAudience} with key messaging: ${keyMessaging}`;
  }

  async generateHeadline(nicheContext) {
    // Mock implementation - in production would use LLM
    const niche = nicheContext.niche || 'business';
    return `Transform Your ${niche.replace('-', ' ').toUpperCase()} Experience`;
  }

  async generateDescription(nicheContext) {
    const keyMessage = nicheContext.keyMessaging && Array.isArray(nicheContext.keyMessaging) && nicheContext.keyMessaging.length > 0
      ? nicheContext.keyMessaging[0]
      : 'innovation';
    const targetAudience = nicheContext.targetAudience || 'professionals';
    return `Discover the power of ${keyMessage} with our innovative solution designed for ${targetAudience}.`;
  }

  async generateCTA(nicheContext) {
    const ctas = {
      'e-commerce': 'Shop Now',
      'marketing-agency': 'Get Started',
      'real-estate': 'View Properties',
      'fitness': 'Start Training',
      'food-beverage': 'Order Today'
    };
    const niche = nicheContext.niche || 'business';
    return ctas[niche] || 'Learn More';
  }

  async generateHashtags(nicheContext) {
    const niche = nicheContext.niche || 'business';
    const baseHashtags = [`#${niche.replace('-', '')}`, '#marketing', '#business'];

    if (nicheContext.keyMessaging && Array.isArray(nicheContext.keyMessaging)) {
      return baseHashtags.concat(nicheContext.keyMessaging.map(msg => `#${msg.replace(/\s+/g, '')}`));
    }

    return baseHashtags;
  }

  async generateProactiveQuestions(brief) {
    // Mock implementation - would use LLM to generate strategic questions
    return [
      'What is your target audience demographic?',
      'What is your primary call-to-action?',
      'What tone of voice should we use?',
      'Are there any brand guidelines to follow?'
    ];
  }

  async generateReactiveAssumptions(brief) {
    // Mock implementation - would analyze brief and make assumptions
    return {
      targetAudience: 'General consumers',
      tone: 'Professional and engaging',
      goal: 'Increase brand awareness',
      style: 'Modern and clean'
    };
  }

  async enhanceBriefWithNiche(originalBrief, nicheInsights) {
    return `${originalBrief}, optimized for ${nicheInsights.targetAudience}, emphasizing ${nicheInsights.keyMessaging.join(' and ')}, ${nicheInsights.visualStyle} style`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * Veo3VideoGenerator - Specialized video generation for Veo3 API
 * Implements Spanish → Reasoning → English → Context Profile → Veo3 JSON pipeline
 */
export class Veo3VideoGenerator {
  constructor() {
    this.initialized = false;
    this.reasoningModels = [
      'deepseek/deepseek-r1',
      'openai/o1-mini', 
      'anthropic/claude-3.5-sonnet'
    ];
    this.templates = new Map();
    this.nicheEnhancements = new Map();
  }

  async initialize() {
    if (this.initialized) return;

    //console.log('🎬 Initializing Veo3VideoGenerator...');
    
    // Load proven templates
    this.loadProvenTemplates();
    
    // Load niche-specific enhancements
    this.loadNicheEnhancements();
    
    this.initialized = true;
    //console.log('✅ Veo3VideoGenerator initialized with proven templates');
  }

  loadProvenTemplates() {
    // Template 1: Cinematic Product Reveal (with avatar and dialogue)
    this.templates.set('veo3_cinematic', {
      name: 'Cinematic Product Reveal',
      structure: '[Shot Type] + [Subject + Action] + [Environment] + [Audio]',
      maxWords: 250,
      template: `{shotType} of {subject} {action} in {environment}. 
{character}: "{dialogue}"
AUDIO: {audioDescription}
{visualDetails}
{cameraMovement}
{lighting}
Duration: 8-12 seconds.`
    });

    // Template 2: Magic Transformation (Corona style)
    this.templates.set('veo3_transform', {
      name: 'Product Magic Transformation',
      structure: '[Initial State] + [Transformation] + [Final Result] + [Key Visuals]',
      maxWords: 200,
      template: `{shotType} showing {initialState}.
Magical transformation begins with {transformEffect}.
{product} transforms into {finalResult}.
AUDIO: {audioDescription}
{keyVisuals}
{environmentDetails}
Duration: 8-10 seconds.`
    });

    // Template 3: Tech Innovation Reveal (Tesla style)
    this.templates.set('veo3_tech', {
      name: 'Tech Innovation Reveal',
      structure: '[Tech Setup] + [Innovation Moment] + [Benefits] + [Call to Action]',
      maxWords: 230,
      template: `{shotType} of {techSetup} in {environment}.
{innovationMoment} reveals {keyFeature}.
{benefits} demonstrated clearly.
AUDIO: {audioDescription}
{visualEffects}
{brandingElements}
Duration: 10-12 seconds.`
    });

    //console.log(`📋 Loaded ${this.templates.size} proven Veo3 templates`);
  }

  loadNicheEnhancements() {
    // Niche-specific enhancements from Veo3 guide
    this.nicheEnhancements.set('higiene-personal', {
      style: 'clean, medical-grade, trustworthy',
      lighting: 'bright, clinical, soft shadows',
      colors: 'white, light blue, mint green',
      environment: 'clean bathroom, medical facility, spa-like setting',
      audioTone: 'professional, reassuring, gentle'
    });

    this.nicheEnhancements.set('consultoria', {
      style: 'corporate, modern, confident',
      lighting: 'professional office lighting, warm undertones',
      colors: 'navy blue, gray, white, gold accents',
      environment: 'modern office, conference room, executive setting',
      audioTone: 'authoritative, professional, trustworthy'
    });

    this.nicheEnhancements.set('alimentacion', {
      style: 'vibrant, appetizing, warm',
      lighting: 'warm, golden hour, food photography lighting',
      colors: 'warm oranges, rich browns, fresh greens',
      environment: 'kitchen, restaurant, dining setting, market',
      audioTone: 'inviting, warm, enthusiastic'
    });

    this.nicheEnhancements.set('tecnologia', {
      style: 'futuristic, sleek, innovative',
      lighting: 'cool LED lighting, blue tones, dramatic shadows',
      colors: 'electric blue, silver, black, neon accents',
      environment: 'tech lab, modern office, futuristic setting',
      audioTone: 'cutting-edge, confident, inspiring'
    });

    //console.log(`🎯 Loaded ${this.nicheEnhancements.size} niche enhancements`);
  }

  /**
   * Main processing pipeline: Spanish → Reasoning → English → Context Profile → Veo3 JSON
   */
  async processVideoRequest(spanishPrompt, options = {}) {
    const {
      niche = 'marketing-agency',
      template = 'veo3_cinematic',
      contextProfileId = null,
      reasoningModel = 'deepseek/deepseek-r1'
    } = options;

    ////console.log(`🎬 Processing Veo3 video request: "${spanishPrompt}"`);
    //console.log(`🎯 Niche: ${niche}, Template: ${template}`);

    const pipeline = {
      originalSpanish: spanishPrompt,
      steps: [],
      results: {}
    };

    try {
      // STEP 1: Parse Intent from Spanish
      const intent = await this.parseSpanishIntent(spanishPrompt);
      pipeline.steps.push('intent_parsed');
      pipeline.results.intent = intent;

      // STEP 2: Enhance with Reasoning Model
      const enhancedConcept = await this.enhanceWithReasoning(intent, reasoningModel);
      pipeline.steps.push('reasoning_enhanced');
      pipeline.results.enhancedConcept = enhancedConcept;

      // STEP 3: Translate to Technical English
      const technicalEnglish = await this.translateToTechnicalEnglish(enhancedConcept, intent);
      pipeline.steps.push('translated');
      pipeline.results.technicalEnglish = technicalEnglish;

      // STEP 4: Apply Context Profile
      const contextEnhanced = contextProfileId 
        ? await this.applyContextProfile(technicalEnglish, contextProfileId)
        : technicalEnglish;
      pipeline.steps.push('context_applied');
      pipeline.results.contextEnhanced = contextEnhanced;

      // STEP 5: Apply Niche Enhancement
      const nicheEnhanced = await this.applyNicheEnhancement(contextEnhanced, niche);
      pipeline.steps.push('niche_enhanced');
      pipeline.results.nicheEnhanced = nicheEnhanced;

      // STEP 6: Generate Veo3-optimized JSON
      const veo3Json = await this.generateVeo3Json(nicheEnhanced, template, intent);
      pipeline.steps.push('veo3_json_generated');
      pipeline.results.veo3Json = veo3Json;

      // STEP 7: Validate against proven examples
      const validation = this.validateAgainstExamples(veo3Json);
      pipeline.steps.push('validated');
      pipeline.results.validation = validation;

      ////console.log(`✅ Veo3 pipeline completed: ${pipeline.steps.length} steps`);
      
      return {
        success: true,
        pipeline,
        finalPrompt: veo3Json.prompt,
        audioInstructions: veo3Json.audio,
        metadata: {
          originalLanguage: 'spanish',
          finalLanguage: 'english',
          template: template,
          niche: niche,
          wordCount: veo3Json.prompt.split(' ').length,
          processingSteps: pipeline.steps.length
        }
      };

    } catch (error) {
      //console.error('❌ Veo3 pipeline failed:', error);
      return {
        success: false,
        error: error.message,
        pipeline,
        fallbackPrompt: spanishPrompt
      };
    }
  }

  /**
   * Parse intent from Spanish input
   */
  async parseSpanishIntent(spanishPrompt) {
    //console.log('🔍 Parsing Spanish intent...');

    // Extract key elements from Spanish prompt
    const intent = {
      product: null,
      action: null,
      character: null,
      environment: null,
      emotion: null,
      dialogue: null
    };

    // Simple keyword extraction (in production would use NLP)
    const productKeywords = ['pañal', 'producto', 'servicio', 'consultoría', 'comida', 'tecnología'];
    const actionKeywords = ['presentar', 'mostrar', 'revelar', 'transformar', 'demostrar'];
    const characterKeywords = ['avatar', 'persona', 'presentador', 'consultor', 'chef', 'experto'];

    for (const keyword of productKeywords) {
      if (spanishPrompt.toLowerCase().includes(keyword)) {
        intent.product = keyword;
        break;
      }
    }

    for (const keyword of actionKeywords) {
      if (spanishPrompt.toLowerCase().includes(keyword)) {
        intent.action = keyword;
        break;
      }
    }

    for (const keyword of characterKeywords) {
      if (spanishPrompt.toLowerCase().includes(keyword)) {
        intent.character = keyword;
        break;
      }
    }

    // Detect if dialogue is requested
    if (spanishPrompt.includes('hablando') || spanishPrompt.includes('diciendo') || spanishPrompt.includes('explicando')) {
      intent.dialogue = 'requested';
    }

    //console.log('✅ Intent parsed:', intent);
    return intent;
  }

  /**
   * Enhance concept with reasoning model
   */
  async enhanceWithReasoning(intent, model) {
    ////console.log(`🧠 Enhancing with reasoning model: ${model}`);

    // Mock reasoning enhancement (in production would call actual LLM)
    const enhancements = {
      cinematography: this.suggestCinematography(intent),
      narrative: this.buildNarrative(intent),
      technical: this.addTechnicalElements(intent),
      emotional: this.enhanceEmotionalImpact(intent)
    };

    //console.log('✅ Concept enhanced with reasoning');
    return enhancements;
  }

  /**
   * Translate to technical English with cinematography terms
   */
  async translateToTechnicalEnglish(enhancedConcept, originalIntent) {
    //console.log('🔄 Translating to technical English...');

    const translations = {
      'pañal': 'diaper product',
      'presentar': 'present professionally',
      'avatar': 'professional presenter',
      'consultoría': 'consulting services',
      'mostrar': 'showcase',
      'transformar': 'transform dramatically',
      'revelar': 'reveal cinematically'
    };

    let englishPrompt = originalIntent.product || 'product';
    
    // Apply translations while preserving dialogue in Spanish
    Object.entries(translations).forEach(([spanish, english]) => {
      if (originalIntent.product === spanish || originalIntent.action === spanish) {
        englishPrompt = englishPrompt.replace(spanish, english);
      }
    });

    // Add cinematography terminology
    const cinematicEnglish = {
      basePrompt: englishPrompt,
      shotType: enhancedConcept.cinematography.shotType,
      cameraMovement: enhancedConcept.cinematography.movement,
      lighting: enhancedConcept.cinematography.lighting,
      narrative: enhancedConcept.narrative
    };

    //console.log('✅ Translated to technical English');
    return cinematicEnglish;
  }

  /**
   * Apply context profile enhancement
   */
  async applyContextProfile(technicalPrompt, contextProfileId) {
    //console.log(`🎯 Applying context profile: ${contextProfileId}`);

    // Mock context profile application (in production would load actual profile)
    const contextEnhancements = {
      brandStyle: 'professional, trustworthy',
      colorPalette: 'brand colors with high contrast',
      messaging: 'emphasize quality and reliability',
      targetAudience: 'discerning consumers'
    };

    const enhanced = {
      ...technicalPrompt,
      brandContext: contextEnhancements,
      brandIntegration: 'seamlessly integrated brand elements'
    };

    //console.log('✅ Context profile applied');
    return enhanced;
  }

  /**
   * Apply niche-specific enhancements
   */
  async applyNicheEnhancement(prompt, niche) {
    //console.log(`🏷️ Applying niche enhancements: ${niche}`);

    const nicheData = this.nicheEnhancements.get(niche) || this.nicheEnhancements.get('higiene-personal');

    const enhanced = {
      ...prompt,
      nicheStyle: nicheData.style,
      nicheLighting: nicheData.lighting,
      nicheColors: nicheData.colors,
      nicheEnvironment: nicheData.environment,
      nicheAudioTone: nicheData.audioTone
    };

    //console.log('✅ Niche enhancements applied');
    return enhanced;
  }

  /**
   * Generate Veo3-optimized JSON
   */
  async generateVeo3Json(enhancedPrompt, templateName, originalIntent) {
    ////console.log(`📝 Generating Veo3 JSON with template: ${templateName}`);

    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Build the final prompt using template
    let finalPrompt = template.template;

    // Replace template variables
    const replacements = {
      '{shotType}': enhancedPrompt.shotType || 'Medium shot',
      '{subject}': enhancedPrompt.basePrompt || 'product',
      '{action}': originalIntent.action || 'being presented',
      '{environment}': enhancedPrompt.nicheEnvironment || 'professional setting',
      '{character}': originalIntent.character || 'professional presenter',
      '{dialogue}': this.generateDialogue(originalIntent, enhancedPrompt),
      '{audioDescription}': this.generateAudioDescription(enhancedPrompt),
      '{visualDetails}': this.generateVisualDetails(enhancedPrompt),
      '{cameraMovement}': enhancedPrompt.cameraMovement || 'smooth pan',
      '{lighting}': enhancedPrompt.nicheLighting || 'professional lighting'
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    // Ensure under 250 words
    const wordCount = finalPrompt.split(' ').length;
    if (wordCount > 250) {
      finalPrompt = finalPrompt.split(' ').slice(0, 247).join(' ') + '...';
      //console.log(`⚠️ Prompt truncated from ${wordCount} to 250 words`);
    }

    const veo3Json = {
      prompt: finalPrompt.trim(),
      audio: replacements['{audioDescription}'],
      duration: '8s',
      aspectRatio: '16:9',
      template: templateName,
      wordCount: finalPrompt.split(' ').length,
      metadata: {
        niche: enhancedPrompt.niche,
        hasDialogue: originalIntent.dialogue === 'requested',
        cinematicStyle: enhancedPrompt.nicheStyle
      }
    };

    ////console.log(`✅ Veo3 JSON generated (${veo3Json.wordCount} words)`);
    return veo3Json;
  }

  /**
   * Helper methods for content generation
   */
  suggestCinematography(intent) {
    const shotTypes = {
      'pañal': 'Close-up product shot',
      'consultoría': 'Medium two-shot',
      'tecnología': 'Dynamic tracking shot'
    };

    return {
      shotType: shotTypes[intent.product] || 'Medium shot',
      movement: 'Smooth dolly movement',
      lighting: 'Professional three-point lighting'
    };
  }

  buildNarrative(intent) {
    return {
      opening: 'Engaging product introduction',
      development: 'Clear benefit demonstration',
      climax: 'Key feature reveal',
      resolution: 'Call to action'
    };
  }

  addTechnicalElements(intent) {
    return {
      colorGrading: 'Warm, professional tone',
      soundDesign: 'Clean, professional audio',
      pacing: 'Measured, confident rhythm'
    };
  }

  enhanceEmotionalImpact(intent) {
    return {
      tone: 'Confident and trustworthy',
      mood: 'Professional yet approachable',
      energy: 'Engaging but not overwhelming'
    };
  }

  generateDialogue(intent, enhancedPrompt) {
    if (intent.dialogue !== 'requested') return '';

    const dialogues = {
      'pañal': 'Presenter: "La máxima protección para tu bebé"',
      'consultoría': 'Expert: "Transformamos tu negocio con estrategias probadas"',
      'tecnología': 'Innovator: "El futuro de la tecnología está aquí"'
    };

    return dialogues[intent.product] || 'Presenter: "Descubre la diferencia"';
  }

  generateAudioDescription(enhancedPrompt) {
    return `Professional ${enhancedPrompt.nicheAudioTone || 'confident'} narration with subtle background music, clear pronunciation, ${enhancedPrompt.brandContext?.messaging || 'emphasizing quality'}`;
  }

  generateVisualDetails(enhancedPrompt) {
    return `${enhancedPrompt.nicheStyle || 'Professional'} visual style, ${enhancedPrompt.nicheColors || 'brand colors'}, ${enhancedPrompt.brandIntegration || 'subtle brand integration'}`;
  }

  /**
   * Validate against proven examples
   */
  validateAgainstExamples(veo3Json) {
    const validation = {
      wordCount: veo3Json.wordCount <= 250,
      hasAudioTag: veo3Json.prompt.includes('AUDIO:'),
      hasDialogueFormat: veo3Json.prompt.includes(':') && veo3Json.prompt.includes('"'),
      hasCinematography: /shot|camera|lighting/i.test(veo3Json.prompt),
      isUnder250Words: veo3Json.wordCount <= 250
    };

    const passedChecks = Object.values(validation).filter(Boolean).length;
    const totalChecks = Object.keys(validation).length;

    ////console.log(`✅ Validation: ${passedChecks}/${totalChecks} checks passed`);

    return {
      ...validation,
      score: passedChecks / totalChecks,
      passed: passedChecks >= totalChecks * 0.8 // 80% threshold
    };
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      id: key,
      name: template.name,
      maxWords: template.maxWords,
      structure: template.structure
    }));
  }

  /**
   * Get supported niches
   */
  getSupportedNiches() {
    return Array.from(this.nicheEnhancements.keys());
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      templatesLoaded: this.templates.size,
      nichesSupported: this.nicheEnhancements.size,
      reasoningModels: this.reasoningModels.length,
      maxPromptWords: 250,
      optimalDuration: '8-12 seconds'
    };
  }

  /**
   * Detect language from brief text
   * Returns 'es' (español) or 'en' (english)
   * Default: 'es' (Spanish)
   */
  detectLanguageFromBrief(brief) {
    if (!brief || typeof brief !== 'string') {
      console.log(`  [INFO] No brief text provided, defaulting to Spanish`);
      return 'es';
    }

    // Spanish indicators (common words and patterns)
    const spanishIndicators = [
      /\b(el|la|los|las|un|una|unos|unas)\b/gi,
      /\b(de|del|al|para|por|con|sin|sobre)\b/gi,
      /\b(que|quien|cual|donde|cuando|como)\b/gi,
      /\b(es|son|está|están|ser|estar)\b/gi,
      /\b(campaña|producto|cliente|objetivo|precio|inversión)\b/gi,
      /\b(profesionales|departamentos|tecnología|ubicación)\b/gi,
      /á|é|í|ó|ú|ñ/gi
    ];

    // English indicators
    const englishIndicators = [
      /\bthe\b/gi,
      /\b(is|are|was|were|be|being|been)\b/gi,
      /\b(have|has|had)\b/gi,
      /\b(do|does|did|will|would|should|could)\b/gi,
      /\b(campaign|product|client|target|price|investment)\b/gi,
      /\b(professionals|apartments|technology|location)\b/gi
    ];

    // Count matches
    let spanishScore = 0;
    let englishScore = 0;

    spanishIndicators.forEach(regex => {
      const matches = brief.match(regex);
      if (matches) spanishScore += matches.length;
    });

    englishIndicators.forEach(regex => {
      const matches = brief.match(regex);
      if (matches) englishScore += matches.length;
    });

    // Determine language
    const detectedLanguage = spanishScore > englishScore ? 'es' :
                            englishScore > spanishScore ? 'en' :
                            'es'; // Default to Spanish if tie

    const languageName = detectedLanguage === 'es' ? 'Español' : 'English';
    console.log(`  [INFO] Detected language: ${detectedLanguage} (${languageName}) - Spanish: ${spanishScore}, English: ${englishScore}`);

    return detectedLanguage;
  }
}
