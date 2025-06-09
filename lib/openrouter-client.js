import axios from 'axios';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export async function enhancePrompt(originalPrompt, type = 'image', model = 'anthropic/claude-3.5-sonnet') {
  try {
    const systemPrompts = {
      image: `You are an expert prompt engineer for AI image generation with FLUX.1 Kontext Max. 
      
Your task: Transform the user's basic prompt into a detailed, professional prompt that will generate stunning images.

Guidelines:
- Add specific visual details (lighting, composition, style)
- Include technical parameters (camera angles, depth of field)
- Enhance artistic direction (mood, atmosphere, colors)
- Keep core concept intact
- Make it concise but descriptive
- Focus on visual elements that FLUX excels at

Return ONLY the enhanced prompt, nothing else.`,

      video: `You are an expert prompt engineer for AI video generation with Veo 3.

Your task: Transform the image prompt into a dynamic video prompt that creates engaging 5-second videos.

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

    const response = await axios.post(`${OPENROUTER_API_BASE}/chat/completions`, {
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompts[type] || systemPrompts.image
        },
        {
          role: "user",
          content: originalPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI Content Generator'
      }
    });

    const enhancedPrompt = response.data.choices[0].message.content.trim();
    
    return {
      success: true,
      originalPrompt,
      enhancedPrompt,
      model,
      type
    };

  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return {
      success: false,
      error: error.message,
      fallbackPrompt: originalPrompt // Usar prompt original si falla
    };
  }
}

export async function analyzeAndImprove(prompt, analysisType = 'creative', model = 'openai/o1-mini') {
  try {
    const analysisPrompts = {
      creative: `Analyze this prompt for creative potential and suggest improvements for viral content generation:`,
      technical: `Analyze this prompt for technical accuracy and suggest improvements for professional content:`,
      marketing: `Analyze this prompt for marketing appeal and suggest improvements for engagement:`
    };

    const response = await axios.post(`${OPENROUTER_API_BASE}/chat/completions`, {
      model: model,
      messages: [
        {
          role: "user",
          content: `${analysisPrompts[analysisType]} "${prompt}"`
        }
      ],
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      analysis: response.data.choices[0].message.content,
      model,
      analysisType
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
} 