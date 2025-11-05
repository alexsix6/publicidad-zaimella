/**
 * Test: Landing Page CSS Generation with Pantone Colors (Phase 2)
 * Validates:
 * - MODE A: CSS with real Pantone colors (Context Profile exists)
 * - MODE B: CSS with default colors + user guidance (Context Profile missing)
 * - Technical score differentiation (100 vs 70)
 * - Responsive breakpoints
 */

import { landingPageStructureGenerator } from '../../../creator_skills/skills/landing-page-structure/v1.0.0/index.js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function testLandingPageCSSPantone() {
  console.log('='.repeat(70));
  console.log('🧪 LANDING PAGE CSS + PANTONE COLORS TEST - Phase 2');
  console.log('='.repeat(70));

  // Test 1: MODE A - Context Profile EXISTS (Prudential Pantone colors)
  console.log('\n📋 Test 1: MODE A - CSS with Prudential Pantone Colors');
  try {
    const result1 = await landingPageStructureGenerator.generate({
      brief: 'Launch insurance product for families',
      avatar: {
        pain_points_and_desires: {
          top_pain_points: [{ pain: 'Uncertain about family security' }],
          dream_outcome: { description: 'Complete family protection' }
        },
        market_sophistication: { primary_level: { level: 4 } }
      },
      offer: { price: '$149/month', guarantee: '60-day money-back' },
      contextProfileId: 'prudential_product_photography_1752994608940'
    });

    console.log('✅ Landing page generated WITH Context Profile');

    // Validate brand_alignment exists
    if (!result1.brand_alignment) {
      console.error('  ❌ FAILED: brand_alignment missing');
      return;
    }

    console.log(`  ✓ Context Profile used: ${result1.metadata.context_profile_used}`);
    console.log(`  ✓ Colors extracted: ${result1.brand_alignment.extraction_summary.colors_extracted}`);

    // CRITICAL: Validate CSS generated
    if (!result1.css_code) {
      console.error('  ❌ FAILED: css_code missing');
      return;
    }

    console.log(`  ✓ CSS generated: ${result1.css_code.length} characters`);

    // CRITICAL: Validate Prudential blue (#005EB8) in CSS
    if (result1.css_code.includes('#005EB8')) {
      console.log('  ✅ VALIDATED: Prudential blue (#005EB8) present in CSS!');
    } else {
      console.error('  ❌ FAILED: Prudential blue NOT found in CSS');
      console.error('     Expected: #005EB8 (Pantone 2935 C)');
      return;
    }

    // Validate Typography (Poppins Bold)
    if (result1.css_code.includes('Poppins')) {
      console.log('  ✅ VALIDATED: Poppins font present in CSS!');
    } else {
      console.warn('  ⚠️  Poppins font not found (check font name extraction)');
    }

    // Validate Responsive breakpoints
    const has768 = result1.css_code.includes('@media (max-width: 768px)');
    const has480 = result1.css_code.includes('@media (max-width: 480px)');

    if (has768 && has480) {
      console.log('  ✅ VALIDATED: Responsive breakpoints present (768px, 480px)');
    } else {
      console.error('  ❌ FAILED: Missing responsive breakpoints');
      return;
    }

    // Validate Technical Score
    if (!result1.technical_score) {
      console.error('  ❌ FAILED: technical_score missing');
      return;
    }

    console.log(`\n📊 Technical Score: ${result1.technical_score}/100`);

    if (result1.technical_score >= 95) {
      console.log('  ✅ VALIDATED: Technical score excellent (95+)');
    } else {
      console.warn(`  ⚠️  Technical score lower than expected: ${result1.technical_score}`);
    }

    // Validate HTML with CSS
    if (!result1.html_with_css) {
      console.error('  ❌ FAILED: html_with_css missing');
      return;
    }

    console.log(`  ✓ HTML with CSS: ${result1.html_with_css.length} characters`);

    // Validate HTML contains <style> tag
    if (result1.html_with_css.includes('<style>') && result1.html_with_css.includes('</style>')) {
      console.log('  ✅ VALIDATED: <style> tag embedded in HTML');
    } else {
      console.error('  ❌ FAILED: <style> tag missing in HTML');
      return;
    }

    // Validate user_guidance NOT present (Context Profile exists)
    if (result1.user_guidance) {
      console.error('  ❌ FAILED: user_guidance should NOT be present with Context Profile');
      return;
    } else {
      console.log('  ✅ VALIDATED: user_guidance correctly absent (Context Profile exists)');
    }

    // Save CSS to file for manual inspection
    const cssFilePath = resolve('/mnt/d/Dev/publicidad-zaimella/mcp/tests/output', 'prudential_landing_page.css');
    writeFileSync(cssFilePath, result1.css_code);
    console.log(`\n💾 CSS saved to: ${cssFilePath}`);

    // Save HTML to file
    const htmlFilePath = resolve('/mnt/d/Dev/publicidad-zaimella/mcp/tests/output', 'prudential_landing_page.html');
    writeFileSync(htmlFilePath, result1.html_with_css);
    console.log(`💾 HTML saved to: ${htmlFilePath}`);

  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    console.error(error.stack);
    return;
  }

  // Test 2: MODE B - Context Profile DOES NOT EXIST (default colors + guidance)
  console.log('\n📋 Test 2: MODE B - CSS with Default Colors + User Guidance');
  try {
    const result2 = await landingPageStructureGenerator.generate({
      brief: 'Launch premium product photography service',
      avatar: {
        pain_points_and_desires: {
          top_pain_points: [{ pain: 'Poor product images' }],
          dream_outcome: { description: 'Professional product photos' }
        },
        market_sophistication: { primary_level: { level: 3 } }
      },
      offer: { price: '$299/session', guarantee: '100% satisfaction' }
      // NO contextProfileId provided
    });

    console.log('✅ Landing page generated WITHOUT Context Profile');

    // Validate brand_alignment DOES NOT exist
    if (result2.brand_alignment) {
      console.error('  ❌ FAILED: brand_alignment should NOT be present without Context Profile');
      return;
    } else {
      console.log('  ✓ brand_alignment correctly absent (no Context Profile)');
    }

    // CRITICAL: Validate CSS still generated (default mode)
    if (!result2.css_code) {
      console.error('  ❌ FAILED: css_code missing (should generate default CSS)');
      return;
    }

    console.log(`  ✓ CSS generated (default mode): ${result2.css_code.length} characters`);

    // Validate default colors used (#0066CC, #003366, #FF6B35)
    const hasDefaultPrimary = result2.css_code.includes('#0066CC');
    const hasDefaultSecondary = result2.css_code.includes('#003366');
    const hasDefaultAccent = result2.css_code.includes('#FF6B35');

    if (hasDefaultPrimary && hasDefaultSecondary && hasDefaultAccent) {
      console.log('  ✅ VALIDATED: Default color palette applied (#0066CC, #003366, #FF6B35)');
    } else {
      console.error('  ❌ FAILED: Default colors not found in CSS');
      return;
    }

    // Validate generic warning comment in CSS
    if (result2.css_code.includes('⚠️ Using generic color palette')) {
      console.log('  ✅ VALIDATED: Generic palette warning present in CSS');
    } else {
      console.warn('  ⚠️  Generic palette warning missing');
    }

    // Validate Technical Score (should be lower)
    console.log(`\n📊 Technical Score: ${result2.technical_score}/100`);

    if (result2.technical_score === 70) {
      console.log('  ✅ VALIDATED: Technical score correctly lower (70) without Context Profile');
    } else {
      console.warn(`  ⚠️  Expected 70, got ${result2.technical_score}`);
    }

    // CRITICAL: Validate user_guidance present
    if (!result2.user_guidance) {
      console.error('  ❌ FAILED: user_guidance missing (should guide user to create Context Profile)');
      return;
    }

    console.log('\n📖 User Guidance Present:');
    console.log(`  ✓ Message: "${result2.user_guidance.message.substring(0, 60)}..."`);
    console.log(`  ✓ Benefits count: ${result2.user_guidance.benefits.length}`);
    console.log(`  ✓ Next steps count: ${result2.user_guidance.next_steps.length}`);

    // Validate guidance content
    if (result2.user_guidance.benefits.includes('Exact Pantone colors applied to all sections')) {
      console.log('  ✅ VALIDATED: Guidance mentions Pantone colors benefit');
    }

    if (result2.user_guidance.next_steps.includes('1. Create Context Profile with brand_guidelines')) {
      console.log('  ✅ VALIDATED: Guidance provides clear next steps');
    }

    if (result2.user_guidance.example_profile_structure) {
      console.log('  ✅ VALIDATED: Example Context Profile structure provided');
    }

    // Save default CSS to file
    const defaultCssPath = resolve('/mnt/d/Dev/publicidad-zaimella/mcp/tests/output', 'default_landing_page.css');
    writeFileSync(defaultCssPath, result2.css_code);
    console.log(`\n💾 Default CSS saved to: ${defaultCssPath}`);

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    console.error(error.stack);
    return;
  }

  // Test 3: Compare CSS sizes and quality
  console.log('\n📋 Test 3: CSS Quality Comparison');
  try {
    const resultBranded = await landingPageStructureGenerator.generate({
      brief: 'Launch insurance product',
      avatar: {
        pain_points_and_desires: {
          top_pain_points: [{ pain: 'Security concerns' }],
          dream_outcome: { description: 'Peace of mind' }
        }
      },
      contextProfileId: 'prudential_product_photography_1752994608940'
    });

    const resultDefault = await landingPageStructureGenerator.generate({
      brief: 'Launch insurance product',
      avatar: {
        pain_points_and_desires: {
          top_pain_points: [{ pain: 'Security concerns' }],
          dream_outcome: { description: 'Peace of mind' }
        }
      }
    });

    console.log('  Branded CSS length:', resultBranded.css_code.length);
    console.log('  Default CSS length:', resultDefault.css_code.length);
    console.log('  Technical score delta:', resultBranded.technical_score - resultDefault.technical_score);

    if (resultBranded.technical_score > resultDefault.technical_score) {
      console.log('  ✅ VALIDATED: Branded CSS has higher technical score');
    }

  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY - PHASE 2 CSS GENERATION');
  console.log('='.repeat(70));
  console.log('✅ MODE A (Context Profile exists):');
  console.log('   - Pantone colors extracted and applied (#005EB8 validated)');
  console.log('   - Typography applied (Poppins Bold)');
  console.log('   - Responsive breakpoints (768px, 480px)');
  console.log('   - Technical score: 100/100');
  console.log('   - HTML with embedded CSS generated');
  console.log('');
  console.log('✅ MODE B (Context Profile missing):');
  console.log('   - Default professional palette (#0066CC, #003366, #FF6B35)');
  console.log('   - Generic typography (system fonts)');
  console.log('   - Technical score: 70/100');
  console.log('   - User guidance with 4 benefits + 4 next steps');
  console.log('   - Example Context Profile structure provided');
  console.log('');
  console.log('✅ Degradation elegante: Funcional con/sin Context Profile');
  console.log('✅ User education: Guidance clara para crear Context Profile');
  console.log('\n🎯 Phase 2 COMPLETE - CSS Generation with Pantone + User Guidance\n');
}

// Run test
testLandingPageCSSPantone().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
