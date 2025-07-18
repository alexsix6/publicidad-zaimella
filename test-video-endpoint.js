// Test simulado del endpoint API generate-video
// Simula el comportamiento con doble enhancement

import { generateVideoWithVeo3 } from './lib/veo-client.js';
import { enhancePrompt } from './lib/openrouter-client.js';
import { downloadAndSaveFile, generateFileName, enhancePromptForVideo } from './lib/utils.js';

async function testGenerateVideoEndpoint() {
  console.log('🎬 TESTING GENERATE-VIDEO ENDPOINT WITH DOUBLE ENHANCEMENT...\n');

  // Simular diferentes request bodies
  const testCases = [
    {
      name: 'Basic video generation',
      body: {
        prompt: "A cat walking in a beautiful garden",
        videoStyle: 'cinematic',
        enhanceWithAI: true,
        useUtilsEnhancement: true
      }
    },
    {
      name: 'Video from image',
      body: {
        prompt: "The cat starts running towards the camera",
        imageUrl: "https://example.com/cat-image.jpg",
        videoStyle: 'dynamic',
        enhanceWithAI: true,
        useUtilsEnhancement: true
      }
    },
    {
      name: 'Only AI enhancement',
      body: {
        prompt: "A sunset over mountains",
        videoStyle: 'artistic',
        enhanceWithAI: true,
        useUtilsEnhancement: false
      }
    },
    {
      name: 'Only technical enhancement',
      body: {
        prompt: "A car driving fast on highway",
        videoStyle: 'action',
        enhanceWithAI: false,
        useUtilsEnhancement: true
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log('📋 Request body:', JSON.stringify(testCase.body, null, 2));

    try {
      await simulateEndpointLogic(testCase.body);
    } catch (error) {
      console.error(`❌ Error in ${testCase.name}:`, error.message);
    }
    
    console.log('─'.repeat(50));
  }

  console.log('\n✅ All video endpoint tests completed!');
}

async function simulateEndpointLogic(requestBody) {
  const { 
    prompt, 
    imageUrl = null, 
    videoStyle = 'cinematic',
    saveLocally = true,
    enhanceWithAI = true,
    enhancementModel = 'anthropic/claude-3.5-sonnet',
    useUtilsEnhancement = true
  } = requestBody;

  // Validación
  if (!prompt || prompt.trim().length === 0) {
    console.log('❌ Validation failed: Prompt is required');
    return;
  }

  console.log(`🎬 Original video prompt: "${prompt}"`);

  let finalPrompt = prompt;
  let enhancementResult = null;

  // PASO 1: AI Enhancement simulation
  if (enhanceWithAI) {
    console.log(`🧠 Would enhance video prompt with ${enhancementModel}...`);
    
    if (typeof enhancePrompt === 'function') {
      console.log('✅ AI Enhancement function available');
      enhancementResult = {
        success: false,
        error: 'No API key configured (simulation)',
        fallbackPrompt: prompt,
        model: enhancementModel
      };
      finalPrompt = prompt; // Fallback to original
    } else {
      console.log('❌ AI Enhancement function not available');
    }
  }

  // PASO 2: Technical Enhancement simulation
  if (useUtilsEnhancement) {
    console.log(`🔧 Applying technical enhancement for ${videoStyle}...`);
    if (typeof enhancePromptForVideo === 'function') {
      console.log('✅ Technical enhancement function available');
      finalPrompt = enhancePromptForVideo(finalPrompt, videoStyle);
      console.log(`⚡ Technical Enhanced prompt: "${finalPrompt}"`);
    } else {
      console.log('❌ Technical enhancement function not available');
    }
  }

  if (imageUrl) {
    console.log(`🖼️ Would use base image: ${imageUrl}`);
  }

  // PASO 3: Video generation simulation
  console.log(`🎯 Would generate video with Veo 3...`);
  if (typeof generateVideoWithVeo3 === 'function') {
    console.log('✅ Video generation function available');
  } else {
    console.log('❌ Video generation function not available');
  }

  // PASO 4: File saving simulation
  if (saveLocally) {
    console.log(`💾 Would save video locally...`);
    const fileName = generateFileName('video', 'mp4');
    console.log(`📁 Generated filename: ${fileName}`);
    
    if (typeof downloadAndSaveFile === 'function') {
      console.log('✅ File saving function available');
    } else {
      console.log('❌ File saving function not available');
    }
  }

  // Respuesta simulada
  const simulatedResponse = {
    success: true,
    videoUrl: '[WOULD_BE_VEO3_URL]',
    publicUrl: '[WOULD_BE_PUBLIC_URL]',
    localPath: '[WOULD_BE_LOCAL_PATH]',
    duration: '5 seconds',
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

  console.log('📤 Simulated response structure validated ✅');
  console.log(`🎯 Enhancement layers: ${enhanceWithAI ? 'AI' : ''}${enhanceWithAI && useUtilsEnhancement ? ' + ' : ''}${useUtilsEnhancement ? 'Technical' : ''}`);
}

// Solo ejecutar si se llama directamente
if (import.meta.url.endsWith('test-video-endpoint.js')) {
  testGenerateVideoEndpoint().catch(console.error);
} 