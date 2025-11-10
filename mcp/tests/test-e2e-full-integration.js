/**
 * TEST E2E: FULL INTEGRATION - Context Coherence Validation
 * Ejecuta pipeline completo HASTA video composition (sin ejecutar FAL API)
 * Valida que Context Coherence esté integrado en TODA la cadena
 */

import { ContentOrchestrator } from '../tools/content-orchestrator.js';

console.log('========================================');
console.log('TEST E2E: FULL INTEGRATION + CONTEXT COHERENCE');
console.log('========================================\n');

// Brief CMF Tarjetas (según context_agent demo_cmf_client)
const briefCMF = {
  brief: `Lanzar campaña de marketing para Tarjetas CMF (prepagadas y crédito Mastercard).
Producto: Tarjetas digitales con beneficios exclusivos, programa Tu Precio CMF, financiamiento flexible.
Target: Profesionales 30-50 años, nivel socioeconómico B/C, buscan control financiero + beneficios.
Mensaje clave: "Construye tus sueños" - apoyo, cooperación, progreso.
Objetivo: Generar solicitudes de tarjetas online.
Budget: $5,000 USD.`,
  niche: 'financial_services',
  platforms: ['instagram', 'linkedin', 'facebook'],
  generateVideo: false, // ❌ NO generar video (preservar saldo)
  generateImages: true,
  contextProfileId: 'example_agency_1734624619000' // Context profile disponible
};

console.log('📋 BRIEF CMF TARJETAS:');
console.log(JSON.stringify(briefCMF, null, 2));
console.log('');

// Variables para capturar datos de integración
let contextCoherenceData = {
  step7_productImage: null,
  step8_avatarImage: null,
  step9_videoPreparation: null,
  unifiedContextPresent: false,
  enhancedPromptGenerated: false,
  strategicElementsCount: 0,
  languageDetected: null,
  logs: []
};

// Mock console.log para capturar logs críticos
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');

  // Capturar logs de Context Coherence
  if (message.includes('Context coherence applied')) {
    const match = message.match(/(\d+) elements unified/);
    if (match) {
      contextCoherenceData.strategicElementsCount = parseInt(match[1]);
      contextCoherenceData.logs.push(`✅ Context Coherence: ${match[1]} elements`);
    }
  }

  if (message.includes('Detected language:')) {
    const match = message.match(/Detected language: (\w+)/);
    if (match) {
      contextCoherenceData.languageDetected = match[1];
      contextCoherenceData.logs.push(`✅ Language: ${match[1]}`);
    }
  }

  if (message.includes('Unified context')) {
    contextCoherenceData.unifiedContextPresent = true;
    contextCoherenceData.logs.push('✅ Unified Context present');
  }

  // Llamar al log original
  originalLog.apply(console, args);
};

