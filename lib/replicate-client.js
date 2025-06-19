import Replicate from "replicate";
import { enhancePromptWithContext } from './context-enhancer.js';
import { contextProfileManager } from './context-profile-manager.js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImageWithFlux(
  prompt, 
  inputImage = null, 
  model = "base", 
  aspectRatio = "16:9", 
  outputFormat = "png",
  contextProfileId = null  // 🆕 NEW: JSON Context Profile support
) {
  try {
    // 🧠 STEP 1: Apply JSON Context Profile if provided
    let finalPrompt = prompt;
    let contextResult = null;
    
    if (contextProfileId) {
      console.log(`🧠 Applying JSON Context Profile: ${contextProfileId}`);
      
      // Initialize context manager if needed
      await contextProfileManager.initialize();
      
      // Apply context to prompt
      contextResult = await enhancePromptWithContext(prompt, contextProfileId, {
        useAdvancedEnhancement: true,
        optimizeForModel: model
      });
      
      if (contextResult.success) {
        finalPrompt = contextResult.enhancedPrompt;
        
        // Apply technical preferences from profile if available
        const profile = contextResult.profile;
        if (profile?.context?.technical_preferences) {
          const techPrefs = profile.context.technical_preferences;
          
          // Override model if specified in profile
          if (techPrefs.model_preference && !model) {
            model = techPrefs.model_preference;
            console.log(`🎯 Using model from profile: ${model}`);
          }
          
          // Override aspect ratio if specified in profile
          if (techPrefs.aspect_ratio && aspectRatio === "16:9") {
            aspectRatio = techPrefs.aspect_ratio;
            console.log(`📐 Using aspect ratio from profile: ${aspectRatio}`);
          }
          
          // Override output format if specified in profile
          if (techPrefs.output_format && outputFormat === "png") {
            outputFormat = techPrefs.output_format;
            console.log(`🖼️ Using output format from profile: ${outputFormat}`);
          }
        }
      } else {
        console.warn(`⚠️ Context application failed: ${contextResult.error}`);
        finalPrompt = prompt; // Fallback to original
      }
    }

    // 🚀 STEP 2: Continue with existing flexible model logic
    const models = {
      // MODELOS DE ALTA CALIDAD (generación + edición)
      "pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",  // ⭐ GENERACIÓN PREMIUM
      "kontext-max": "black-forest-labs/flux-kontext-max",   // 🎯 EDICIÓN PREMIUM + GENERACIÓN
      "kontext-pro": "black-forest-labs/flux-kontext-pro",   // 🎯 EDICIÓN AVANZADA + GENERACIÓN
      
      // MODELOS ESPECIALIZADOS
      "alexseis": "alexsix6/alexseis:1220b25d2a491d832645b43a6acd509f7365745ff8621e0a953ea60614af1de8", // 🎨 ESTILO CUSTOM
      
      // ALIAS PARA COMPATIBILIDAD
      "base": "black-forest-labs/flux-kontext-max"  // ✏️ DEFAULT EDICIÓN
    };

    const selectedModel = models[model] || models["pro-ultra"];
    const isKontextModel = model.includes('kontext') || model === 'base';
    const isEditingMode = inputImage !== null; // 🆕 MODO DETERMINADO POR INPUT

    console.log(`🎨 Using model: ${selectedModel}`);
    console.log(`🔄 Mode: ${isEditingMode ? 'EDITING' : 'GENERATING'} (Kontext: ${isKontextModel})`);
    if (contextProfileId) {
      console.log(`🧠 Context Profile: ${contextProfileId} applied`);
    }

    // Validar aspect ratio
    const validAspectRatios = ["1:1", "4:5", "2:3", "9:16", "16:9", "1.91:1", "21:9"];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    // Validar formato de salida
    const validFormats = ["png", "jpg", "webp"];
    const finalFormat = validFormats.includes(outputFormat) ? outputFormat : "png";

    // 🧠 CONFIGURACIÓN INTELIGENTE SEGÚN MODELO Y MODO
    let input = {
      prompt: finalPrompt,  // 🆕 Using context-enhanced prompt
      output_format: finalFormat.toLowerCase(),
      seed: Math.floor(Math.random() * 1000000)
    };

    if (isKontextModel) {
      // 🎯 MODELOS KONTEXT: Configuración optimizada según modo
      if (isEditingMode) {
        // MODO EDICIÓN: Parámetros optimizados para editar
        input = {
          ...input,
          input_image: inputImage,           // ✅ Imagen base para editar
          guidance_scale: 7.5,               // 🔥 Alta adherencia al prompt
          num_inference_steps: 20,           // ⚡ Optimizado para edición
          num_outputs: 1
        };
        
        console.log(`🖼️ Kontext EDITING mode - Enhanced parameters for image modification`);
        console.log(`   📐 Guidance Scale: ${input.guidance_scale} (high prompt adherence)`);
        console.log(`   🔄 Steps: ${input.num_inference_steps} (editing optimized)`);
        
      } else {
        // MODO GENERACIÓN: Parámetros para crear desde cero
        input = {
          ...input,
          guidance_scale: 4.0,               // 🎯 Balanceado para generación
          num_inference_steps: 25,           // 🎨 Calidad para generación
          num_outputs: 1,
          aspect_ratio: finalAspectRatio     // 📏 Solo en generación
        };
        
        console.log(`🎨 Kontext GENERATION mode - Creating new image from scratch`);
        console.log(`   📐 Guidance Scale: ${input.guidance_scale} (balanced)`);
        console.log(`   🔄 Steps: ${input.num_inference_steps} (generation quality)`);
        console.log(`   📏 Aspect Ratio: ${finalAspectRatio}`);
      }
      
    } else {
      // 🚀 MODELOS ESTÁNDAR (Pro-Ultra, AlexSeis): Configuración clásica
      input = {
        ...input,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_outputs: 1,
        aspect_ratio: finalAspectRatio,
        output_quality: 100
      };

      // Si hay imagen de input, agregar como referencia/inspiración
      if (inputImage) {
        input.image = inputImage;
        console.log(`🎯 Standard model with image reference for inspiration`);
      } else {
        console.log(`🎯 Standard model - Pure generation from prompt`);
      }
    }

    console.log(`📤 Final input parameters:`, input);
    console.log(`🎯 Final prompt: "${finalPrompt}"`);

    const output = await replicate.run(selectedModel, { input });

    // 🆕 MANEJO MEJORADO DE RESPUESTA
    let imageUrl;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    const operationType = isEditingMode ? 'edited' : 'generated';
    console.log(`✅ Image ${operationType} successfully: ${imageUrl}`);

    // 🧠 STEP 3: Record success in context profile if used
    if (contextProfileId && contextResult?.success) {
      try {
        await contextProfileManager.recordUsage(contextProfileId, finalPrompt);
        console.log(`📊 Recorded usage in context profile: ${contextProfileId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to record usage in profile: ${error.message}`);
      }
    }

    return {
      success: true,
      imageUrl: imageUrl,
      seed: input.seed || 'N/A',
      model: selectedModel,
      aspectRatio: finalAspectRatio,
      outputFormat: finalFormat,
      
      // 🆕 INFORMACIÓN DETALLADA DEL MODO
      mode: {
        operation: operationType,
        isKontextModel: isKontextModel,
        isEditingMode: isEditingMode,
        hasInputImage: inputImage !== null
      },
      
      // 🆕 PARÁMETROS UTILIZADOS
      parameters: {
        guidanceScale: input.guidance_scale,
        inferenceSteps: input.num_inference_steps,
        promptLength: finalPrompt.length,
        aspectRatio: input.aspect_ratio || 'inherited'
      },

      // 🧠 CONTEXT PROFILE INFORMATION
      contextProfile: contextProfileId ? {
        profileId: contextProfileId,
        applied: contextResult?.success || false,
        originalPrompt: prompt,
        enhancedPrompt: finalPrompt,
        promptEnhancement: contextResult?.success ? 'applied' : 'failed'
      } : null
    };
  } catch (error) {
    console.error('❌ Error processing image:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Unknown error occurred'
    };
  }
} 