// 🆕 NUEVO CLIENTE VEO3: Usa fetch directo en lugar de librería FAL
// Basado en template n8n exitoso y documentación oficial de Veo 3

export async function generateVideoWithVeo3(prompt, imageUrl = null, aspectRatio = "16:9", duration = "8s") {
  try {
    console.log(`🎬 Generating video with Veo 3 (NEW METHOD)...`);
    
    // 🆕 LÍMITE DE PROMPT: Basado en documentación oficial
    const maxPromptLength = 500;
    let finalPrompt = prompt;
    
    if (prompt.length > maxPromptLength) {
      finalPrompt = prompt.substring(0, maxPromptLength - 3) + '...';
      console.log(`⚠️ Prompt truncated from ${prompt.length} to ${finalPrompt.length} characters`);
    }
    
    // 🆕 LIMPIAR PROMPT: Remover referencias problemáticas
    finalPrompt = finalPrompt
      .replace(/Include sound:.*?$/gmi, '')
      .replace(/with\s+sound.*?$/gmi, '')
      .replace(/audio.*?sync.*?$/gmi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`📝 Final prompt (${finalPrompt.length} chars): ${finalPrompt}`);
    
    // 🆕 VALIDACIONES MANTENIENDO NUESTRAS FEATURES
    const validVideoAspectRatios = ["1:1", "9:16", "16:9"];
    const finalAspectRatio = validVideoAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

    const validDurations = ["5s", "8s", "10s"];
    const finalDuration = validDurations.includes(duration) ? duration : "8s";
    const durationNumber = parseInt(finalDuration);

    // 🆕 CONFIGURACIÓN SEGÚN DOCUMENTACIÓN OFICIAL + TEMPLATE N8N
    const requestBody = {
      prompt: finalPrompt
    };

    // 🆕 AGREGAR NUESTROS PARÁMETROS DESEADOS (si Veo3 los soporta)
    // Basado en documentación oficial de Google
    if (finalAspectRatio !== "16:9") {
      requestBody.aspect_ratio = finalAspectRatio;
    }
    
    if (durationNumber !== 8) {
      requestBody.duration = durationNumber;
    }

    // 🆕 IMAGEN BASE: Funcionalidad imagen → video (CORE de nuestro proyecto)
    if (imageUrl && imageUrl.trim().length > 0) {
      try {
        new URL(imageUrl);
        requestBody.image_url = imageUrl;
        console.log(`🖼️ Using base image for video generation: ${imageUrl}`);
      } catch (urlError) {
        console.warn(`⚠️ Invalid image URL, proceeding without base image: ${urlError.message}`);
      }
    }

    // 🆕 AUDIO HABILITADO (feature principal de Veo3)
    requestBody.generate_audio = true;

    console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));

         // 🆕 PASO 1: INICIAR GENERACIÓN (POST)
     const FAL_KEY = process.env.FAL_KEY;
     if (!FAL_KEY) {
       throw new Error('FAL_KEY environment variable is required');
     }

     // 🔍 Debug de autenticación (sin exponer la key completa)
     console.log(`🔑 FAL_KEY configured: ${FAL_KEY ? `${FAL_KEY.substring(0, 8)}...` : 'NOT_SET'}`);
     console.log(`🚀 Starting video generation...`);
    
         const createResponse = await fetch('https://queue.fal.run/fal-ai/veo3', {
       method: 'POST',
       headers: {
         'Authorization': `Key ${FAL_KEY}`,
         'Content-Type': 'application/json',
         'User-Agent': 'PublicidadZaimella/1.0'
       },
       body: JSON.stringify(requestBody)
     });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to start video generation: ${createResponse.status} ${createResponse.statusText} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log(`📋 Generation started:`, createResult);

    if (!createResult.request_id) {
      throw new Error('No request_id received from video generation start');
    }

    const requestId = createResult.request_id;
    console.log(`🔄 Request ID: ${requestId}`);

    // 🆕 PASO 2: POLLING ASÍNCRONO (GET hasta completar)
    const maxAttempts = 30; // 5 minutos máximo (30 * 10s)
    const pollInterval = 10000; // 10 segundos entre polls
    
    console.log(`⏳ Starting polling process (max ${maxAttempts} attempts, ${pollInterval/1000}s interval)...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Poll attempt ${attempt}/${maxAttempts}...`);
      
             const statusResponse = await fetch(`https://queue.fal.run/fal-ai/veo3/requests/${requestId}`, {
         method: 'GET',
         headers: {
           'Authorization': `Key ${FAL_KEY}`,
           'User-Agent': 'PublicidadZaimella/1.0'
         }
       });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status: ${statusResponse.status} ${statusResponse.statusText}`);
      }

      const statusResult = await statusResponse.json();
      console.log(`📊 Status check ${attempt}:`, statusResult.status || 'unknown');

      // 🆕 VERIFICAR ESTADO
      if (statusResult.status === 'COMPLETED') {
        console.log(`✅ Video generation completed!`);
        
        if (!statusResult.video || !statusResult.video.url) {
          throw new Error('Video generation completed but no video URL received');
        }

        console.log(`🎥 Video URL: ${statusResult.video.url}`);

        return {
          success: true,
          videoUrl: statusResult.video.url,
          duration: finalDuration,
          aspectRatio: finalAspectRatio,
          requestId: requestId,
          promptLength: finalPrompt.length,
          originalPromptLength: prompt.length,
          audioEnabled: true,
          pollAttempts: attempt
        };

      } else if (statusResult.status === 'FAILED') {
        console.error(`❌ Video generation failed:`, statusResult.error || 'Unknown error');
        throw new Error(`Video generation failed: ${statusResult.error || 'Unknown error'}`);
        
      } else if (statusResult.status === 'IN_PROGRESS' || statusResult.status === 'IN_QUEUE') {
        console.log(`⏳ Still processing... (${statusResult.status})`);
        
        // Esperar antes del siguiente poll
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
      } else {
        console.warn(`⚠️ Unexpected status: ${statusResult.status}`);
        // Continuar polling para estados desconocidos
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }

    // Si llegamos aquí, se agotaron los intentos
    throw new Error(`Video generation timed out after ${maxAttempts} attempts (${(maxAttempts * pollInterval / 1000)} seconds)`);

  } catch (error) {
    console.error('❌ Error in generateVideoWithVeo3:', error);
    
    // 🆕 MEJOR MANEJO DE ERRORES ESPECÍFICOS
    let errorMessage = 'Unknown error occurred';
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      errorMessage = 'Authentication failed. Please check your FAL_KEY.';
    } else if (error.message?.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please wait before trying again.';
    } else if (error.message?.includes('Forbidden')) {
      errorMessage = 'Access forbidden. Please verify your FAL account permissions.';
    } else if (error.message?.includes('timed out')) {
      errorMessage = 'Video generation took too long. Please try with a shorter prompt.';
    } else {
      errorMessage = error.message || error.toString();
    }
    
    return {
      success: false,
      error: errorMessage,
      originalError: error.message,
      promptLength: prompt.length
    };
  }
} 