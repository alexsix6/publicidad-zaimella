import { generateVideoWithVeo3 } from '../lib/veo-client.js';
import { enhancePrompt } from '../lib/openrouter-client.js';
import { downloadAndSaveFile, generateFileName, enhancePromptForVideo } from '../lib/utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const {
      prompt,
      imageUrl = null,
      videoStyle = 'cinematic',
      saveLocally = true,
      enhanceWithAI = true,
      enhancementModel = 'openai/gpt-4o-mini', // 🆕 Mejor para templates estructurados Veo3
      useUtilsEnhancement = true,
      aspectRatio, // 🆕 Sin default - se auto-detectará
      duration = '8s',
      testMode = false, // 🆕 Modo de testing sin consumir saldo
      // 🆕 PARÁMETROS PARA AUTO-DETECCIÓN
      platform = null, // instagram, linkedin, tiktok, etc.
      format = null,    // post, story, reel, etc.
      language = 'es', // 🆕 PHASE 2: Language parameter (default Spanish)
      contextProfileId = null // 🆕 PHASE 3: Context Profile ID for Digital Twin
    } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // 🆕 AUTO-DETECCIÓN DE ASPECT RATIO Y DURATION POR PLATAFORMA
    let finalAspectRatio = aspectRatio;
    let maxAllowedDuration = duration;
    let platformContext = null;
    
    if (platform) {
      try {
        // Importar VariantGenerator para obtener especificaciones
        const { VariantGenerator } = await import('../mcp/tools/variant-generator.js');
        const variantGenerator = new VariantGenerator();
        await variantGenerator.initialize();
        
        const platformSpec = variantGenerator.platformSpecs.get(platform);
        if (platformSpec) {
          const formatKey = format || Object.keys(platformSpec.formats)[0];
          const formatSpec = platformSpec.formats[formatKey];
          
          if (formatSpec) {
            // Auto-detectar aspect ratio
            if (!finalAspectRatio) {
              finalAspectRatio = formatSpec.aspectRatio || '16:9';
            }
            
            // Validar duration contra maxDuration de la plataforma
            if (formatSpec.maxDuration && formatSpec.maxDuration !== 'unlimited') {
              const maxSeconds = parseInt(formatSpec.maxDuration);
              const requestedSeconds = parseInt(duration);
              
              if (requestedSeconds > maxSeconds) {
                maxAllowedDuration = formatSpec.maxDuration;
                console.log(`⚠️ Duration adjusted from ${duration} to ${maxAllowedDuration} for ${platform}:${formatKey}`);
              }
            }
            
            // Construir contexto de plataforma
            platformContext = {
              platform,
              format: formatKey,
              toneOfVoice: platformSpec.toneOfVoice,
              demographics: platformSpec.demographics,
              bestPractices: platformSpec.bestPractices,
              contentTypes: platformSpec.contentTypes,
              maxDuration: formatSpec.maxDuration
            };
            
            //console.log(`🎯 Platform context loaded: ${platform}:${formatKey} - ${platformSpec.toneOfVoice}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load platform context: ${error.message}`);
      }
    }
    
    // Fallbacks finales
    finalAspectRatio = finalAspectRatio || '16:9';
    maxAllowedDuration = maxAllowedDuration || duration;

    //console.log(`🎬 Original video prompt: "${prompt}"`);

    let finalPrompt = prompt;
    let enhancementResult = null;

    // PASO 1: Mejorar prompt con OpenRouter (solo si está habilitado)
    if (enhanceWithAI) {
      console.log(`🧠 Enhancing video prompt with ${enhancementModel}...`);
      
      // 🆕 Pasar el parámetro enhanceEnabled correctamente + platform context
      enhancementResult = await enhancePrompt(prompt, 'video', enhancementModel, true, false, platformContext);
      
      if (enhancementResult.success && enhancementResult.enhanced) {
        finalPrompt = enhancementResult.enhancedPrompt;
        console.log(`✨ AI Enhanced prompt (${enhancementResult.promptLength} chars): "${finalPrompt}"`);
        
        // 🆕 VALIDACIÓN CRÍTICA: Verificar límite de 500 chars para Veo 3
        if (enhancementResult.warning) {
          console.warn(`⚠️ ${enhancementResult.warning}`);
        }
        if (!enhancementResult.withinLimits) {
          console.warn(`⚠️ Prompt may be too long for Veo 3 (${enhancementResult.promptLength} chars > 500)`);
        }
        if (enhancementResult.modelInfo) {
          //console.log(`💰 Cost level: ${enhancementResult.modelInfo.cost}`);
        }
      } else {
        console.warn(`⚠️ AI Enhancement failed: ${enhancementResult.error}`);
        finalPrompt = enhancementResult.fallbackPrompt || prompt;
      }
    } else {
      //console.log(`📝 AI enhancement disabled, using original prompt`);
      enhancementResult = await enhancePrompt(prompt, 'video', enhancementModel, false, false, platformContext);
    }

    // PASO 2: Aplicar enhancement de utils (si está habilitado)
    if (useUtilsEnhancement) {
      //console.log(`🔧 Applying technical enhancement for ${videoStyle}...`);
      finalPrompt = enhancePromptForVideo(finalPrompt, videoStyle);
      console.log(`⚡ Technical Enhanced prompt: "${finalPrompt}"`);
    }

    if (imageUrl) {
      //console.log(`🖼️ Using base image: ${imageUrl}`);
    }

    // 🆕 PHASE 2: Add language indicator to prompt
    const languageIndicator = language === 'es' ? '[AUDIO: ESPAÑOL]' : '[AUDIO: ENGLISH]';
    let promptWithLanguage = `${languageIndicator} ${finalPrompt}`;
    console.log(`🌍 Language set to: ${language === 'es' ? 'Español' : 'English'}`);

    // 🆕 PHASE 3: Load Digital Twin profile and add physical characteristics to prompt
    if (contextProfileId) {
      try {
        // Import context profile manager
        const { contextProfileManager } = await import('../lib/context-profile-manager.js');

        // Load profile
        const profile = contextProfileManager.getProfile(contextProfileId);

        if (profile && profile.digitalTwin && profile.digitalTwin.physicalCharacteristics) {
          const characteristics = profile.digitalTwin.physicalCharacteristics;

          // Build physical description string
          const physicalDescription = [
            characteristics.gender ? `${characteristics.gender}` : null,
            characteristics.age ? `approximately ${characteristics.age} years old` : null,
            characteristics.ethnicity ? `${characteristics.ethnicity} ethnicity` : null,
            characteristics.height ? `${characteristics.height} height` : null,
            characteristics.build ? `${characteristics.build} build` : null,
            characteristics.hairColor ? `${characteristics.hairColor} hair` : null,
            characteristics.hairStyle ? `styled ${characteristics.hairStyle}` : null,
            characteristics.eyeColor ? `${characteristics.eyeColor} eyes` : null,
            characteristics.facialFeatures ? `with ${characteristics.facialFeatures}` : null,
            characteristics.clothing ? `wearing ${characteristics.clothing}` : null
          ].filter(Boolean).join(', ');

          if (physicalDescription) {
            promptWithLanguage = `${promptWithLanguage} [Character: ${physicalDescription}]`;
            console.log(`🎯 Digital Twin characteristics added: ${contextProfileId}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load Digital Twin profile ${contextProfileId}: ${error.message}`);
        // Continue without Digital Twin characteristics
      }
    }

    // PASO 3: Generar video con Veo 3
    //console.log(`🎯 Generating video with Veo 3 (${finalAspectRatio}, ${maxAllowedDuration})...`);
    const videoResult = await generateVideoWithVeo3(promptWithLanguage, imageUrl, finalAspectRatio, maxAllowedDuration);

    if (!videoResult.success) {
      return res.status(500).json({
        success: false,
        error: `Video generation failed: ${videoResult.error}`,
        prompts: {
          original: prompt,
          final: finalPrompt
        }
      });
    }

    //console.log(`✅ Video generated successfully`);

    // PASO 4: Guardar video localmente (si se solicita)
    let saveResult = null;
    let publicUrl = videoResult.videoUrl;

    if (saveLocally) {
      //console.log(`💾 Saving video locally...`);
      const fileName = generateFileName('video', 'mp4');
      saveResult = await downloadAndSaveFile(videoResult.videoUrl, fileName, 'videos');
      
      if (saveResult.success) {
        publicUrl = saveResult.publicUrl;
        //console.log(`✅ Video saved: ${publicUrl}`);
      } else {
        console.warn(`⚠️ Save failed: ${saveResult.error}`);
      }
    }

    // RESPUESTA COMPLETA
    const response = {
      success: true,
      videoUrl: videoResult.videoUrl,
      publicUrl: publicUrl,
      localPath: saveResult?.localPath,
      duration: videoResult.duration,
      imageUrl: imageUrl,
      prompts: {
        original: prompt,
        final: finalPrompt,
        aiEnhanced: enhanceWithAI,
        utilsEnhanced: useUtilsEnhancement
      },
      enhancement: {
        ai: enhancementResult ? {
          model: enhancementResult.model,
          success: enhancementResult.success
        } : null,
        technical: useUtilsEnhancement ? {
          style: videoStyle,
          applied: true
        } : null
      },
      metadata: {
        timestamp: new Date().toISOString(),
        enhancementModel: enhanceWithAI ? enhancementModel : null,
        videoStyle: videoStyle
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in generate-video:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
} 