// API Endpoint: /api/generate-image
// Función serverless para generar imágenes con FLUX.1 Kontext Max via Replicate

import { generateImageWithFlux } from '../lib/replicate-client.js';
import { enhancePrompt } from '../lib/openrouter-client.js';
import { downloadAndSaveFile, generateFileName } from '../lib/utils.js';

export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { 
      prompt, 
      inputImage = null, 
      saveLocally = true,
      enhanceWithAI = true,
      enhancementModel = 'anthropic/claude-3.5-sonnet',
      model = 'base',
      aspectRatio = '16:9',
      outputFormat = 'png'
    } = req.body;

    // Validar prompt
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log(`🎨 Original prompt: "${prompt}"`);

    let finalPrompt = prompt;
    let enhancementResult = null;

    // PASO 1: Mejorar prompt con OpenRouter (si está habilitado)
    if (enhanceWithAI) {
      console.log(`🧠 Enhancing prompt with ${enhancementModel}...`);
      
      enhancementResult = await enhancePrompt(prompt, 'image', enhancementModel);
      
      if (enhancementResult.success) {
        finalPrompt = enhancementResult.enhancedPrompt;
        console.log(`✨ Enhanced prompt: "${finalPrompt}"`);
      } else {
        console.warn(`⚠️ Enhancement failed, using original: ${enhancementResult.error}`);
        finalPrompt = enhancementResult.fallbackPrompt || prompt;
      }
    }

    // PASO 2: Generar imagen con FLUX.1
    console.log(`🎯 Generating image with FLUX.1 (${model}, ${aspectRatio}, ${outputFormat})...`);
    const imageResult = await generateImageWithFlux(finalPrompt, inputImage, model, aspectRatio, outputFormat);

    if (!imageResult.success) {
      return res.status(500).json({
        success: false,
        error: `Image generation failed: ${imageResult.error}`,
        enhancementUsed: enhanceWithAI,
        originalPrompt: prompt
      });
    }

    console.log(`✅ Image generated successfully`);

    // PASO 3: Guardar imagen localmente (si se solicita)
    let saveResult = null;
    let publicUrl = imageResult.imageUrl;

    if (saveLocally) {
      console.log(`💾 Saving image locally...`);
      const fileName = generateFileName('image', 'png');
      saveResult = await downloadAndSaveFile(imageResult.imageUrl, fileName, 'generated');
      
      if (saveResult.success) {
        publicUrl = saveResult.publicUrl;
        console.log(`✅ Image saved: ${publicUrl}`);
      } else {
        console.warn(`⚠️ Save failed: ${saveResult.error}`);
      }
    }

    // RESPUESTA COMPLETA
    const response = {
      success: true,
      imageUrl: imageResult.imageUrl,
      publicUrl: publicUrl,
      localPath: saveResult?.localPath,
      seed: imageResult.seed,
      prompts: {
        original: prompt,
        final: finalPrompt,
        enhanced: enhanceWithAI
      },
      enhancement: enhancementResult ? {
        model: enhancementResult.model,
        success: enhancementResult.success
      } : null,
      metadata: {
        timestamp: new Date().toISOString(),
        enhancementModel: enhanceWithAI ? enhancementModel : null,
        imageModel: imageResult.model
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error in generate-image:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
} 