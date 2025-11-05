/**
 * Multi-Model Video Generator - FAL API Integration
 *
 * Supports 4 video generation models via FAL:
 * 1. Veo3 (Google) - Fast & Standard variants
 * 2. Minimax - High quality Chinese model
 * 3. Kling - Kuaishou's video model
 *
 * All models support image-to-video generation
 */

/**
 * Model configurations with costs and capabilities
 */
const VIDEO_MODELS = {
  'veo3-fast': {
    endpoint: 'fal-ai/veo3',
    apiParam: { model_version: 'veo3-fast' },
    costPerSecond: 0.40, // USD with audio
    maxDuration: 10,
    supportedAspectRatios: ['1:1', '9:16', '16:9'],
    hasAudio: true,
    speed: 'fast',
    quality: 'good'
  },
  'veo3-standard': {
    endpoint: 'fal-ai/veo3',
    apiParam: { model_version: 'veo3-standard' },
    costPerSecond: 0.75, // USD with audio
    maxDuration: 10,
    supportedAspectRatios: ['1:1', '9:16', '16:9'],
    hasAudio: true,
    speed: 'medium',
    quality: 'excellent'
  },
  'minimax': {
    endpoint: 'fal-ai/minimax/video-01',
    apiParam: {},
    costPerSecond: 0.50, // Estimated
    maxDuration: 6,
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    hasAudio: false,
    speed: 'medium',
    quality: 'excellent'
  },
  'kling': {
    endpoint: 'fal-ai/kling-video/v1/standard/image-to-video',
    apiParam: { model_name: 'kling-v1' },
    costPerSecond: 0.45, // Estimated
    maxDuration: 10,
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    hasAudio: false,
    speed: 'medium',
    quality: 'excellent'
  }
};

/**
 * Generate video with selected model via FAL API
 *
 * @param {string} prompt - Text prompt for video generation
 * @param {Object} options - Generation options
 * @param {string} options.model - Model to use: 'veo3-fast', 'veo3-standard', 'minimax', 'kling'
 * @param {string} options.imageUrl - Optional base image for image-to-video
 * @param {string} options.aspectRatio - Aspect ratio: '1:1', '9:16', '16:9'
 * @param {string} options.duration - Duration: '5s', '6s', '8s', '10s'
 * @returns {Promise<Object>} Result with videoUrl and metadata
 */
