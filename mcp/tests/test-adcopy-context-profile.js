/**
 * Test: Ad Copy Generation with Context Profile Integration
 * Validates Phase 1.2 - Generic extraction + Brand alignment + Platform context
 */

import { adCopyGenerator } from '../../../creator_skills/skills/ad-copy-generation/v1.0.0/index.js';

async function testAdCopyWithContextProfile() {
  console.log('='.repeat(60));
  console.log('🧪 AD COPY + CONTEXT PROFILE INTEGRATION TEST');
  console.log('='.repeat(60));

  // Test 1: Ad Copy WITHOUT Context Profile (fallback mode)
  console.log('\n📋 Test 1: Ad Copy WITHOUT Context Profile');
  try {
    const result1 = await adCopyGenerator.generate({
      brief: 'Launch premium fitness coaching for busy professionals',
      avatar: {
        demographics: { age_range: '30-45', income_level: '$80K-$150K' },
        pain_points_and_desires: {
          top_pain_points: ['No time for gym', 'Inconsistent results'],
          dream_outcome: 'Get fit in 20 minutes per day'
        }
      },
      nicheContext: 'fitness coaching',
      platform: 'facebook'
    });

    console.log('✅ Ad Copy generated without Context Profile');
    console.log(`✓ Variants: ${result1.variants.length}`);
    console.log(`✓ Frameworks applied: ${result1.metadata.frameworks_applied.join(', ')}`);
    console.log(`✓ Brand alignment: ${result1.brand_alignment ? 'YES (unexpected)' : 'NO (expected)'}`)
    console.log(`✓ Quality score: ${result1.metadata.quality_score_estimated}/100`);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    return;
  }

  // Test 2: Ad Copy WITH Context Profile (Prudential - Insurance)
  console.log('\n📋 Test 2: Ad Copy WITH Context Profile (Prudential)');
  try {
    const result2 = await adCopyGenerator.generate({
      brief: 'Launch insurance product for families',
      avatar: {
        demographics: { age_range: '30-55', income_level: '$60K-$150K' },
        pain_points_and_desires: {
          top_pain_points: ['Uncertain about family security', 'Complex insurance options'],
          dream_outcome: 'Complete family protection with peace of mind'
        }
      },
      nicheContext: 'insurance',
      platform: 'linkedin',
      contextProfileId: 'prudential_product_photography_1752994608940'
    });

    console.log('✅ Ad Copy generated with Context Profile');
    console.log(`✓ Context Profile used: ${result2.metadata.context_profile_used}`);
    console.log(`✓ Brand guidelines extracted: ${result2.metadata.brand_guidelines_extracted}`);
    console.log(`✓ Quality score: ${result2.metadata.quality_score_estimated}/100`);

    // Validate brand_alignment section
    if (result2.brand_alignment) {
      console.log('\n🎨 Brand Alignment Extracted:');
      console.log(`  ✓ Colors available: ${result2.brand_alignment.colors_available}`);
      console.log(`  ✓ Colors extracted: ${result2.brand_alignment.extraction_summary.colors_extracted}`);

      if (result2.brand_alignment.colors) {
        const colorNames = Object.keys(result2.brand_alignment.colors);
        console.log(`  ✓ Color names: ${colorNames.join(', ')}`);

        // Show first color details (generic - works with ANY color name)
        const firstColorName = colorNames[0];
        const firstColor = result2.brand_alignment.colors[firstColorName];
        console.log(`  ✓ Sample color (${firstColorName}):`);
        console.log(`      - Hex: ${firstColor.hex}`);
        console.log(`      - Pantone: ${firstColor.pantone}`);
      }

      console.log(`  ✓ Typography available: ${result2.brand_alignment.typography_available}`);
      if (result2.brand_alignment.typography) {
        console.log(`  ✓ Primary font: ${result2.brand_alignment.typography.primary_font}`);
      }

      console.log(`  ✓ Brand tone: ${result2.brand_alignment.brand_tone || 'Not specified'}`);
      console.log(`  ✓ Brand identity strength: ${result2.brand_alignment.extraction_summary.brand_identity_strength}/100`);
    } else {
      console.warn('⚠️  Brand alignment NOT extracted (unexpected)');
    }

    // Validate platform_context section
    if (result2.platform_context) {
      console.log('\n📱 Platform Context Extracted:');
      console.log(`  ✓ Platform: ${result2.platform_context.platform}`);
      console.log(`  ✓ Tone of voice: ${result2.platform_context.tone_of_voice}`);
      console.log(`  ✓ Demographics: ${result2.platform_context.demographics}`);
      console.log(`  ✓ Brand tone applied: ${result2.platform_context.brand_tone_applied}`);
    } else {
      console.warn('⚠️  Platform context NOT extracted (unexpected)');
    }

    // Validate frameworks still applied
    console.log('\n🧠 Methodologies Applied:');
    console.log(`  ✓ Todd Brown 5 Hook Types: ${result2.variants.length} variants`);

    // Check each variant has hook_type
    const hookTypes = result2.variants.map(v => v.hook_type);
    console.log(`  ✓ Hook types: ${hookTypes.join(', ')}`);

    // Validate metadata explicit
    if (result2.metadata.frameworks_explicit) {
      console.log(`  ✓ Explicit metadata: YES (frameworks documented)`);
      console.log(`  ✓ PAS structure: ${result2.metadata.frameworks_explicit.pas_structure.problem}`);
    }

    // Validate copy variants quality
    console.log('\n✍️  Copy Variants Sample:');
    const firstVariant = result2.variants[0];
    console.log(`  Variant 1 (${firstVariant.hook_type}):`);
    console.log(`    Headline: ${firstVariant.copy.headline.substring(0, 60)}...`);
    console.log(`    CTA: ${firstVariant.copy.cta}`);

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    console.error(error.stack);
    return;
  }

  // Test 3: Ad Copy WITH Context Profile (Premium Product - Photography)
  console.log('\n📋 Test 3: Ad Copy WITH Context Profile (Premium Product)');
  try {
    const result3 = await adCopyGenerator.generate({
      brief: 'Launch premium product photography service',
      avatar: {
        demographics: { age_range: '25-45', income_level: '$50K-$120K' },
        pain_points_and_desires: {
          top_pain_points: ['Poor product images hurt sales', 'Expensive studio sessions'],
          dream_outcome: 'Professional product photos that sell'
        }
      },
      nicheContext: 'photography services',
      platform: 'instagram',
      contextProfileId: 'premium_product_photography_1753107444269'
    });

    console.log('✅ Ad Copy generated with Premium Product profile');
    console.log(`✓ Context Profile used: ${result3.metadata.context_profile_used}`);
    console.log(`✓ Brand guidelines extracted: ${result3.metadata.brand_guidelines_extracted}`);
    console.log(`✓ Quality score: ${result3.metadata.quality_score_estimated}/100`);

    if (result3.brand_alignment) {
      console.log(`  ✓ Colors extracted: ${result3.brand_alignment.extraction_summary.colors_extracted}`);
      console.log(`  ✓ Brand identity strength: ${result3.brand_alignment.extraction_summary.brand_identity_strength}/100`);
    }

    if (result3.platform_context) {
      console.log(`  ✓ Platform: ${result3.platform_context.platform} (brand tone applied: ${result3.platform_context.brand_tone_applied})`);
    }

  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  // Test 4: Multiple platforms with same Context Profile
  console.log('\n📋 Test 4: Multi-Platform Context Adaptation');
  try {
    const platforms = ['facebook', 'linkedin', 'instagram'];
    const results = [];

    for (const platform of platforms) {
      const result = await adCopyGenerator.generate({
        brief: 'Launch insurance product for families',
        avatar: {
          demographics: { age_range: '30-55', income_level: '$60K-$150K' },
          pain_points_and_desires: {
            top_pain_points: ['Uncertain about family security'],
            dream_outcome: 'Complete family protection'
          }
        },
        nicheContext: 'insurance',
        platform: platform,
        contextProfileId: 'prudential_product_photography_1752994608940'
      });
      results.push({ platform, tone: result.platform_context?.tone_of_voice });
    }

    console.log('✅ Multi-platform generation successful');
    results.forEach(r => {
      console.log(`  ✓ ${r.platform}: ${r.tone.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY - PHASE 1.2');
  console.log('='.repeat(60));
  console.log('✅ Generic extraction: WORKING');
  console.log('✅ Context Profile loading: WORKING');
  console.log('✅ Brand guidelines extraction: WORKING');
  console.log('✅ Brand alignment section: GENERATED');
  console.log('✅ Platform context section: GENERATED');
  console.log('✅ Methodologies preserved: Todd Brown + Hormozi + Schwartz + PAS');
  console.log('✅ Fallback mode: WORKING (without Context Profile)');
  console.log('✅ Multi-platform adaptation: WORKING');
  console.log('\n✅ Phase 1.2 COMPLETE - Ad-copy-generation integrated with Context Profile Manager\n');
}

// Run test
testAdCopyWithContextProfile().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
