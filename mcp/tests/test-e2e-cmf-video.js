#!/usr/bin/env node

/**
 * TEST 3.1 E2E: Cliente CMF Complete Flow
 *
 * Valida pipeline completo:
 * - Niche detection
 * - Avatar construction
 * - Grand Slam Offer
 * - Copy generation (11 variants)
 * - Image generation (4-8 images)
 * - VIDEO GENERATION (2-4 videos) ⭐ FOCUS
 *
 * Expected: <15 min, no errors, all assets generated
 */

import { ContentOrchestrator } from '../tools/content-orchestrator.js';

async function runE2ETest() {
  console.log('========================================');
  console.log('TEST 3.1 E2E: CLIENTE CMF COMPLETE FLOW');
  console.log('========================================\n');

  const startTime = Date.now();

  // BRIEF CMF: Real Estate Premium
  // ✅ FIXED: brief debe ser string, no objeto
  const testBrief = {
    brief: `Lanzar campaña de marketing para departamentos de lujo en zona premium de CMF Inmobiliaria.
Producto: Departamentos exclusivos con vista panorámica a la ciudad, amenities 5 estrellas
(gimnasio, spa, rooftop lounge), tecnología smart home integrada, ubicación estratégica cerca
de centros de negocios.
Target: Profesionales exitosos 35-50 años, nivel socioeconómico A/B, buscan inversión + lifestyle premium.
ROI proyectado: 8-12% anual.
Objetivo: Generar leads calificados para tours virtuales personalizados.
Budget: $15,000 USD.`,
    niche: 'real_estate', // ✅ Niche key que mapea a context profiles
    platforms: ['instagram', 'linkedin', 'facebook'],
    generateVideo: true, // ⭐ KEY: Solicitar video
    videoCount: 2, // ⭐ 2 videos para testing
    pricing: {
      base_price: 450000, // USD precio base departamento
      currency: 'USD',
      billing_cycle: 'one-time'
    }
  };

  console.log('📋 BRIEF CMF:');
  console.log(JSON.stringify(testBrief, null, 2));
  console.log('\n⏱️ INICIANDO PIPELINE E2E...\n');

  try {
    // Inicializar orchestrator
    console.log('[PHASE 0] Inicializando ContentOrchestrator...');
    const orchestrator = new ContentOrchestrator();
    await orchestrator.initialize(testBrief); // ✅ FIXED: Pass testBrief to initialize()
    console.log('✅ ContentOrchestrator ready\n');

    // Ejecutar pipeline completo
    console.log('[PHASE 1-4] Ejecutando pipeline completo...');
    console.log('--------------------------------------------');

    const result = await orchestrator.generateCompleteContent(); // ✅ FIXED: No parameters

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2); // minutos

    console.log('\n========================================');
    console.log('RESULTADO TEST 3.1 E2E');
    console.log('========================================\n');

    if (result.success) {
      console.log('✅ TEST PASSED - Pipeline completado sin errores\n');

      console.log('⏱️ TIEMPO TOTAL:', duration, 'minutos');
      console.log('🎯 TARGET: <15 minutos');
      console.log('📊 PERFORMANCE:', duration < 15 ? '✅ DENTRO DE TARGET' : '⚠️ FUERA DE TARGET', '\n');

      // Estadísticas
      console.log('📊 ESTADÍSTICAS:');
      console.log('--------------------------------------------');
      console.log('Copy variants generadas:', result.copyResult?.variants?.length || 0);
      console.log('Imágenes generadas:', result.imageResults?.length || 0);
      console.log('Videos generados:', result.videoResults?.length || 0, '⭐');
      console.log('');

      // Validar videos (CRITICAL)
      console.log('🎥 VALIDACIÓN DE VIDEOS:');
      console.log('--------------------------------------------');

      if (!result.videoResults || result.videoResults.length === 0) {
        console.error('❌ FALLO CRÍTICO: No se generaron videos');
        console.error('Expected: 2 videos');
        console.error('Actual: 0 videos\n');
      } else {
        console.log(`✅ Videos generados: ${result.videoResults.length}`);

        result.videoResults.forEach((video, idx) => {
          console.log(`\nVideo ${idx + 1}:`);
          console.log('  URL:', video.videoUrl || 'N/A');
          console.log('  Duration:', video.duration || 'N/A');
          console.log('  Model:', video.modelType || 'N/A');
          console.log('  Cost:', video.costBreakdown || 'N/A');
          console.log('  Aspect Ratio:', video.aspectRatio || 'N/A');
          console.log('  Audio:', video.audioEnabled ? '✅' : '❌');
          console.log('  Status:', video.success ? '✅ SUCCESS' : '❌ FAILED');

          if (!video.success) {
            console.error('  Error:', video.error);
          }
        });
        console.log('');
      }

      // Copy variants
      if (result.copyResult?.variants) {
        console.log('📝 COPY VARIANTS (muestra):');
        console.log('--------------------------------------------');
        const sample = result.copyResult.variants[0];
        const copy = sample.copy || sample;
        console.log('Headline:', copy.headline || 'N/A');
        console.log('Hook:', copy.hook?.substring(0, 100) || 'N/A', '...');
        console.log('Platform:', sample.platform || 'N/A');
        console.log('Sophistication:', sample.market_sophistication || 'N/A');
        console.log('');
      }

      // Imágenes
      if (result.imageResults && result.imageResults.length > 0) {
        console.log('🖼️ IMÁGENES (muestra):');
        console.log('--------------------------------------------');
        result.imageResults.slice(0, 2).forEach((img, idx) => {
          console.log(`Image ${idx + 1}:`, img.imageUrl?.substring(0, 60) || 'N/A', '...');
        });
        console.log('');
      }

      // GAPS IDENTIFICADOS
      console.log('🔍 GAPS IDENTIFICADOS:');
      console.log('--------------------------------------------');

      // GAP #1: Pipeline Order
      if (result.imageResults && result.imageResults.length > 0 && result.copyResult?.variants) {
        const firstImage = result.imageResults[0];
        const firstCopy = result.copyResult.variants[0];

        console.log('GAP #1: Pipeline Order');
        console.log('  ¿Imágenes antes que copy?', firstImage.timestamp < firstCopy.timestamp ? '❌ SÍ (GAP CONFIRMADO)' : '✅ NO');
        console.log('');
      }

      console.log('========================================');
      console.log('TEST 3.1 E2E: ✅ COMPLETADO');
      console.log('========================================\n');

      // Guardar resultados
      const fs = await import('fs/promises');
      await fs.writeFile(
        '/mnt/d/Dev/publicidad-zaimella/.claude/doc/TEST_3.1_E2E_RESULTS.json',
        JSON.stringify({
          testName: 'Test 3.1 E2E CMF',
          timestamp: new Date().toISOString(),
          duration: `${duration} min`,
          success: true,
          stats: {
            copyVariants: result.copyResult?.variants?.length || 0,
            images: result.imageResults?.length || 0,
            videos: result.videoResults?.length || 0
          },
          videoValidation: {
            expected: 2,
            actual: result.videoResults?.length || 0,
            passed: (result.videoResults?.length || 0) >= 2
          },
          fullResult: result
        }, null, 2)
      );
      console.log('📄 Resultados guardados en: .claude/doc/TEST_3.1_E2E_RESULTS.json\n');

    } else {
      console.error('❌ TEST FAILED - Errores en pipeline\n');
      console.error('Error:', result.error);
      console.error('Details:', result.details);

      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED - Exception thrown\n');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    process.exit(1);
  }
}

// Ejecutar test
runE2ETest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
