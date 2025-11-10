// API Endpoint: /api/generate-image
// Función serverless para generar imágenes con Nano Banana (primary) + FLUX fallback via Replicate

import { generateImageWithFlux, generateImageWithNanoBanana } from '../lib/replicate-client.js';
import { enhancePrompt } from '../lib/openrouter-client.js';
import { downloadAndSaveFile, generateFileName } from '../lib/utils.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load platform specs from shared config (Phase 3)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const platformSpecsPath = resolve(__dirname, '../config/platform-specs.json');
let platformSpecsData = null;

try {
  const platformSpecsJson = readFileSync(platformSpecsPath, 'utf-8');
  platformSpecsData = JSON.parse(platformSpecsJson);
  console.log(`✅ [generate-image] Platform specs loaded successfully (${Object.keys(platformSpecsData).length} platforms)`);
} catch (error) {
  console.warn('⚠️ [generate-image] Platform specs not available, using fallback specs');
  // Fallback to hardcoded specs (backward compatibility)
  platformSpecsData = {
    instagram: {
      formats: { post: '1:1', story: '9:16', reel: '9:16' },
      toneOfVoice: 'casual, visual-first, community-focused',
      demographics: 'Millennials and Gen Z, visual-oriented',
      bestPractices: ['Use high-quality visuals', 'Include relevant hashtags']
    },
    linkedin: {
      formats: { post: '1.91:1', article: '1.91:1' },
      toneOfVoice: 'professional, authoritative, insightful',
      demographics: 'Working professionals, B2B decision makers',
      bestPractices: ['Share professional insights']
    },
    facebook: {
      formats: { post: '1.91:1', story: '9:16', reel: '9:16' },
      toneOfVoice: 'friendly, community-oriented',
      demographics: 'Broad age range, community-focused',
      bestPractices: ['Create engaging content']
    }
  };
}

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
      // 🆕 GENERADOR DE IMÁGENES: nano-banana (default) o flux-kontext
      imageGenerator = 'nano-banana', // 'nano-banana' (fast, high quality) o 'flux-kontext' (fallback)
      model = 'flux-kontext', // Solo usado si imageGenerator === 'flux-kontext'
      useTextModel = false, // Para imágenes con texto usar flux-schnell-text
      enhanceWithAI = true,
      enhancementModel = 'deepseek/deepseek-r1', // 🆕 Modelo por defecto de bajo costo
      aspectRatio, // 🆕 Sin default - se auto-detectará
      outputFormat = 'png',
      // 🆕 PARÁMETROS PARA AUTO-DETECCIÓN
      platform = null, // instagram, linkedin, tiktok, etc.
      format = null,   // post, story, reel, etc.
      contextProfileId = null // Context profile for Digital Twin mode
    } = req.body;

    // Validar prompt
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // AUTO-DETECCIÓN DE ASPECT RATIO POR PLATAFORMA (Phase 3 - loaded from config)
    let finalAspectRatio = aspectRatio;

    if (!finalAspectRatio && platform) {
      const platformSpec = platformSpecsData[platform];
      if (platformSpec && platformSpec.formats) {
        const formatKey = format || Object.keys(platformSpec.formats)[0];
        finalAspectRatio = platformSpec.formats[formatKey] || '16:9';
        //console.log(`🎯 Auto-detected aspect ratio: ${finalAspectRatio} for ${platform}:${formatKey}`);
      } else {
        finalAspectRatio = '16:9';
        console.log(`⚠️ Unknown platform ${platform}, using default 16:9`);
      }
    } else {
      finalAspectRatio = finalAspectRatio || '16:9';
    }

    // 🆕 DEBUG: Log all parameters
    console.log(`🔍 DEBUG - Parameters received:`, {
      prompt: prompt.substring(0, 50) + '...',
      platform,
      format,
      aspectRatio,
      finalAspectRatio,
      enhanceWithAI
    });

    //console.log(`🎨 Original prompt: "${prompt}"`);

    // CONSTRUIR CONTEXTO DE PLATAFORMA (Phase 3 - loaded from config)
    // Supports: facebook, instagram, linkedin, tiktok, twitter, x-twitter, google, email, youtube, pinterest
    let platformContext = null;
    if (platform) {
      const platformSpec = platformSpecsData[platform];
      if (platformSpec) {
        platformContext = {
          platform,
          toneOfVoice: platformSpec.toneOfVoice,
          demographics: platformSpec.demographics,
          bestPractices: platformSpec.bestPractices
        };
        //console.log(`🎯 Platform context loaded for ${platform}: ${platformSpec.toneOfVoice}`);
      }
    }

    let finalPrompt = prompt;
    let enhancementResult = null;

    // PASO 1: Mejorar prompt con OpenRouter (solo si está habilitado)
    if (enhanceWithAI) {
      //console.log(`🧠 Enhancing prompt with ${enhancementModel}...`);
      
      // 🆕 Pasar el parámetro enhanceEnabled correctamente + platform context
      enhancementResult = await enhancePrompt(prompt, 'image', enhancementModel, true, false, platformContext);
      
      if (enhancementResult.success && enhancementResult.enhanced) {
        finalPrompt = enhancementResult.enhancedPrompt;
        console.log(`✨ Enhanced prompt (${enhancementResult.promptLength} chars): "${finalPrompt}"`);
        if (enhancementResult.modelInfo) {
          //console.log(`💰 Cost level: ${enhancementResult.modelInfo.cost}`);
        }
      } else {
        console.warn(`⚠️ Enhancement failed, using original: ${enhancementResult.error}`);
        finalPrompt = enhancementResult.fallbackPrompt || prompt;
      }
    } else {
      //console.log(`📝 AI enhancement disabled, using original prompt`);
      enhancementResult = await enhancePrompt(prompt, 'image', enhancementModel, false, false, platformContext);
    }

    // PASO 2: Generar imagen con Nano Banana (primary) o FLUX (fallback)
    let imageResult;

    if (imageGenerator === 'nano-banana') {
      console.log(`🍌 Generating image with Nano Banana (${finalAspectRatio}, ${outputFormat})...`);

      try {
        imageResult = await generateImageWithNanoBanana(
          finalPrompt,
          inputImage,
          finalAspectRatio,
          outputFormat,
          contextProfileId
        );

        if (!imageResult.success) {
          // Fallback to FLUX if Nano Banana fails
          console.warn(`⚠️ Nano Banana failed: ${imageResult.error}, falling back to FLUX...`);
          imageResult = await generateImageWithFlux(
            finalPrompt,
            inputImage,
            model,
            finalAspectRatio,
            outputFormat,
            contextProfileId
          );
        }
      } catch (nanoBananaError) {
        // Fallback to FLUX on exception
        console.error(`❌ Nano Banana exception: ${nanoBananaError.message}, falling back to FLUX...`);
        imageResult = await generateImageWithFlux(
          finalPrompt,
          inputImage,
          model,
          finalAspectRatio,
          outputFormat,
          contextProfileId
        );
      }
    } else {
      // Use FLUX directly
      console.log(`🎨 Generating image with FLUX (${model}, ${finalAspectRatio}, ${outputFormat})...`);
      imageResult = await generateImageWithFlux(
        finalPrompt,
        inputImage,
        model,
        finalAspectRatio,
        outputFormat,
        contextProfileId
      );
    }

    if (!imageResult.success) {
      return res.status(500).json({
        success: false,
        error: `Image generation failed: ${imageResult.error}`,
        enhancementUsed: enhanceWithAI,
        originalPrompt: prompt,
        imageGenerator: imageGenerator
      });
    }

    //console.log(`✅ Image generated successfully`);

    // PASO 3: Guardar imagen localmente (si se solicita)
    let saveResult = null;
    let publicUrl = imageResult.imageUrl;

    if (saveLocally) {
      //console.log(`💾 Saving image locally...`);
      const fileName = generateFileName('image', 'png');
      saveResult = await downloadAndSaveFile(imageResult.imageUrl, fileName, 'generated');
      
      if (saveResult.success) {
        publicUrl = saveResult.publicUrl;
        //console.log(`✅ Image saved: ${publicUrl}`);
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
        imageGenerator: imageGenerator, // 🍌 nano-banana or flux-kontext
        imageModel: imageResult.model,
        aspectRatio: finalAspectRatio, // 🆕 Aspect ratio final usado
        platform: platform || null,
        format: format || null,
        contextProfileId: contextProfileId || null // Digital Twin context
      },
      // 🆕 INFORMACIÓN DE PLATAFORMA
      platformContext: platformContext ? {
        platform: platformContext.platform,
        toneOfVoice: platformContext.toneOfVoice,
        demographics: platformContext.demographics,
        recommendations: {
          bestPractices: platformContext.bestPractices?.slice(0, 3) || null
        }
      } : null
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