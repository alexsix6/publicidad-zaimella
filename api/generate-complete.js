// api/generate-complete.js - VERSIÓN INTEGRADA CON CONTEXT PROFILES
// 🎯 FIXED VERSION: Proper model passing + Digital Twin support + Surgical fixes

import { generateImageWithFlux } from '../lib/replicate-client.js';
import { generateVideoWithVeo3 } from '../lib/veo-client.js';
import { downloadAndSaveFile, generateFileName, enhancePromptForVideo } from '../lib/utils.js';
import { CONFIG, initializeConfig } from '../lib/config/index.js';
import { enhanceImagePrompt, enhanceVideoPrompt } from '../lib/unified/enhancer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // 🏗️ Inicializar configuración
    await initializeConfig();

    const { 
      imagePrompt,
      videoPrompt = null,
      model = CONFIG.generation.image.defaultModel,
      
      // 🎯 NUEVOS CAMPOS - CONTEXT PROFILES
      contextProfileId = null,
      autoSelectProfile = CONFIG.profiles.autoSelectProfile,
      
      // 🎨 CONFIGURACIÓN DE IMAGEN
      imageModel = model,
      imageAspectRatio = CONFIG.generation.image.defaultAspectRatio,
      imageFormat = CONFIG.generation.image.defaultFormat,
      
      // 🎬 CONFIGURACIÓN DE VIDEO
      videoStyle = 'cinematic',
      videoAspectRatio = CONFIG.generation.video.defaultAspectRatio,
      videoDuration = CONFIG.generation.video.defaultDuration,
      
      // 🧠 IA Y WORKFLOW
      enhancePrompts = true,
      enhancementModel = CONFIG.generation.enhancement.defaultModel,
      useImageAsBase = true,
      saveLocally = CONFIG.storage.saveLocally,
      
      // 🔄 COMPATIBILIDAD
      enhanceWithAI = enhancePrompts,
      inputImage = null,
      analyzePrompts = false,
      analysisType = 'creative',
      
      // 🆕 NEW: Workflow parameter for context clarity
      workflow = useImageAsBase ? 'Image→Video' : 'Independent'
    } = req.body;

    if (!imagePrompt || imagePrompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'imagePrompt is required'
      });
    }

    //console.log(`🎯 Starting COMPLETE generation with UNIFIED enhancement...`);
    //console.log(`🎨 Original image prompt: "${imagePrompt}"`);
    //console.log(`🎯 Context Profile: ${contextProfileId || 'auto-select'}`);
    //console.log(`🔄 Workflow mode: ${workflow}`);
    //console.log(`🧠 AI Enhancement: ${enhancePrompts ? enhancementModel : 'Disabled'}`);

    const startTime = Date.now();

    // PASO 1: ✨ ENHANCEMENT UNIFICADO DE IMAGEN
    let finalImagePrompt = imagePrompt;
    let imageEnhancementResult = null;

    if (enhancePrompts) {
      //console.log(`🧠 Enhancing image prompt with unified system...`);
      
      // 🎯 FIXED: Pasar modelo correcto y tipo explícito
      imageEnhancementResult = await enhanceImagePrompt(imagePrompt, {
        type: 'image', // 🎯 EXPLICIT TYPE
        contextProfileId: contextProfileId,
        useAI: true,
        aiModel: enhancementModel, // Para AI enhancement del prompt
        targetModel: imageModel, // 🆕 FIXED: Para evitar predeterminación en context enhancer
        autoSelectProfile: autoSelectProfile,
        includeAnalysis: analyzePrompts,
        useSanitizer: true // 🛡️ Ensure sanitization is enabled
      });
      
      if (imageEnhancementResult.success) {
        finalImagePrompt = imageEnhancementResult.enhancedPrompt;
        console.log(`✨ UNIFIED Enhanced image prompt: "${finalImagePrompt}"`);
        console.log(`📊 Enhancement steps: ${imageEnhancementResult.steps.join(' → ')}`);
        //console.log(`🎯 Context applied: ${imageEnhancementResult.contextApplied}`);
        console.log(`🤖 AI enhanced: ${imageEnhancementResult.aiEnhanced}`);
        
        // 🆕 NEW: Log Digital Twin info if available
        if (imageEnhancementResult.metadata?.digitalTwinMode) {
          console.log(`🔍 Digital Twin mode activated for profile: ${imageEnhancementResult.profileUsed}`);
        }
      } else {
        console.warn(`⚠️ Image enhancement failed: ${imageEnhancementResult.error || 'Unknown error'}`);
        finalImagePrompt = imagePrompt;
      }
    }

    // PASO 2: Generar imagen con parámetros optimizados
    //console.log(`🎯 Generating image with FLUX.1 (${imageModel})...`);
    //console.log(`📐 Image settings: ${imageAspectRatio}, ${imageFormat}`);
    //console.log(`🎨 Using model: ${imageModel}`); // 🎯 CONFIRM CORRECT MODEL
    
    const imageResult = await generateImageWithFlux(
      finalImagePrompt, 
      inputImage, 
      imageModel, // 🎯 USER SELECTED MODEL
      imageAspectRatio, 
      imageFormat
    );

    if (!imageResult.success) {
      return res.status(500).json({
        success: false,
        error: `Image generation failed: ${imageResult.error}`,
        stage: 'image',
        enhancement: imageEnhancementResult ? {
          success: imageEnhancementResult.success,
          originalPrompt: imagePrompt,
          enhancedPrompt: imageEnhancementResult.enhancedPrompt,
          contextApplied: imageEnhancementResult.contextApplied,
          aiEnhanced: imageEnhancementResult.aiEnhanced,
          sanitized: imageEnhancementResult.sanitized,
          sanitizationLog: imageEnhancementResult.sanitizationLog,
          preSanitizationPrompt: imageEnhancementResult.preSanitizationPrompt,
          postAISanitized: imageEnhancementResult.postAISanitized,
          profileUsed: imageEnhancementResult.profileUsed,
          analysis: imageEnhancementResult.analysis,
          steps: imageEnhancementResult.steps,
          metadata: imageEnhancementResult.metadata
        } : null
      });
    }

    //console.log(`✅ Image generated successfully`);

    // PASO 3: Guardar imagen localmente
    let imageSaveResult = null;
    let imagePublicUrl = imageResult.imageUrl;

    if (saveLocally) {
      const imageFileName = generateFileName('image', imageFormat, imageAspectRatio, imageModel);
      imageSaveResult = await downloadAndSaveFile(imageResult.imageUrl, imageFileName, 'generated');
      
      if (imageSaveResult.success) {
        imagePublicUrl = imageSaveResult.publicUrl;
        //console.log(`💾 Image saved: ${imagePublicUrl}`);
      } else {
        console.warn(`⚠️ Failed to save image locally: ${imageSaveResult.error}`);
      }
    }

    // PASO 4: ✨ ENHANCEMENT UNIFICADO DE VIDEO
    const baseVideoPrompt = videoPrompt || imagePrompt;
    let finalVideoPrompt = baseVideoPrompt;
    let videoEnhancementResult = null;

    if (enhancePrompts) {
      //console.log(`🧠 Enhancing video prompt with unified system...`);
      
      // 🎯 FIXED: Pasar tipo explícito y usar mismo context profile
      videoEnhancementResult = await enhanceVideoPrompt(baseVideoPrompt, {
        type: 'video', // 🎯 EXPLICIT TYPE
        contextProfileId: contextProfileId, // Usar el mismo perfil de imagen
        useAI: true,
        aiModel: enhancementModel, // Para AI enhancement del prompt
        targetModel: 'veo-3', // 🆕 FIXED: Video siempre usa Veo 3
        autoSelectProfile: false, // Ya seleccionado en imagen si aplica
        includeAnalysis: false, // No necesario para video
        useSanitizer: true // 🛡️ Ensure sanitization is enabled
      });
      
      if (videoEnhancementResult.success) {
        finalVideoPrompt = videoEnhancementResult.enhancedPrompt;
        console.log(`✨ UNIFIED Enhanced video prompt: "${finalVideoPrompt}"`);
        console.log(`📊 Enhancement steps: ${videoEnhancementResult.steps.join(' → ')}`);
        //console.log(`🎯 Context applied: ${videoEnhancementResult.contextApplied}`);
        console.log(`🤖 AI enhanced: ${videoEnhancementResult.aiEnhanced}`);
      } else {
        console.warn(`⚠️ Video AI enhancement failed: ${videoEnhancementResult.error || 'Unknown error'}`);
        finalVideoPrompt = baseVideoPrompt;
      }
    }

    // Aplicar enhancement técnico adicional
    finalVideoPrompt = enhancePromptForVideo(finalVideoPrompt, videoStyle);
    console.log(`⚡ Final video prompt: "${finalVideoPrompt}"`);

    // PASO 5: Generar video con configuración optimizada
    const videoBaseImage = useImageAsBase ? imageResult.imageUrl : null;
    //console.log(`🎬 Generating video with Veo 3...`);
    //console.log(`📐 Video settings: ${videoAspectRatio}, ${videoDuration}`);
    //console.log(`🖼️ Using image as base: ${useImageAsBase ? 'YES' : 'NO'}`);
    
    const videoResult = await generateVideoWithVeo3(
      finalVideoPrompt,
      videoBaseImage,
      videoAspectRatio,
      videoDuration
    );

    if (!videoResult.success) {
      // Retornar imagen exitosa pero video fallido
      return res.status(207).json({
        success: false,
        error: `Video generation failed: ${videoResult.error}`,
        stage: 'video',
        imageResult: {
          success: true,
          imageUrl: imageResult.imageUrl,
          publicUrl: imagePublicUrl,
          localPath: imageSaveResult?.localPath,
          seed: imageResult.seed,
          prompts: {
            original: imagePrompt,
            final: finalImagePrompt,
            enhanced: enhancePrompts
          },
          enhancement: imageEnhancementResult ? {
            success: imageEnhancementResult.success,
            contextApplied: imageEnhancementResult.contextApplied,
            aiEnhanced: imageEnhancementResult.aiEnhanced,
            sanitized: imageEnhancementResult.sanitized,
            profileUsed: imageEnhancementResult.profileUsed,
            steps: imageEnhancementResult.steps,
            analysis: imageEnhancementResult.analysis,
            // 🆕 NEW: Include Digital Twin info
            digitalTwinMode: imageEnhancementResult.metadata?.digitalTwinMode,
            profileType: imageEnhancementResult.metadata?.profileType
          } : null
        }
      });
    }

    //console.log(`✅ Video generated successfully`);

    // PASO 6: Guardar video localmente
    let videoSaveResult = null;
    let videoPublicUrl = videoResult.videoUrl;

    if (saveLocally) {
      const videoFileName = generateFileName('video', 'mp4', videoAspectRatio);
      videoSaveResult = await downloadAndSaveFile(videoResult.videoUrl, videoFileName, 'videos');
      
      if (videoSaveResult.success) {
        videoPublicUrl = videoSaveResult.publicUrl;
        //console.log(`💾 Video saved: ${videoPublicUrl}`);
      } else {
        console.warn(`⚠️ Failed to save video locally: ${videoSaveResult.error}`);
      }
    }

    // RESPUESTA COMPLETA CON METADATA UNIFICADA
    const processingTime = Date.now() - startTime;
    
    const response = {
      success: true,
      stage: 'complete',
      
      // 🎨 RESULTADOS DE IMAGEN
      image: {
        url: imageResult.imageUrl,
        publicUrl: imagePublicUrl,
        localPath: imageSaveResult?.localPath,
        seed: imageResult.seed,
        model: imageModel, // 🎯 CONFIRMED USER MODEL
        prompts: {
          original: imagePrompt,
          final: finalImagePrompt,
          enhanced: enhancePrompts
        },
        enhancement: imageEnhancementResult ? {
          success: imageEnhancementResult.success,
          originalPrompt: imagePrompt,
          enhancedPrompt: imageEnhancementResult.enhancedPrompt,
          contextApplied: imageEnhancementResult.contextApplied,
          sanitized: imageEnhancementResult.sanitized,
          sanitizationLog: imageEnhancementResult.sanitizationLog,
          preSanitizationPrompt: imageEnhancementResult.preSanitizationPrompt,
          postAISanitized: imageEnhancementResult.postAISanitized,
          aiEnhanced: imageEnhancementResult.aiEnhanced,
          profileUsed: imageEnhancementResult.profileUsed,
          steps: imageEnhancementResult.steps,
          analysis: imageEnhancementResult.analysis,
          // 🆕 NEW: Include Digital Twin metadata
          digitalTwinMode: imageEnhancementResult.metadata?.digitalTwinMode,
          profileType: imageEnhancementResult.metadata?.profileType,
          metadata: imageEnhancementResult.metadata
        } : null
      },
      
      // 🎬 RESULTADOS DE VIDEO
      video: {
        url: videoResult.videoUrl,
        publicUrl: videoPublicUrl,
        localPath: videoSaveResult?.localPath,
        duration: videoResult.duration,
        prompts: {
          original: baseVideoPrompt,
          final: finalVideoPrompt,
          aiEnhanced: enhancePrompts,
          technicalEnhanced: true
        },
        enhancement: videoEnhancementResult ? {
          success: videoEnhancementResult.success,
          originalPrompt: baseVideoPrompt,
          enhancedPrompt: videoEnhancementResult.enhancedPrompt,
          contextApplied: videoEnhancementResult.contextApplied,
          sanitized: videoEnhancementResult.sanitized,
          sanitizationLog: videoEnhancementResult.sanitizationLog,
          postAISanitized: videoEnhancementResult.postAISanitized,
          aiEnhanced: videoEnhancementResult.aiEnhanced,
          profileUsed: videoEnhancementResult.profileUsed,
          steps: videoEnhancementResult.steps,
          metadata: videoEnhancementResult.metadata
        } : null
      },

      // 📊 METADATA EMPRESARIAL MEJORADA
      metadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        workflow: workflow,
        
        // 🎯 CONTEXT PROFILE USAGE
        contextProfile: {
          requested: contextProfileId,
          used: imageEnhancementResult?.profileUsed || videoEnhancementResult?.profileUsed,
          autoSelected: autoSelectProfile && !contextProfileId,
          // 🆕 NEW: Digital Twin info
          digitalTwinMode: imageEnhancementResult?.metadata?.digitalTwinMode || false,
          profileType: imageEnhancementResult?.metadata?.profileType || 'standard'
        },
        
        // 🧠 ENHANCEMENT DETAILS MEJORADOS
        enhancement: {
          enabled: enhancePrompts,
          model: enhancePrompts ? enhancementModel : null,
          imageSteps: imageEnhancementResult?.steps.length || 0,
          videoSteps: videoEnhancementResult?.steps.length || 0,
          totalImprovements: (imageEnhancementResult?.metadata?.improvementRatio || 1) + 
                           (videoEnhancementResult?.metadata?.improvementRatio || 1),
          // 🛡️ NEW: Sanitization info
          sanitization: {
            imageTermsSanitized: imageEnhancementResult?.metadata?.termsSanitized || 0,
            videoTermsSanitized: videoEnhancementResult?.metadata?.termsSanitized || 0,
            postAISanitized: (imageEnhancementResult?.postAISanitized || false) || 
                           (videoEnhancementResult?.postAISanitized || false)
          }
        },
        
        // 🎨 CONFIGURATION USED
        config: {
          imageModel: imageModel, // 🎯 USER SELECTED MODEL
          imageAspectRatio: imageAspectRatio,
          imageFormat: imageFormat,
          videoStyle: videoStyle,
          videoAspectRatio: videoAspectRatio,
          videoDuration: videoDuration,
          useImageAsBase: useImageAsBase,
          workflow: workflow
        },
        
        // 📈 PERFORMANCE MEJORADA
        performance: {
          processingTimeMs: processingTime,
          enhancementEnabled: enhancePrompts,
          profilesEnabled: Boolean(contextProfileId || autoSelectProfile),
          saveLocallyEnabled: saveLocally,
          // 🆕 NEW: Additional performance metrics
          imageGenerationSuccess: imageResult.success,
          videoGenerationSuccess: videoResult.success,
          localSaveSuccess: {
            image: imageSaveResult?.success || false,
            video: videoSaveResult?.success || false
          }
        }
      }
    };

    console.log(`🎉 UNIFIED generation completed! Time: ${processingTime}ms`);
    //console.log(`🎯 Context Profile used: ${response.metadata.contextProfile.used || 'none'}`);
    console.log(`🔍 Digital Twin mode: ${response.metadata.contextProfile.digitalTwinMode}`);
    //console.log(`🎨 Image model used: ${imageModel}`); // 🎯 CONFIRM USER MODEL
    console.log(`📊 Total enhancement steps: ${response.metadata.enhancement.imageSteps + response.metadata.enhancement.videoSteps}`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in unified generate-complete:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stage: 'initialization'
    });
  }
}