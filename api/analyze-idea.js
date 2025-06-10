const openRouterClient = require('../lib/openrouter-client');

module.exports = async function handler(req, res) {
    console.log('🧠 [Analyze Idea] Request received');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use POST.' 
        });
    }

    try {
        const { 
            rawIdea, 
            analysisModel = 'deepseek/deepseek-r1'
        } = req.body;

        // Validación de entrada
        if (!rawIdea || rawIdea.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'rawIdea is required and cannot be empty'
            });
        }

        console.log('🧠 [Analyze Idea] Input:', {
            rawIdea: rawIdea.substring(0, 100) + '...',
            analysisModel
        });

        // Prompt especializado para análisis inteligente
        const analysisPrompt = `
Eres un experto en creatividad visual y optimización de prompts para generación de imágenes y videos con IA.

TAREA: Analiza la siguiente idea creativa y proporciona un análisis completo con sugerencias de optimización.

IDEA DEL USUARIO:
"${rawIdea}"

FORMATO DE RESPUESTA (JSON estricto):
{
  "qualityScore": "basic|good|excellent",
  "strengths": ["fortaleza1", "fortaleza2"],
  "suggestions": ["sugerencia1", "sugerencia2"],
  "imagePrompt": "prompt optimizado para imagen (detallado, con ambiente, iluminación, estilo)",
  "videoPrompt": "prompt optimizado para video (con movimiento, transiciones, acción)",
  "coherenceNotes": "notas sobre cómo mantener coherencia entre imagen y video"
}

CRITERIOS DE EVALUACIÓN:
- basic: idea vaga, falta detalles visuales, no especifica ambiente
- good: idea clara con algunos elementos visuales, pero podría ser más específica  
- excellent: idea rica en detalles visuales, ambiente claro, elementos narrativos

OPTIMIZACIÓN DE PROMPTS:
- Para IMAGEN: Agregar descripción física detallada, ambiente/escenario, iluminación, estilo artístico, composición
- Para VIDEO: Mantener coherencia con imagen + agregar movimientos específicos, transiciones, duración de acciones
- COHERENCIA: Explicar cómo Veo 3 mantendrá consistencia visual entre imagen y video

EJEMPLOS DE OPTIMIZACIÓN:
Entrada: "Un lobo rockero"
Salida imagen: "A anthropomorphic wolf wearing a black leather jacket and sunglasses, playing electric guitar on stage, dramatic stage lighting with purple and blue spotlights, smoke effects, concert venue background with crowd silhouettes, rock concert atmosphere, detailed fur texture, confident pose, professional concert photography style"
Salida video: "The anthropomorphic wolf starts by adjusting his sunglasses, then begins playing an energetic guitar solo, head banging to the rhythm, stage lights flashing with the beat, smoke swirling around, crowd cheering in background, camera slowly zooms in on his passionate performance"

Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional.`;

        // Realizar análisis con DeepSeek R1
        const analysisResponse = await openRouterClient.generateCompletion(
            analysisPrompt,
            analysisModel,
            {
                max_tokens: 1000,
                temperature: 0.7
            }
        );

        if (!analysisResponse || !analysisResponse.content) {
            throw new Error('No analysis response from OpenRouter');
        }

        console.log('🧠 [Analyze Idea] Raw AI response:', analysisResponse.content.substring(0, 200) + '...');

        // Parsear la respuesta JSON
        let analysisData;
        try {
            // Limpiar la respuesta (remover posibles bloques de código)
            let cleanResponse = analysisResponse.content.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/```$/, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/```$/, '');
            }
            
            analysisData = JSON.parse(cleanResponse);
        } catch (parseError) {
            console.error('🧠 [Analyze Idea] JSON parse error:', parseError);
            console.error('🧠 [Analyze Idea] Raw response:', analysisResponse.content);
            
            // Fallback: crear análisis básico
            analysisData = {
                qualityScore: 'basic',
                strengths: ['Idea creativa interesante'],
                suggestions: ['Agregar más detalles visuales', 'Especificar el ambiente o escenario'],
                imagePrompt: rawIdea + ', detailed, high quality, professional lighting, artistic composition',
                videoPrompt: rawIdea + ', smooth camera movement, dynamic action, cinematic lighting',
                coherenceNotes: 'Mantener consistencia en personajes, colores y estilo visual entre imagen y video'
            };
        }

        // Validar estructura del análisis
        if (!analysisData.qualityScore) analysisData.qualityScore = 'basic';
        if (!Array.isArray(analysisData.strengths)) analysisData.strengths = [];
        if (!Array.isArray(analysisData.suggestions)) analysisData.suggestions = [];
        if (!analysisData.imagePrompt) analysisData.imagePrompt = rawIdea;
        if (!analysisData.videoPrompt) analysisData.videoPrompt = rawIdea;

        console.log('🧠 [Analyze Idea] Final analysis:', {
            qualityScore: analysisData.qualityScore,
            strengthsCount: analysisData.strengths.length,
            suggestionsCount: analysisData.suggestions.length,
            imagePromptLength: analysisData.imagePrompt.length,
            videoPromptLength: analysisData.videoPrompt.length
        });

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            analysis: analysisData,
            metadata: {
                originalIdea: rawIdea,
                analysisModel: analysisModel,
                timestamp: new Date().toISOString(),
                analysisVersion: '1.0'
            }
        });

    } catch (error) {
        console.error('🧠 [Analyze Idea] Error:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            type: 'analysis_error'
        });
    }
} 