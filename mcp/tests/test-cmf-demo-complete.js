/**
 * TEST CMF DEMO COMPLETE - Full Pipeline with REAL Video
 * Genera campaña completa CMF con video veo3-fast (económico)
 * Valida Context Coherence + BigQuery integration + Video generation
 */

import { ContentOrchestrator } from '../tools/content-orchestrator.js';

console.log('========================================');
console.log('TEST CMF DEMO COMPLETE - FULL PIPELINE');
console.log('========================================\n');

// Brief CMF Tarjetas (BigQuery integration ready)
const briefCMF = {
  brief: `Lanzar campaña de marketing para Tarjetas CMF (prepagadas y crédito Mastercard).
Producto: Tarjetas digitales con beneficios exclusivos, programa Tu Precio CMF, financiamiento flexible.
Target: Profesionales 30-50 años, scoring 600-750, buscan control financiero + beneficios.
Mensaje clave: "Construye tus sueños" - apoyo, cooperación, progreso financiero inteligente.
Objetivo: Generar solicitudes de tarjetas online.
Budget: $5,000 USD.`,
  niche: 'financial_services',
  platforms: ['instagram', 'facebook'],
  generateVideo: true,  // ✅ GENERAR VIDEO REAL
  generateImages: true,
  contextProfileId: 'example_agency_1734624619000', // Context profile disponible
  videoOptions: {
    model: 'veo3-fast',  // Modelo económico ($0.40/8s)
    count: 1,             // Solo 1 video
    duration: 8           // 8 segundos
  }
};

console.log('📋 BRIEF CMF TARJETAS:');
console.log(JSON.stringify(briefCMF, null, 2));
console.log('');

// Variables para capturar datos completos
let demoResults = {
  customer_avatar: null,
  unique_mechanism: null,
  grand_slam_offer: null,
  copy: null,
  product_image: null,
  avatar_image: null,
  video: null,
  landing_page: null,
  context_coherence: {
    strategic_elements: 0,
    unified_context: false,
    enhanced_prompt: false,
    language: null
  },
  quality_scores: {},
  execution_time: null
};

