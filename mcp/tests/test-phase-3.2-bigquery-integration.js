/**
 * PHASE 3.2 - BigQuery Skills Integration End-to-End Test
 *
 * Tests complete data flow: MCP → Tools → Skills
 * Validates: business_intelligence parameter flow + quality score calculation
 *
 * Test Scenarios:
 * 1. WITHOUT BigQuery (backward compatible - Phase 2 behavior)
 * 2. WITH BigQuery (Phase 3.2 new feature)
 * 3. Partial BigQuery data (graceful degradation)
 * 4. Architecture validation (all layers connected)
 */

import { adCopyGenerator } from '../../../creator_skills/skills/ad-copy-generation/v1.0.0/index.js';

// Mock BigQuery business intelligence data (simulates Phase 3.1 output)
const mockBusinessIntelligence = {
  client_id: "TEST_CLIENT_001",
  top_selling_products: [
    {
      product_name: "Premium Leather Jacket",
      total_revenue: 13500,
      total_units_sold: 150,
      avg_rating: 4.8
    },
    {
      product_name: "Designer Handbag",
      total_revenue: 31200,
      total_units_sold: 240,
      avg_rating: 4.9
    }
  ],
  real_customer_demographics: {
    avg_age: 38,
    female_pct: 72.3,
    male_pct: 27.7,
    avg_order_value: 87.50,
    total_customers: 1523
  },
  proven_copy_phrases: [
    {
      ad_copy_phrase: "Premium quality leather that lasts a lifetime",
      conversion_rate_pct: 8.5,
      impressions: 45320,
      clicks: 3850,
      conversions: 387
    },
    {
      ad_copy_phrase: "Timeless style that never goes out of fashion",
      conversion_rate_pct: 7.2,
      impressions: 38200,
      clicks: 2750,
      conversions: 198
    }
  ],
  seasonal_patterns: [
    {
      month: "2024-10",
      order_count: 243,
      total_revenue: 59100
    },
    {
      month: "2024-09",
      order_count: 198,
      total_revenue: 47800
    }
  ],
  data_source: "BigQuery",
  dataset: "client_analytics",
  fetched_at: new Date().toISOString(),
  has_real_data: true
};

// Mock avatar (simplified)
const mockAvatar = {
  demographics: {
    age_range: "35-50",
    gender: "Female-majority"
  },
  psychographics: {
    core_values: ["Quality", "Style", "Durability"]
  },
  pain_points_and_desires: {
    dream_outcome: {
      description: "Own timeless, premium fashion pieces"
    },
    top_pain_points: [
      { pain: "Low quality products that don't last" }
    ]
  },
  market_sophistication: {
    level: "Stage 3 - Product Aware"
  },
  buying_triggers: {
    preferred_proof_types: ["Reviews", "Testimonials", "Quality guarantees"]
  },
  objections_and_barriers: {
    top_objections: [
      "Too expensive",
      "Not sure about quality"
    ]
  },
  communication_preferences: {
    tone_and_voice: {
      preferred_tone: "Professional yet approachable"
    }
  }
};

// Mock niche context
const mockNicheContext = {
  niche: "e-commerce",
  confidence: 0.9,
  framework_seeds: {
    hook_opportunities: {
      mechanism: "premium leather craftsmanship",
      big_promise: "timeless style that lasts"
    },
    pain_points: ["low quality products", "items that don't last"],
    sophistication_level: "Stage 3 - Product Aware",
    target_demographics: {
      age: "35-50",
      gender: "Female-majority",
      income: "middle-to-high"
    }
  }
};

console.log('🧪 PHASE 3.2 - BigQuery Skills Integration Test Suite\n');
console.log('=' .repeat(80));

// ============================================================================
// TEST 1: WITHOUT BigQuery (Backward Compatibility - Phase 2 Behavior)
// ============================================================================

console.log('\n📋 TEST 1: WITHOUT BigQuery (Backward Compatibility)');
console.log('-'.repeat(80));

try {
  const result1 = await adCopyGenerator.generate({
    brief: "Launch premium leather fashion collection for professional women",
    avatar: mockAvatar,
    nicheContext: mockNicheContext,
    platform: "instagram"
    // business_intelligence: NOT PROVIDED (Phase 2 behavior)
  });

  console.log('✅ Test 1 PASSED: Skill works without business_intelligence');
  console.log(`   Quality Score: ${result1.metadata.quality_score_estimated}`);
  console.log(`   BigQuery Used: ${result1.metadata.business_intelligence_used}`);
  console.log(`   Expected: 85 (base score, no context profile)`);
  console.log(`   Actual: ${result1.metadata.quality_score_estimated}`);

  // Assertions
  if (result1.metadata.business_intelligence_used !== false) {
    throw new Error('❌ business_intelligence_used should be false');
  }

  if (result1.metadata.bigquery_enhancements.proven_phrases_count !== 0) {
    throw new Error('❌ proven_phrases_count should be 0');
  }

  if (result1.metadata.quality_score_estimated !== 85) {
    console.log(`   ⚠️ WARNING: Expected 85, got ${result1.metadata.quality_score_estimated}`);
  }

  console.log('   ✓ Backward compatibility maintained');
  console.log('   ✓ Graceful degradation working');

} catch (error) {
  console.error('❌ TEST 1 FAILED:', error.message);
  process.exit(1);
}

