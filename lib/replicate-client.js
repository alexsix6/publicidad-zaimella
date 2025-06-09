import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateImageWithFlux(prompt, inputImage = null, model = "base") {
  try {
    // Seleccionar modelo basado en parámetro
    const models = {
      "base": "black-forest-labs/flux-kontext-max",
      "alexseis": "alexsix6/alexseis:1220b25d2a491d832645b43a6acd509f7365745ff8621e0a953ea60614af1de8"
    };

    const selectedModel = models[model] || models["base"];

    const input = {
      prompt: prompt,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_outputs: 1,
      aspect_ratio: "16:9",
      output_format: "png",
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
      model: selectedModel
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error.message || error.toString() || 'Unknown error occurred'
    };
  }
} 