async function runCMFDemoComplete() {
  console.log('⏱️ INICIANDO CMF DEMO COMPLETE...\n');
  const startTime = Date.now();

  try {
    // Inicializar orchestrator
    console.log('[STEP 0] Inicializando ContentOrchestrator...');
    const orchestrator = new ContentOrchestrator();
    await orchestrator.initialize(briefCMF);
    console.log('✅ Orchestrator inicializado\n');

    // Ejecutar pipeline completo (CON video real)
    console.log('[PIPELINE] Ejecutando generación completa...');
    console.log('--------------------------------------------\n');

    const session = await orchestrator.generateCompleteContent();

    // Análisis de resultados
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n========================================');
    console.log('RESULTADOS CMF DEMO COMPLETE');
    console.log('========================================\n');

    console.log('⏱️ TIEMPO TOTAL:', duration, 'minutos\n');

    // Capturar resultados para context_agent
    demoResults = {
      customer_avatar: session.customer_avatar,
      unique_mechanism: session.unique_mechanism,
      grand_slam_offer: session.grand_slam_offer,
      copy: session.copy,
      product_image: session.images?.[0],
      avatar_image: session.images?.[1],
      video: session.video,
      landing_page: session.landing_page,
      execution_time: duration
    };

    console.log('📊 PASOS COMPLETADOS:');
    console.log(`  ✅ Customer Avatar: ${session.customer_avatar ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Unique Mechanism: ${session.unique_mechanism ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Grand Slam Offer: ${session.grand_slam_offer ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Copy Generation: ${session.copy ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Product Image: ${session.images?.[0] ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Avatar Image: ${session.images?.[1] ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Video Generation: ${session.video ? 'OK' : 'FAIL'}`);
    console.log(`  ✅ Landing Page: ${session.landing_page ? 'OK' : 'FAIL'}`);

    // Detalles del video generado
    if (session.video) {
      console.log('\n🎬 VIDEO GENERADO (REAL):');
      console.log(`  - URL: ${session.video.videoUrl || session.video.publicUrl || 'N/A'}`);
      console.log(`  - Duration: ${session.video.duration || '8s'}`);
      console.log(`  - Model: veo3-fast`);
      console.log(`  - Cost: ~$0.40`);
      console.log(`  - Context Coherence: ${session.video.contextCoherence ? '✅ Applied' : '❌'}`);
    }

    // Detalles del copy
    if (session.copy) {
      console.log('\n📝 AD COPY GENERADO:');
      const copyVariants = Array.isArray(session.copy.variants) ? session.copy.variants : [];
      console.log(`  - Variants: ${copyVariants.length}`);
      console.log(`  - Language: ${session.copy.language || 'es'}`);
      console.log(`  - Hook Type: ${session.copy.hookType || 'mechanism'}`);

      if (copyVariants.length > 0) {
        console.log('\n  Preview (variant 1):');
        const variant1 = copyVariants[0];

        // Safe access to variant properties (correct structure: variant1.copy.hook)
        const hook = variant1.copy?.hook || variant1.hook || variant1.content?.hook || 'N/A';
        const cta = variant1.copy?.cta || variant1.cta || variant1.content?.cta || 'N/A';

        console.log(`\n  Hook: "${typeof hook === 'string' ? hook.substring(0, 80) : hook}..."`);
        console.log(`  CTA: "${cta}"`);
      }
    }

    // Quality scores
    console.log('\n📊 QUALITY SCORES:');
    console.log(`  - Overall: ${session.quality_score || 'N/A'}/100`);
    console.log(`  - Copy: ${session.copy?.quality_score || 'N/A'}/100`);
    console.log(`  - Avatar: ${session.customer_avatar?.confidence || 'N/A'}%`);

    console.log('\n========================================');
    console.log('VALIDACIÓN FINAL');
    console.log('========================================\n');

    const validations = [
      { name: 'Pipeline completado', pass: session.success === true },
      { name: 'Customer Avatar generado', pass: !!session.customer_avatar },
      { name: 'Unique Mechanism generado', pass: !!session.unique_mechanism },
      { name: 'Grand Slam Offer generado', pass: !!session.grand_slam_offer },
      { name: 'Copy generado', pass: !!session.copy },
      { name: 'Product Image generado', pass: !!session.images?.[0] },
      { name: 'Avatar Image generado', pass: !!session.images?.[1] },
      { name: 'Video generado (REAL)', pass: !!session.video },
      { name: 'Landing Page generado', pass: !!session.landing_page }
    ];

    const passed = validations.filter(v => v.pass).length;
    const total = validations.length;

    console.log('🧪 TESTS:');
    validations.forEach(v => {
      console.log(`  ${v.pass ? '✅' : '❌'} ${v.name}`);
    });

    console.log(`\n📊 RESULTADO: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)\n`);

    if (passed === total) {
      console.log('✅ CMF DEMO COMPLETE: SUCCESS');
      console.log('🎉 Pipeline completo con video REAL generado\n');

      // Export results para context_agent
      console.log('📦 Resultados listos para context_agent export');

      return {
        success: true,
        session,
        demoResults,
        validations: { passed, total }
      };
    } else {
      console.log('⚠️ CMF DEMO COMPLETE: PARTIAL SUCCESS');
      console.log(`   ${total - passed} validación(es) fallaron\n`);
      return {
        success: false,
        session,
        demoResults,
        validations: { passed, total }
      };
    }

  } catch (error) {
    console.error('\n❌ ERROR EN CMF DEMO:', error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message, demoResults };
  }
}

// Ejecutar demo
runCMFDemoComplete().then(result => {
  console.log('\n========================================');
  console.log('DEMO FINALIZADA');
  console.log('========================================');

  if (result.success) {
    console.log('\n✅ Demo exitosa - Todos los assets generados');
    console.log('📊 Tiempo total:', result.demoResults.execution_time, 'minutos');

    if (result.session?.video) {
      console.log('\n🎬 VIDEO URL:', result.session.video.videoUrl || result.session.video.publicUrl);
    }

    process.exit(0);
  } else {
    console.log('\n⚠️ Demo completada con errores');
    if (result.error) {
      console.log('Error:', result.error);
    }
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
