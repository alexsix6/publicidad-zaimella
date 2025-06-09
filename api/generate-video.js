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
      enhancementModel = 'anthropic/claude-3.5-sonnet',
      useUtilsEnhancement = true,
      aspectRatio = '16:9',
      duration = '8s'
    } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log(`🎬 Original video prompt: "${prompt}"`);

    let finalPrompt = prompt;
    let enhancementResult = null;

    // PASO 1: Mejorar prompt con OpenRouter (si está habilitado)
    if (enhanceWithAI) {
      console.log(`🧠 Enhancing video prompt with ${enhancementModel}...`);
      
      enhancementResult = await enhancePrompt(prompt, 'video', enhancementModel);
      
      if (enhancementResult.success) {
        finalPrompt = enhancementResult.enhancedPrompt;
        console.log(`✨ AI Enhanced prompt: "${finalPrompt}"`);
      } else {
        console.warn(`⚠️ AI Enhancement failed: ${enhancementResult.error}`);
        finalPrompt = enhancementResult.fallbackPrompt || prompt;
      }
    }

    // PASO 2: Aplicar enhancement de utils (si está habilitado)
    if (useUtilsEnhancement) {
      console.log(`🔧 Applying technical enhancement for ${videoStyle}...`);
      finalPrompt = enhancePromptForVideo(finalPrompt, videoStyle);
      console.log(`⚡ Technical Enhanced prompt: "${finalPrompt}"`);
    }

    if (imageUrl) {
      console.log(`🖼️ Using base image: ${imageUrl}`);
    }

    // PASO 3: Generar video con Veo 3
    console.log(`🎯 Generating video with Veo 3 (${aspectRatio}, ${duration})...`);
    const videoResult = await generateVideoWithVeo3(finalPrompt, imageUrl, aspectRatio, duration);

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

    console.log(`✅ Video generated successfully`);

    // PASO 4: Guardar video localmente (si se solicita)
    let saveResult = null;
    let publicUrl = videoResult.videoUrl;

    if (saveLocally) {
      console.log(`💾 Saving video locally...`);
      const fileName = generateFileName('video', 'mp4');
      saveResult = await downloadAndSaveFile(videoResult.videoUrl, fileName, 'videos');
      
      if (saveResult.success) {
        publicUrl = saveResult.publicUrl;
        console.log(`✅ Video saved: ${publicUrl}`);
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