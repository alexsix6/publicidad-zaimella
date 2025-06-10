import axios from 'axios';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

// 🆕 MODELOS RAZONADORES DE BAJO COSTO
export const REASONING_MODELS = {
  // Ultra bajo costo
  'deepseek/deepseek-r1': {
    name: 'DeepSeek R1',
    cost: 'Ultra Low', 
    reasoning: true
  },
  'google/gemini-2.5-flash-preview-05-20': {
    name: 'Gemini 2.5 Flash',
    cost: 'Ultra Low',
    reasoning: true
  },
  'meta-llama/llama-3.1-8b-instruct': {
    name: 'Llama 3.1 8B',
    cost: 'Ultra Low',
    reasoning: false
  },
  
  // Bajo costo pero más potentes
  'openai/o3-mini': {
    name: 'GPT-o3 Mini',
    cost: 'Low',
    reasoning: true
  },
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    cost: 'Medium',
    reasoning: true
  },
  'openai/o1-mini': {
    name: 'GPT-o1 Mini',
    cost: 'Medium',
    reasoning: true
  }
};

export async function enhancePrompt(originalPrompt, type = 'image', model = 'deepseek/deepseek-r1', enhanceEnabled = true) {
  try {
    // 🆕 VERIFICAR SI ENHANCEMENT ESTÁ HABILITADO
    if (!enhanceEnabled) {
      console.log('📝 Prompt enhancement disabled, using original prompt');
      return {
        success: true,
        originalPrompt,
        enhancedPrompt: originalPrompt,
        model: 'none',
        type,
        enhanced: false
      };
    }

    // 🆕 LÍMITES ESPECÍFICOS POR TIPO
    const limits = {
      image: {
        maxOutput: 1000,
        targetLength: '200-400 words'
      },
      video: {
        maxOutput: 500, // ⚠️ CRÍTICO: Veo 3 límite 500 chars
        targetLength: 'MAXIMUM 480 characters'
      }
    };

    const currentLimits = limits[type] || limits.image;

    const systemPrompts = {
      image: `You are an expert prompt engineer for AI image generation with FLUX.1 Kontext Max. 

Your task: Transform the user's basic prompt into a detailed, professional prompt that will generate stunning images.

Guidelines:
- Add specific visual details (lighting, composition, style)
- Include technical parameters (camera angles, depth of field)
- Enhance artistic direction (mood, atmosphere, colors)
- Keep core concept intact
- Target length: ${currentLimits.targetLength}
- Focus on visual elements that FLUX excels at

Return ONLY the enhanced prompt, nothing else.`,

      video: `You are an expert prompt engineer for AI video generation with Veo 3.

⚠️ CRITICAL CONSTRAINT: Veo 3 has a STRICT 500 character limit. Your enhanced prompt MUST be under 480 characters to be safe.

Your task: Transform the image prompt into a concise but dynamic video prompt.

Guidelines:
- Add camera movements (pan, zoom, tilt)
- Include temporal elements (what happens over time)
- Specify motion and animation details
- Add cinematic techniques
- MAXIMUM ${currentLimits.targetLength} - BE CONCISE!
- Focus on key movements and actions only

Return ONLY the enhanced video prompt, nothing else. Count characters carefully!`
    };

    // 🆕 CONFIGURACIÓN ESPECÍFICA PARA MODELOS RAZONADORES
    const modelConfig = REASONING_MODELS[model];
    let requestConfig = {
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
      max_tokens: currentLimits.maxOutput
    };

    // 🆕 AJUSTES ESPECÍFICOS PARA MODELOS RAZONADORES
    if (modelConfig?.reasoning) {
      requestConfig.temperature = 0.3; // Más determinista para razonadores
      if (model.includes('deepseek-r1')) {
        requestConfig.temperature = 0.1; // DeepSeek R1 funciona mejor con temp baja
      }
    }

    console.log(`🧠 Using reasoning model: ${modelConfig?.name || model}`);
    console.log(`💰 Cost level: ${modelConfig?.cost || 'Unknown'}`);
    console.log(`🎯 Target length for ${type}: ${currentLimits.targetLength}`);

    const response = await axios.post(`${OPENROUTER_API_BASE}/chat/completions`, requestConfig, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI Content Generator - Prompt Enhancement'
      }
    });

    const enhancedPrompt = response.data.choices[0].message.content.trim();
    
    // 🆕 VALIDACIÓN CRÍTICA PARA VIDEOS
    if (type === 'video' && enhancedPrompt.length > 500) {
      console.warn(`⚠️ Enhanced video prompt too long (${enhancedPrompt.length} chars), truncating...`);
      const truncatedPrompt = enhancedPrompt.substring(0, 497) + '...';
      
      return {
        success: true,
        originalPrompt,
        enhancedPrompt: truncatedPrompt,
        model,
        type,
        enhanced: true,
        warning: `Prompt truncated from ${enhancedPrompt.length} to ${truncatedPrompt.length} characters for Veo 3 compatibility`,
        originalLength: enhancedPrompt.length,
        finalLength: truncatedPrompt.length
      };
    }
    
    return {
      success: true,
      originalPrompt,
      enhancedPrompt,
      model,
      type,
      enhanced: true,
      modelInfo: modelConfig,
      promptLength: enhancedPrompt.length,
      withinLimits: type === 'video' ? enhancedPrompt.length <= 500 : true
    };

  } catch (error) {
    console.error('❌ Error enhancing prompt:', error);
    
    // 🆕 FALLBACK MEJORADO
    return {
      success: false,
      error: error.message,
      fallbackPrompt: originalPrompt,
      enhanced: false,
      model: 'fallback'
    };
  }
}

export async function analyzeAndImprove(prompt, analysisType = 'creative', model = 'deepseek/deepseek-r1') {
  try {
    const analysisPrompts = {
      creative: `Analyze this prompt for creative potential and suggest improvements for viral content generation. Be concise but insightful:`,
      technical: `Analyze this prompt for technical accuracy and suggest improvements for professional content. Focus on specific technical details:`,
      marketing: `Analyze this prompt for marketing appeal and suggest improvements for engagement. Consider viral potential:`
    };

    // 🆕 CONFIGURACIÓN PARA ANÁLISIS
    const modelConfig = REASONING_MODELS[model];
    let requestConfig = {
      model: model,
      messages: [
        {
          role: "user",
          content: `${analysisPrompts[analysisType]} "${prompt}"`
        }
      ],
      temperature: modelConfig?.reasoning ? 0.2 : 0.3,
      max_tokens: 800
    };

    console.log(`🔍 Analyzing with: ${modelConfig?.name || model}`);

    const response = await axios.post(`${OPENROUTER_API_BASE}/chat/completions`, requestConfig, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI Content Generator - Prompt Analysis'
      }
    });

    return {
      success: true,
      analysis: response.data.choices[0].message.content,
      model,
      analysisType,
      modelInfo: modelConfig
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
} 