import { generateImageWithFlux } from '../lib/replicate-client.js';
import { generateVideoWithVeo3 } from '../lib/veo-client.js';
import { enhancePrompt, analyzeAndImprove } from '../lib/openrouter-client.js';
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
      imagePrompt,
      videoPrompt = null,
      videoStyle = 'cinematic',
      saveLocally = true,
      inputImage = null,
      enhanceWithAI = true,
      enhancementModel = 'anthropic/claude-3.5-sonnet',
      analyzePrompts = false,
      analysisType = 'creative'
    } = req.body;

    if (!imagePrompt || imagePrompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'imagePrompt is required'
      });
    }

    console.log(`🎯 Starting COMPLETE generation with AI enhancement...`);
    console.log(`🎨 Original image prompt: "${imagePrompt}"`);

    const startTime = Date.now();
    let analysis = null;

    // PASO 0: Análisis opcional del prompt
    if (analyzePrompts) {
      console.log(`🔍 Analyzing prompt for ${analysisType} improvements...`);
      analysis = await analyzeAndImprove(imagePrompt, analysisType, 'openai/o1-mini');
    }

    // PASO 1: Mejorar prompt de imagen
    let finalImagePrompt = imagePrompt;
    let imageEnhancementResult = null;

    if (enhanceWithAI) {
      console.log(`🧠 Enhancing image prompt...`);
      imageEnhancementResult = await enhancePrompt(imagePrompt, 'image', enhancementModel);
      
      if (imageEnhancementResult.success) {
        finalImagePrompt = imageEnhancementResult.enhancedPrompt;
        console.log(`✨ Enhanced image prompt: "${finalImagePrompt}"`);
      } else {
        console.warn(`⚠️ Image enhancement failed: ${imageEnhancementResult.error}`);
        finalImagePrompt = imageEnhancementResult.fallbackPrompt || imagePrompt;
      }
    }

    // PASO 2: Generar imagen
    console.log(`🎯 Generating image with FLUX.1...`);
    const imageResult = await generateImageWithFlux(finalImagePrompt, inputImage);

    if (!imageResult.success) {
      return res.status(500).json({
        success: false,
        error: `Image generation failed: ${imageResult.error}`,
        stage: 'image',
        analysis: analysis
      });
    }

    console.log(`✅ Image generated successfully`);

    // PASO 3: Guardar imagen localmente
    let imageSaveResult = null;
    let imagePublicUrl = imageResult.imageUrl;

    if (saveLocally) {
      const imageFileName = generateFileName('image', 'png');
      imageSaveResult = await downloadAndSaveFile(imageResult.imageUrl, imageFileName, 'generated');
      
      if (imageSaveResult.success) {
        imagePublicUrl = imageSaveResult.publicUrl;
        console.log(`💾 Image saved: ${imagePublicUrl}`);
      }
    }

    // PASO 4: Preparar y mejorar prompt de video
    const baseVideoPrompt = videoPrompt || imagePrompt;
    let finalVideoPrompt = baseVideoPrompt;
    let videoEnhancementResult = null;

    if (enhanceWithAI) {
      console.log(`🧠 Enhancing video prompt...`);
      videoEnhancementResult = await enhancePrompt(baseVideoPrompt, 'video', enhancementModel);
      
      if (videoEnhancementResult.success) {
        finalVideoPrompt = videoEnhancementResult.enhancedPrompt;
        console.log(`✨ AI Enhanced video prompt: "${finalVideoPrompt}"`);
      } else {
        console.warn(`⚠️ Video AI enhancement failed: ${videoEnhancementResult.error}`);
        finalVideoPrompt = videoEnhancementResult.fallbackPrompt || baseVideoPrompt;
      }
    }

    // Aplicar enhancement técnico
    finalVideoPrompt = enhancePromptForVideo(finalVideoPrompt, videoStyle);
    console.log(`⚡ Final video prompt: "${finalVideoPrompt}"`);

    // PASO 5: Generar video
    console.log(`🎬 Generating video with Veo 3...`);
    const videoResult = await generateVideoWithVeo3(finalVideoPrompt, imageResult.imageUrl);

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
          prompts: {
            original: imagePrompt,
            final: finalImagePrompt
          }
        },
        analysis: analysis
      });
    }

    console.log(`✅ Video generated successfully`);

    // PASO 6: Guardar video localmente
    let videoSaveResult = null;
    let videoPublicUrl = videoResult.videoUrl;

    if (saveLocally) {
      const videoFileName = generateFileName('video', 'mp4');
      videoSaveResult = await downloadAndSaveFile(videoResult.videoUrl, videoFileName, 'videos');
      
      if (videoSaveResult.success) {
        videoPublicUrl = videoSaveResult.publicUrl;
        console.log(`💾 Video saved: ${videoPublicUrl}`);
      }
    }

    // RESPUESTA COMPLETA CON TODA LA METADATA
    const processingTime = Date.now() - startTime;
    
    const response = {
      success: true,
      stage: 'complete',
      image: {
        url: imageResult.imageUrl,
        publicUrl: imagePublicUrl,
        localPath: imageSaveResult?.localPath,
        seed: imageResult.seed,
        prompts: {
          original: imagePrompt,
          final: finalImagePrompt,
          enhanced: enhanceWithAI
        }
      },
      video: {
        url: videoResult.videoUrl,
        publicUrl: videoPublicUrl,
        localPath: videoSaveResult?.localPath,
        duration: videoResult.duration,
        prompts: {
          original: baseVideoPrompt,
          final: finalVideoPrompt,
          aiEnhanced: enhanceWithAI,
          technicalEnhanced: true
        }
      },
      enhancement: {
        image: imageEnhancementResult ? {
          model: imageEnhancementResult.model,
          success: imageEnhancementResult.success
        } : null,
        video: videoEnhancementResult ? {
          model: videoEnhancementResult.model,
          success: videoEnhancementResult.success
        } : null
      },
      analysis: analysis,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        enhancementModel: enhanceWithAI ? enhancementModel : null,
        videoStyle: videoStyle,
        analysisUsed: analyzePrompts
      }
    };

    console.log(`🎉 COMPLETE generation finished! Time: ${processingTime}ms`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in generate-complete:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stage: 'unknown'
    });
  }
} 