import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// Implementación alternativa usando el SDK oficial de OpenRouter
export async function enhancePromptWithSDK(originalPrompt, type = 'image', model = 'anthropic/claude-3.5-sonnet') {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return {
        success: false,
        error: 'OPENROUTER_API_KEY not configured',
        fallbackPrompt: originalPrompt
      };
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const systemPrompts = {
      image: `You are an expert prompt engineer for AI image generation with FLUX.1 Kontext Max. 
      
Transform the user's basic prompt into a detailed, professional prompt that will generate stunning images.

Guidelines:
- Add specific visual details (lighting, composition, style)
- Include technical parameters (camera angles, depth of field)
- Enhance artistic direction (mood, atmosphere, colors)
- Keep core concept intact
- Make it concise but descriptive
- Focus on visual elements that FLUX excels at

Return ONLY the enhanced prompt, nothing else.`,

      video: `You are an expert prompt engineer for AI video generation with Veo 3.

Transform the image prompt into a dynamic video prompt that creates engaging 5-second videos.

Guidelines:
- Add camera movements (pan, zoom, tilt, tracking)
- Include temporal elements (what happens over time)
- Specify motion and animation details
- Add cinematic techniques (cuts, transitions)
- Enhance storytelling elements
- Keep it under 200 words
- Focus on movement and action

Return ONLY the enhanced video prompt, nothing else.`
    };

    const { text } = await generateText({
      model: openrouter(model),
      system: systemPrompts[type] || systemPrompts.image,
      prompt: originalPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    return {
      success: true,
      originalPrompt,
      enhancedPrompt: text.trim(),
      model,
      type,
      usedSDK: 'official'
    };

  } catch (error) {
    console.error('Error enhancing prompt with SDK:', error);
    return {
      success: false,
      error: error.message,
      fallbackPrompt: originalPrompt,
      usedSDK: 'official'
    };
  }
}

// Nota: Esta implementación requiere también instalar 'ai' package
// npm install ai 