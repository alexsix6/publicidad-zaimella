import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImageWithFlux(prompt, inputImage = null, model = "base", aspectRatio = "16:9", outputFormat = "png") {
  try {
    // Seleccionar modelo basado en parámetro
    const models = {
      "base": "black-forest-labs/flux-kontext-max",
      "alexseis": "alexsix6/alexseis:1220b25d2a491d832645b43a6acd509f7365745ff8621e0a953ea60614af1de8"
    };

    const selectedModel = models[model] || models["base"];

    // Validar aspect ratio
    const validAspectRatios = ["1:1", "4:5", "2:3", "9:16", "16:9", "1.91:1", "21:9"];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    // Validar formato de salida
    const validFormats = ["png", "jpg", "webp"];
    const finalFormat = validFormats.includes(outputFormat) ? outputFormat : "png";

    const input = {
      prompt: prompt,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_outputs: 1,
      aspect_ratio: finalAspectRatio,
      output_format: finalFormat,
      output_quality: 100,
      seed: Math.floor(Math.random() * 1000000)
    };

    // Si hay imagen de input, agregar para edición
    if (inputImage) {
      input.image = inputImage;
    }

    const output = await replicate.run(selectedModel, { input });

    return {
      success: true,
      imageUrl: output[0],
      seed: input.seed,
      model: selectedModel,
      aspectRatio: finalAspectRatio,
      outputFormat: finalFormat
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Unknown error occurred'
    };
  }
} 