export async function generateVideoWithModel(prompt, options = {}) {
  const {
    model = 'veo3-fast', // Default model
    imageUrl = null,
    aspectRatio = '16:9',
    duration = '8s'
  } = options;

  try {
    console.log(`🎬 Video Generation: ${model}`);
    console.log(`   Prompt: "${prompt.substring(0, 60)}..."`);
    console.log(`   Image: ${imageUrl ? 'YES' : 'NO'}`);
    console.log(`   Aspect Ratio: ${aspectRatio}`);
    console.log(`   Duration: ${duration}`);

    // Validate model
    const modelConfig = VIDEO_MODELS[model];
    if (!modelConfig) {
      throw new Error(`Unknown model: ${model}. Available: ${Object.keys(VIDEO_MODELS).join(', ')}`);
    }

    // Validate and prepare parameters
    const finalAspectRatio = modelConfig.supportedAspectRatios.includes(aspectRatio)
      ? aspectRatio
      : modelConfig.supportedAspectRatios[0];

    const durationNumber = parseInt(duration);
    if (durationNumber > modelConfig.maxDuration) {
      console.warn(`⚠️ Duration ${duration} exceeds max ${modelConfig.maxDuration}s for ${model}, capping`);
    }
    const finalDuration = Math.min(durationNumber, modelConfig.maxDuration);

    // Clean and truncate prompt
    const maxPromptLength = 500;
    let finalPrompt = prompt.length > maxPromptLength
      ? prompt.substring(0, maxPromptLength - 3) + '...'
      : prompt;

    finalPrompt = finalPrompt
      .replace(/Include sound:.*?$/gmi, '')
      .replace(/with\s+sound.*?$/gmi, '')
      .replace(/audio.*?sync.*?$/gmi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Build request body based on model
    const requestBody = buildRequestBody(model, modelConfig, {
      prompt: finalPrompt,
      imageUrl,
      aspectRatio: finalAspectRatio,
      duration: finalDuration
    });

    console.log(`📤 Request to ${modelConfig.endpoint}`);

    // Call FAL API
    const FAL_KEY = process.env.FAL_KEY;
    if (!FAL_KEY) {
      throw new Error('FAL_KEY environment variable is required');
    }

    // Step 1: Start generation
    const createResponse = await fetch(`https://queue.fal.run/${modelConfig.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'StrategicContentOrchestrator/2.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`${model} API error: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    const requestId = createResult.request_id;

    if (!requestId) {
      throw new Error(`No request_id received from ${model}`);
    }

    console.log(`🔄 Request ID: ${requestId}`);

    // Step 2: Poll for completion
    const maxAttempts = 30; // 5 minutes max
    const pollInterval = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`⏳ Polling ${attempt}/${maxAttempts}...`);

      await sleep(pollInterval);

      const statusResponse = await fetch(`https://queue.fal.run/${modelConfig.endpoint}/requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'User-Agent': 'StrategicContentOrchestrator/2.0'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusResult = await statusResponse.json();
      console.log(`📊 Status: ${statusResult.status || 'unknown'}`);

      if (statusResult.status === 'COMPLETED') {
        // Extract video URL (varies by model)
        const videoUrl = extractVideoUrl(model, statusResult);

        if (!videoUrl) {
          throw new Error(`${model} completed but no video URL found`);
        }

        console.log(`✅ Video generated: ${videoUrl}`);

        // Calculate cost
        const estimatedCost = finalDuration * modelConfig.costPerSecond;

        return {
          success: true,
          videoUrl: videoUrl,
          model: model,
          duration: `${finalDuration}s`,
          aspectRatio: finalAspectRatio,
          requestId: requestId,
          promptLength: finalPrompt.length,
          hasAudio: modelConfig.hasAudio,
          estimatedCost: estimatedCost.toFixed(3),
          metadata: {
            quality: modelConfig.quality,
            speed: modelConfig.speed,
            attempts: attempt,
            imageProvided: !!imageUrl
          }
        };
      }

      if (statusResult.status === 'FAILED') {
        throw new Error(`${model} generation failed: ${statusResult.error || 'Unknown error'}`);
      }
    }

    throw new Error(`${model} generation timeout after ${maxAttempts} attempts`);

  } catch (error) {
    console.error(`❌ ${model} error:`, error.message);
    return {
      success: false,
      error: error.message,
      model: model
    };
  }
}

/**
 * Build request body for specific model
 */
function buildRequestBody(model, modelConfig, params) {
  const { prompt, imageUrl, aspectRatio, duration } = params;

  const body = {
    prompt: prompt,
    ...modelConfig.apiParam
  };

  // Add common parameters
  if (imageUrl) {
    body.image_url = imageUrl;
  }

  // Model-specific parameters
  if (model.startsWith('veo3')) {
    // Veo3 specific
    if (aspectRatio !== '16:9') body.aspect_ratio = aspectRatio;
    if (duration !== 8) body.duration = duration;
    body.generate_audio = true;
  } else if (model === 'minimax') {
    // Minimax specific
    body.aspect_ratio = aspectRatio;
    body.duration = duration;
  } else if (model === 'kling') {
    // Kling specific
    body.aspect_ratio = aspectRatio;
    body.duration = duration;
  }

  return body;
}

/**
 * Extract video URL from response (varies by model)
 */
function extractVideoUrl(model, result) {
  if (model.startsWith('veo3')) {
    return result.video?.url;
  } else if (model === 'minimax') {
    return result.video?.url || result.data?.video_url;
  } else if (model === 'kling') {
    return result.video?.url || result.output?.video_url;
  }
  return null;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get recommended model based on requirements
 */
export function getRecommendedModel(requirements = {}) {
  const { needsAudio = false, needsSpeed = false, budget = 'medium' } = requirements;

  if (needsAudio) {
    return needsSpeed ? 'veo3-fast' : 'veo3-standard';
  }

  if (needsSpeed) {
    return 'veo3-fast';
  }

  if (budget === 'low') {
    return 'veo3-fast';
  }

  if (budget === 'high') {
    return 'veo3-standard';
  }

  // Default: balanced quality/cost
  return 'veo3-fast';
}

/**
 * List available models
 */
export function listAvailableModels() {
  return Object.keys(VIDEO_MODELS).map(key => ({
    id: key,
    ...VIDEO_MODELS[key],
    recommended: key === 'veo3-fast'
  }));
}

export default {
  generateVideoWithModel,
  getRecommendedModel,
  listAvailableModels
};
