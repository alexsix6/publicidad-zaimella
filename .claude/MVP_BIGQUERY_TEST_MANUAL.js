/**
 * MVP BIGQUERY INTEGRATION - MANUAL TEST SCRIPT
 * Testing script to validate BigQuery data integration in niche-manager.js
 *
 * Usage:
 * 1. From Claude Desktop: Call analyze_content_context tool with clientId parameter
 * 2. From Node.js: Run this script directly
 *
 * Date: 2025-11-06
 * Phase: 3 - MVP BigQuery Data Integration
 */

import { NicheManager } from '../mcp/tools/niche-manager.js';

async function runTests() {
  console.log('🧪 MVP BIGQUERY INTEGRATION - MANUAL TEST SUITE');
  console.log('='.repeat(70));
  console.log('');

  const nicheManager = new NicheManager();
  await nicheManager.initialize();

  // ========================================
  // TEST 1: WITHOUT BigQuery (Backward Compatible)
  // ========================================
  console.log('📋 TEST 1: Analyze brief WITHOUT BigQuery (backward compatible)');
  console.log('-'.repeat(70));

  const brief1 = "Crema facial anti-edad con retinol y ácido hialurónico. Reduce arrugas en 30 días. Precio $49.99 con envío gratis. Target: mujeres 35-55 años.";

  try {
    const result1 = await nicheManager.analyzeBrief(brief1);

    console.log('✅ Result WITHOUT BigQuery:');
    console.log('   - Niche:', result1.niche);
    console.log('   - Confidence:', result1.confidence);
    console.log('   - Framework seeds:', Object.keys(result1.framework_seeds).join(', '));
    console.log('   - Business intelligence:', result1.framework_seeds.business_intelligence);

    if (result1.framework_seeds.business_intelligence === null) {
      console.log('✅ PASS: business_intelligence is null (expected)');
    } else {
      console.log('❌ FAIL: business_intelligence should be null');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
  }

  console.log('');
  console.log('');

  // ========================================
  // TEST 2: WITH BigQuery (MVP Feature)
  // ========================================
  console.log('📊 TEST 2: Analyze brief WITH BigQuery (MVP feature)');
  console.log('-'.repeat(70));

  const brief2 = "Nueva colección de zapatos deportivos para running. Material premium con tecnología de amortiguación avanzada.";
  const clientId = 'BOUTIQUE_FASHION_001'; // Test client ID

  try {
    const result2 = await nicheManager.analyzeBrief(brief2, clientId);

    console.log('✅ Result WITH BigQuery:');
    console.log('   - Niche:', result2.niche);
    console.log('   - Confidence:', result2.confidence);
    console.log('   - Framework seeds:', Object.keys(result2.framework_seeds).join(', '));

    if (result2.framework_seeds.business_intelligence) {
      console.log('✅ PASS: business_intelligence is present');
      console.log('   - Data source:', result2.framework_seeds.business_intelligence.data_source);
      console.log('   - Has real data:', result2.framework_seeds.business_intelligence.has_real_data);
      console.log('   - Top products count:', result2.framework_seeds.business_intelligence.top_selling_products?.length || 0);
      console.log('   - Demographics:', result2.framework_seeds.business_intelligence.real_customer_demographics ? 'Available' : 'Not found');
      console.log('   - Proven phrases count:', result2.framework_seeds.business_intelligence.proven_copy_phrases?.length || 0);
      console.log('   - Seasonal patterns count:', result2.framework_seeds.business_intelligence.seasonal_patterns?.length || 0);
    } else {
      console.log('⚠️  WARN: business_intelligence is null (BigQuery query failed - graceful degradation)');
      console.log('   This is expected if BigQuery dataset/tables do not exist yet');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
  }

  console.log('');
  console.log('');

  // ========================================
  // TEST 3: ERROR HANDLING (Graceful Degradation)
  // ========================================
  console.log('🛡️  TEST 3: Error handling with invalid client ID');
  console.log('-'.repeat(70));

  const brief3 = "Curso online de marketing digital para emprendedores.";
  const invalidClientId = 'INVALID_CLIENT_999';

  try {
    const result3 = await nicheManager.analyzeBrief(brief3, invalidClientId);

    console.log('✅ Result with invalid client:');
    console.log('   - Niche:', result3.niche);
    console.log('   - Business intelligence:', result3.framework_seeds.business_intelligence);

    if (result3.framework_seeds.business_intelligence === null) {
      console.log('✅ PASS: Graceful degradation working (business_intelligence is null)');
      console.log('   System continues with Phase 2 functionality (framework_seeds only)');
    } else {
      console.log('⚠️  UNEXPECTED: business_intelligence has data for invalid client');
    }
  } catch (error) {
    console.log('❌ FAIL: Should not throw error (graceful degradation failed):', error.message);
  }

  console.log('');
  console.log('');

  // ========================================
  // TEST 4: Custom Dataset Parameter
  // ========================================
  console.log('🗄️  TEST 4: Custom dataset parameter');
  console.log('-'.repeat(70));

  const brief4 = "Servicio de consultoría empresarial para PyMEs.";
  const clientId4 = 'CONSULTING_CLIENT_001';
  const customDataset = 'custom_analytics_db';

  try {
    const result4 = await nicheManager.analyzeBrief(brief4, clientId4, customDataset);

    console.log('✅ Result with custom dataset:');
    console.log('   - Niche:', result4.niche);

    if (result4.framework_seeds.business_intelligence) {
      console.log('✅ PASS: business_intelligence is present');
      console.log('   - Dataset:', result4.framework_seeds.business_intelligence.dataset);

      if (result4.framework_seeds.business_intelligence.dataset === customDataset) {
        console.log('✅ PASS: Custom dataset parameter working');
      } else {
        console.log('❌ FAIL: Dataset does not match (expected:', customDataset, ', got:', result4.framework_seeds.business_intelligence.dataset, ')');
      }
    } else {
      console.log('⚠️  WARN: business_intelligence is null (query failed - graceful degradation)');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
  }

  console.log('');
  console.log('');
  console.log('='.repeat(70));
  console.log('✅ TEST SUITE COMPLETED');
  console.log('');
  console.log('📝 NOTES:');
  console.log('   - If BigQuery queries fail, system gracefully degrades to Phase 2 functionality');
  console.log('   - business_intelligence will be null if BigQuery data is not available');
  console.log('   - This ensures backward compatibility and no breaking changes');
  console.log('');
  console.log('📊 EXPECTED PRODUCTION SETUP:');
  console.log('   1. Create BigQuery dataset: client_analytics (or custom name)');
  console.log('   2. Create tables: sales, customers, campaign_performance');
  console.log('   3. Populate with client business data');
  console.log('   4. Call analyze_content_context with clientId parameter');
  console.log('   5. Content generation will use real business intelligence');
  console.log('');
}

// Run tests
runTests().catch(console.error);