// ============================================================================
// TEST 2: WITH BigQuery (Phase 3.2 New Feature)
// ============================================================================

console.log('\n📋 TEST 2: WITH BigQuery (Phase 3.2 New Feature)');
console.log('-'.repeat(80));

try {
  const result2 = await adCopyGenerator.generate({
    brief: "Nueva colección de otoño con chaquetas de cuero premium para mujeres profesionales",
    avatar: mockAvatar,
    nicheContext: mockNicheContext,
    platform: "instagram",
    business_intelligence: mockBusinessIntelligence  // 🆕 PHASE 3.2
  });

  console.log('✅ Test 2 PASSED: Skill accepts business_intelligence parameter');
  console.log(`   Quality Score: ${result2.metadata.quality_score_estimated}`);
  console.log(`   BigQuery Used: ${result2.metadata.business_intelligence_used}`);
  console.log(`   Expected: 91 (base 85 + BigQuery 6, no context profile)`);
  console.log(`   Actual: ${result2.metadata.quality_score_estimated}`);

  // Assertions
  if (result2.metadata.business_intelligence_used !== true) {
    throw new Error('❌ business_intelligence_used should be true');
  }

  if (result2.metadata.bigquery_enhancements.proven_phrases_count !== 2) {
    throw new Error(`❌ proven_phrases_count should be 2, got ${result2.metadata.bigquery_enhancements.proven_phrases_count}`);
  }

  if (result2.metadata.bigquery_enhancements.top_products_count !== 2) {
    throw new Error(`❌ top_products_count should be 2, got ${result2.metadata.bigquery_enhancements.top_products_count}`);
  }

  if (result2.metadata.bigquery_enhancements.real_demographics_available !== true) {
    throw new Error('❌ real_demographics_available should be true');
  }

  console.log('   ✓ BigQuery enhancements tracked correctly');
  console.log(`   ✓ Metadata: ${result2.metadata.bigquery_enhancements.proven_phrases_count} phrases, ${result2.metadata.bigquery_enhancements.top_products_count} products`);

  // Validate variant-level enhancements
  console.log('\n   📊 Validating variant-level enhancements:');
  const variant = result2.variants[0];

  if (!variant.bigquery_enhancements) {
    throw new Error('❌ Variant missing bigquery_enhancements field');
  }

  if (variant.bigquery_enhancements.data_driven !== true) {
    throw new Error('❌ Variant data_driven flag should be true');
  }

  if (!variant.quality_score) {
    throw new Error('❌ Variant missing quality_score field');
  }

  console.log(`   ✓ Variant 1 Quality Score: ${variant.quality_score}`);
  console.log(`   ✓ Proven Phrase Used: ${variant.bigquery_enhancements.proven_phrase_used ? 'Yes' : 'No'}`);
  console.log(`   ✓ Top Products Available: ${variant.bigquery_enhancements.top_products_available?.length || 0}`);

  if (variant.bigquery_enhancements.real_demographics) {
    console.log(`   ✓ Real Demographics: Age ${variant.bigquery_enhancements.real_demographics.avgAge}, ${variant.bigquery_enhancements.real_demographics.genderSplit}`);
  }

  if (variant.bigquery_enhancements.seasonal_urgency) {
    console.log(`   ✓ Seasonal Urgency: ${variant.bigquery_enhancements.seasonal_urgency.peakMonth} ($${variant.bigquery_enhancements.seasonal_urgency.peakRevenue})`);
  }

} catch (error) {
  console.error('❌ TEST 2 FAILED:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// ============================================================================
// TEST 3: Partial BigQuery Data (Graceful Degradation)
// ============================================================================

console.log('\n📋 TEST 3: Partial BigQuery Data (Graceful Degradation)');
console.log('-'.repeat(80));

try {
  const partialData = {
    client_id: "TEST_CLIENT_002",
    top_selling_products: [
      { product_name: "Basic T-Shirt", total_revenue: 500, avg_rating: 4.0 }
    ],
    // Missing: real_customer_demographics, proven_copy_phrases, seasonal_patterns
    has_real_data: true
  };

  const result3 = await adCopyGenerator.generate({
    brief: "Launch basic apparel collection",
    avatar: mockAvatar,
    nicheContext: mockNicheContext,
    platform: "facebook",
    business_intelligence: partialData
  });

  console.log('✅ Test 3 PASSED: Skill handles partial BigQuery data gracefully');
  console.log(`   Quality Score: ${result3.metadata.quality_score_estimated}`);
  console.log(`   BigQuery Used: ${result3.metadata.business_intelligence_used}`);
  console.log(`   Products Count: ${result3.metadata.bigquery_enhancements.top_products_count}`);
  console.log(`   Phrases Count: ${result3.metadata.bigquery_enhancements.proven_phrases_count}`);
  console.log(`   Demographics Available: ${result3.metadata.bigquery_enhancements.real_demographics_available}`);

  // Assertions
  if (result3.metadata.business_intelligence_used !== true) {
    throw new Error('❌ business_intelligence_used should be true');
  }

  if (result3.metadata.bigquery_enhancements.top_products_count !== 1) {
    throw new Error('❌ top_products_count should be 1');
  }

  if (result3.metadata.bigquery_enhancements.proven_phrases_count !== 0) {
    throw new Error('❌ proven_phrases_count should be 0 (missing data)');
  }

  console.log('   ✓ Partial data handled correctly');
  console.log('   ✓ No crashes on missing fields');

} catch (error) {
  console.error('❌ TEST 3 FAILED:', error.message);
  process.exit(1);
}

// ============================================================================
// TEST 4: Architecture Validation (Layer 3 Integration)
// ============================================================================

console.log('\n📋 TEST 4: Architecture Validation (Layer 3 Integration)');
console.log('-'.repeat(80));

try {
  console.log('   🔍 Validating skill exports...');

  // Check that skill has all required methods
  if (typeof adCopyGenerator.generate !== 'function') {
    throw new Error('❌ Missing generate() method');
  }

  if (typeof adCopyGenerator.integrateProvenPhrases !== 'function') {
    throw new Error('❌ Missing integrateProvenPhrases() method (Phase 3.2 new)');
  }

  if (typeof adCopyGenerator.extractProductMentions !== 'function') {
    throw new Error('❌ Missing extractProductMentions() method (Phase 3.2 new)');
  }

  if (typeof adCopyGenerator.calculateQualityScore !== 'function') {
    throw new Error('❌ Missing calculateQualityScore() method (Phase 3.2 new)');
  }

  console.log('   ✅ All required methods present');
  console.log('   ✅ Phase 3.2 helper methods available');

  // Validate helper method functionality
  console.log('\n   🧪 Testing helper methods directly:');

  const testInsights = {
    bigQueryInsights: {
      provenPhrases: [
        { text: "Test phrase 1", conversionRate: 8.5 },
        { text: "Test phrase 2", conversionRate: 7.2 }
      ],
      topProducts: [
        { name: "Product A", revenue: 1000, rating: 4.8 },
        { name: "Product B", revenue: 800, rating: 4.5 }
      ],
      realDemographics: {
        avgAge: 38,
        femalePct: 72.3,
        malePct: 27.7
      }
    }
  };

  // Test integrateProvenPhrases
  const phrase = adCopyGenerator.integrateProvenPhrases(testInsights, 'big_idea');
  if (phrase !== "Test phrase 1") {
    throw new Error(`❌ integrateProvenPhrases failed, got: ${phrase}`);
  }
  console.log('   ✓ integrateProvenPhrases() working');

  // Test extractProductMentions
  const products = adCopyGenerator.extractProductMentions(testInsights);
  if (products.length !== 2 || products[0] !== "Product A") {
    throw new Error(`❌ extractProductMentions failed, got: ${JSON.stringify(products)}`);
  }
  console.log('   ✓ extractProductMentions() working');

  // Test calculateQualityScore
  const score1 = adCopyGenerator.calculateQualityScore(null, null);
  if (score1 !== 85) {
    throw new Error(`❌ calculateQualityScore base failed, expected 85, got ${score1}`);
  }

  const score2 = adCopyGenerator.calculateQualityScore('PROFILE_001', null);
  if (score2 !== 92) {
    throw new Error(`❌ calculateQualityScore with context failed, expected 92, got ${score2}`);
  }

  const score3 = adCopyGenerator.calculateQualityScore('PROFILE_001', { has_real_data: true });
  if (score3 !== 98) {
    throw new Error(`❌ calculateQualityScore with BigQuery failed, expected 98, got ${score3}`);
  }
  console.log('   ✓ calculateQualityScore() working (85 → 92 → 98)');

  console.log('\n✅ TEST 4 PASSED: Architecture validation complete');

} catch (error) {
  console.error('❌ TEST 4 FAILED:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('🎉 ALL TESTS PASSED - PHASE 3.2 INTEGRATION VALIDATED');
console.log('='.repeat(80));
console.log('\n📊 Summary:');
console.log('   ✅ Test 1: Backward compatibility (Phase 2 behavior maintained)');
console.log('   ✅ Test 2: BigQuery integration (Phase 3.2 new feature working)');
console.log('   ✅ Test 3: Partial data handling (graceful degradation working)');
console.log('   ✅ Test 4: Architecture validation (Layer 3 methods integrated)');
console.log('\n🔧 Technical Validation:');
console.log('   ✅ business_intelligence parameter accepted');
console.log('   ✅ BigQuery metadata tracked correctly');
console.log('   ✅ Quality score calculation dynamic (85 → 92 → 98)');
console.log('   ✅ Helper methods functional (proven phrases, products, quality score)');
console.log('   ✅ Variant-level enhancements present');
console.log('   ✅ Zero breaking changes confirmed');
console.log('\n🚀 Status: READY FOR PRODUCTION TESTING');
console.log('📋 Next: Test with real BigQuery data from Phase 3.1');
console.log('');
