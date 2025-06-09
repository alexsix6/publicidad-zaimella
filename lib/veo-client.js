import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateVideoWithVeo3(prompt, imageUrl = null) {
  try {
    console.log(`🎬 Generating video with Veo 3...`);
    console.log(`📝 Prompt: ${prompt}`);
    if (imageUrl) {
      console.log(`🖼️ Base image: ${imageUrl}`);
    }

    const input = {
      prompt: prompt,
      aspect_ratio: "16:9",
      duration: "8s",           // ← Actualizado: 8 segundos
      enhance_prompt: true,     // ← Nuevo: Enhancement de FAL
      generate_audio: true,     // ← Nuevo: Audio habilitado
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
      duration: "8 seconds",    // ← Actualizado: 8 segundos
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