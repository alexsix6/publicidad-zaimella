import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateVideoWithVeo3(prompt, imageUrl = null, aspectRatio = "16:9", duration = "8s") {
  try {
    console.log(`🎬 Generating video with Veo 3...`);
    console.log(`📝 Prompt: ${prompt}`);
    if (imageUrl) {
      console.log(`🖼️ Base image: ${imageUrl}`);
    }

    // Validar aspect ratio para video
    const validVideoAspectRatios = ["1:1", "9:16", "16:9"];
    const finalAspectRatio = validVideoAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    // Validar duración
    const validDurations = ["5s", "8s", "10s"];
    const finalDuration = validDurations.includes(duration) ? duration : "8s";

    const input = {
      prompt: prompt,
      aspect_ratio: finalAspectRatio,
      duration: finalDuration,
      enhance_prompt: true,     
      generate_audio: true,     
      seed: Math.floor(Math.random() * 1000000)
    };

    // Si hay imagen base, determinar si se puede usar
    // (Verificar en documentación si Veo3 soporta imagen base)
    if (imageUrl) {
      input.image_url = imageUrl;
    }
    
    const result = await fal.subscribe("fal-ai/veo3", {
      input: input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("🔄 Veo3 progress:", update.logs?.map(log => log.message).join(", "));
        }
      },
    });

    console.log(`✅ Video generated successfully`);
    console.log(`🎥 Video URL: ${result.data.video.url}`);

    return {
      success: true,
      videoUrl: result.data.video.url,
      duration: finalDuration,
      aspectRatio: finalAspectRatio,
      requestId: result.requestId
    };

  } catch (error) {
    console.error('❌ Error generating video with Veo3:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 