async function runFullIntegrationTest() {
  console.log('⏱️ INICIANDO TEST FULL INTEGRATION...\n');
  const startTime = Date.now();

  try {
    // Inicializar orchestrator
    console.log('[STEP 0] Inicializando ContentOrchestrator...');
    const orchestrator = new ContentOrchestrator();
    await orchestrator.initialize(briefCMF); // 🔥 FIX: Pasar briefCMF aquí
    console.log('✅ Orchestrator inicializado\n');

    // MOCK: Interceptar generateVideo para no consumir saldo
    const originalGenerateVideo = orchestrator.apiBridge.generateVideo;
    orchestrator.apiBridge.generateVideo = async function(prompt, options) {
      console.log('\n🎬 [MOCK] Video generation intercepted (no FAL API call)');
      console.log('📊 Video parameters captured:');
      console.log(`  - Prompt length: ${prompt.length} chars`);
      console.log(`  - Language: ${options.language}`);
      console.log(`  - Context Profile ID: ${options.contextProfileId || 'none'}`);
      console.log(`  - Video Script present: ${!!options.videoScript}`);
      console.log(`  - Image URL: ${options.imageUrl ? 'provided' : 'none'}`);

      // Capturar datos
      contextCoherenceData.step9_videoPreparation = {
        promptLength: prompt.length,
        language: options.language,
        contextProfileId: options.contextProfileId,
        hasVideoScript: !!options.videoScript,
        hasImageUrl: !!options.imageUrl,
        enhancedPrompt: prompt.substring(0, 200) + '...' // Preview
      };

      contextCoherenceData.enhancedPromptGenerated = prompt.length > 0;

      // Simular respuesta exitosa (sin ejecutar FAL)
      return {
        success: true,
        videoUrl: 'MOCK_VIDEO_URL',
        publicUrl: 'MOCK_PUBLIC_URL',
        duration: '8s',
        fromMock: true,
        message: 'Video generation skipped (integration test mode)'
      };
    };

    // Ejecutar pipeline completo
    console.log('[STEPS 1-10] Ejecutando pipeline completo...');
    console.log('--------------------------------------------\n');

    const session = await orchestrator.generateCompleteContent(); // ✅ FIX: No parámetros (usa session.config)

    // Restaurar console.log original
    console.log = originalLog;

    // Análisis de resultados
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n========================================');
    console.log('RESULTADOS TEST FULL INTEGRATION');
    console.log('========================================\n');

    console.log('⏱️ TIEMPO TOTAL:', duration, 'minutos\n');

    console.log('📊 PASOS EJECUTADOS:');
    // ✅ FIX: session viene de compileFinalResults(), usar estructura correcta
    console.log(`  ✅ Customer Avatar: ${session.customer_avatar ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Unique Mechanism: ${session.unique_mechanism ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Grand Slam Offer: ${session.grand_slam_offer ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Copy Generation: ${session.copy ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Product Image: ${session.images?.[0] ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Avatar Image: ${session.images?.[1] ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Video Preparation: ${session.video ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Landing Page: ${session.landing_page ? 'OK' : 'FAIL'}`);

    console.log('\n🔥 VALIDACIÓN CONTEXT COHERENCE:');
    console.log('--------------------------------------------');
    console.log(`  Strategic Elements Unified: ${contextCoherenceData.strategicElementsCount}`);
    console.log(`  Unified Context Present: ${contextCoherenceData.unifiedContextPresent ? '✅' : '❌'}`);
    console.log(`  Enhanced Prompt Generated: ${contextCoherenceData.enhancedPromptGenerated ? '✅' : '❌'}`);
    console.log(`  Language Detected: ${contextCoherenceData.languageDetected || 'N/A'}`);

    if (contextCoherenceData.step9_videoPreparation) {
      console.log('\n📹 VIDEO PREPARATION (captured):');
      const vp = contextCoherenceData.step9_videoPreparation;
      console.log(`  - Prompt: ${vp.promptLength} chars`);
      console.log(`  - Language: ${vp.language}`);
      console.log(`  - Context Profile: ${vp.contextProfileId || 'none'}`);
      console.log(`  - Video Script: ${vp.hasVideoScript ? '✅' : '❌'}`);
      console.log(`  - Image URL: ${vp.hasImageUrl ? '✅' : '❌'}`);
      console.log(`  - Enhanced Prompt Preview: "${vp.enhancedPrompt}"`);
    }

    console.log('\n📝 LOGS CAPTURADOS:');
    contextCoherenceData.logs.forEach(log => console.log(`  ${log}`));

    // Validación final
    console.log('\n========================================');
    console.log('VALIDACIÓN FINAL');
    console.log('========================================\n');

    const validations = [
      { name: 'Pipeline completado sin errores', pass: session.success === true }, // ✅ FIX: compileFinalResults usa 'success'
      { name: 'Strategic elements unified (>= 3)', pass: contextCoherenceData.strategicElementsCount >= 3 },
      { name: 'Unified context presente', pass: contextCoherenceData.unifiedContextPresent },
      { name: 'Enhanced prompt generado', pass: contextCoherenceData.enhancedPromptGenerated },
      { name: 'Language detectado', pass: !!contextCoherenceData.languageDetected },
      { name: 'Video preparation ejecutada', pass: !!contextCoherenceData.step9_videoPreparation },
      { name: 'Video script generado', pass: contextCoherenceData.step9_videoPreparation?.hasVideoScript || false },
      { name: 'Context Profile ID pasado', pass: !!contextCoherenceData.step9_videoPreparation?.contextProfileId }
    ];

    const passed = validations.filter(v => v.pass).length;
    const total = validations.length;

    console.log('🧪 TESTS:');
    validations.forEach(v => {
      console.log(`  ${v.pass ? '✅' : '❌'} ${v.name}`);
    });

    console.log(`\n📊 RESULTADO: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)\n`);

    if (passed === total) {
      console.log('✅ TEST FULL INTEGRATION: PASSED');
      console.log('🎉 Context Coherence correctamente integrado en toda la cadena\n');
      return { success: true, session, contextCoherenceData };
    } else {
      console.log('❌ TEST FULL INTEGRATION: FAILED');
      console.log(`   ${total - passed} validación(es) fallaron\n`);
      return { success: false, session, contextCoherenceData };
    }

  } catch (error) {
    console.log = originalLog; // Restaurar log
    console.error('\n❌ ERROR EN TEST:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Ejecutar test
runFullIntegrationTest().then(result => {
  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
