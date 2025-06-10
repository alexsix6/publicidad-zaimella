import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImageWithFlux(prompt, inputImage = null, model = "base", aspectRatio = "16:9", outputFormat = "png") {
  try {
    // 🆕 MODELOS CORREGIDOS: Separamos generación vs edición
    const models = {
      // MODELOS DE GENERACIÓN (desde cero)
      "pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",  // ⭐ RECOMENDADO
      "alexseis": "alexsix6/alexseis:1220b25d2a491d832645b43a6acd509f7365745ff8621e0a953ea60614af1de8",
      
      // MODELOS DE EDICIÓN (requieren input_image)
      "base": "black-forest-labs/flux-kontext-max",         // ✏️ EDICIÓN AVANZADA
      "kontext-max": "black-forest-labs/flux-kontext-max",
      "kontext-pro": "black-forest-labs/flux-kontext-pro"
    };

    const selectedModel = models[model] || models["pro-ultra"];
    const isKontextModel = model.includes('kontext') || model === 'base';

    console.log(`🎨 Using model: ${selectedModel} (isKontext: ${isKontextModel})`);

    // Validar aspect ratio
    const validAspectRatios = ["1:1", "4:5", "2:3", "9:16", "16:9", "1.91:1", "21:9"];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    // Validar formato de salida
    const validFormats = ["png", "jpg", "webp"];
    const finalFormat = validFormats.includes(outputFormat) ? outputFormat : "png";

    // 🆕 CONFIGURACIÓN SEGÚN TIPO DE MODELO
    let input;

    if (isKontextModel) {
      // MODELOS KONTEXT: Para EDICIÓN de imágenes
      if (!inputImage) {
        throw new Error(`Kontext models require an input image for editing. Please provide an input image or use a different model.`);
      }
      
      input = {
        prompt: prompt,
        input_image: inputImage,  // Requerido para Kontext
        output_format: finalFormat.toLowerCase()  // jpg, png, webp
      };
      
      console.log(`🖼️ Kontext model - Editing image with prompt: "${prompt}"`);
      
    } else {
      // MODELOS ESTÁNDAR: Para GENERACIÓN desde cero
      input = {
        prompt: prompt,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_outputs: 1,
        aspect_ratio: finalAspectRatio,
        output_format: finalFormat,
        output_quality: 100,
        seed: Math.floor(Math.random() * 1000000)
      };

      // Si hay imagen de input para modelos estándar, agregar como referencia
      if (inputImage) {
        input.image = inputImage;
      }
      
      console.log(`🎯 Standard model - Generating image with prompt: "${prompt}"`);
    }

    console.log(`📤 Input parameters:`, input);

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

    console.log(`✅ Image generated successfully: ${imageUrl}`);

    return {
      success: true,
      imageUrl: imageUrl,
      seed: input.seed || 'N/A',
      model: selectedModel,
      aspectRatio: finalAspectRatio,
      outputFormat: finalFormat,
      editMode: isKontextModel
    };
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Unknown error occurred'
    };
  }
} 