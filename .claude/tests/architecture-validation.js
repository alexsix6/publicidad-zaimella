/**
 * Architecture Validation Test Suite
 * Validates Phases 1-3 transformations without requiring external services
 *
 * Tests:
 * 1. File structure integrity
 * 2. Method existence and signatures
 * 3. Configuration validity
 * 4. Import/export correctness
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Test Results Tracker
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(test, status, message) {
  const entry = { test, status, message, timestamp: new Date().toISOString() };

  if (status === 'PASS') {
    results.passed.push(entry);
    console.log(`✅ PASS: ${test}`);
  } else if (status === 'FAIL') {
    results.failed.push(entry);
    console.log(`❌ FAIL: ${test} - ${message}`);
  } else if (status === 'WARN') {
    results.warnings.push(entry);
    console.log(`⚠️  WARN: ${test} - ${message}`);
  }
}

// ========================================
// PHASE 1 VALIDATION: Context Profile Integration
// ========================================

async function validatePhase1() {
  console.log('\n🔍 Validating Phase 1: Context Profile Integration...\n');

  // Test 1.1: content-orchestrator.js exists and has Step 0
  try {
    const orchestratorPath = path.join(projectRoot, 'mcp/tools/content-orchestrator.js');
    const orchestratorContent = await fs.readFile(orchestratorPath, 'utf-8');

    // Check for Step 0 implementation
    if (orchestratorContent.includes('STEP 0: Context Profile Resolution')) {
      logTest('Phase 1.1: Step 0 exists', 'PASS', 'Step 0 Context Profile Resolution found');
    } else {
      logTest('Phase 1.1: Step 0 exists', 'FAIL', 'Step 0 not found in content-orchestrator.js');
    }

    // Check for contextProfileManager import
    if (orchestratorContent.includes('contextProfileManager')) {
      logTest('Phase 1.2: contextProfileManager imported', 'PASS', 'contextProfileManager import found');
    } else {
      logTest('Phase 1.2: contextProfileManager imported', 'FAIL', 'contextProfileManager not imported');
    }

    // Check for Digital Twin detection logging
    if (orchestratorContent.includes('Digital Twin mode')) {
      logTest('Phase 1.3: Digital Twin logging', 'PASS', 'Digital Twin mode logging found');
    } else {
      logTest('Phase 1.3: Digital Twin logging', 'WARN', 'Digital Twin logging not found (may be optional)');
    }

    // Check that all 5 skills receive contextProfileId
    const skillMethods = [
      'generateCustomerAvatarProfile',
      'generateUniqueMechanism',
      'generateGrandSlamOffer',
      'generateCopyContent',
      'generateLandingPageStructure'
    ];

    let skillsEnhanced = 0;
    for (const method of skillMethods) {
      // Find method and check if it uses contextProfileId from Step 0
      const methodRegex = new RegExp(`async ${method}[^{]*{[\\s\\S]*?contextProfileResolution`, 'm');
      if (methodRegex.test(orchestratorContent)) {
        skillsEnhanced++;
      }
    }

    if (skillsEnhanced === 5) {
      logTest('Phase 1.4: All 5 skills enhanced', 'PASS', `${skillsEnhanced}/5 skills use contextProfileId`);
    } else if (skillsEnhanced >= 3) {
      logTest('Phase 1.4: All 5 skills enhanced', 'WARN', `Only ${skillsEnhanced}/5 skills use contextProfileId`);
    } else {
      logTest('Phase 1.4: All 5 skills enhanced', 'FAIL', `Only ${skillsEnhanced}/5 skills use contextProfileId`);
    }

    // Check for platformSpecification in ad-copy-generation
    if (orchestratorContent.includes('platformSpecification')) {
      logTest('Phase 1.5: Platform specs passed to ad-copy', 'PASS', 'platformSpecification found');
    } else {
      logTest('Phase 1.5: Platform specs passed to ad-copy', 'FAIL', 'platformSpecification not found');
    }

    // Check for brandGuidelines in landing-page-structure
    if (orchestratorContent.includes('brandGuidelines')) {
      logTest('Phase 1.6: Brand guidelines passed to landing', 'PASS', 'brandGuidelines found');
    } else {
      logTest('Phase 1.6: Brand guidelines passed to landing', 'FAIL', 'brandGuidelines not found');
    }

  } catch (error) {
    logTest('Phase 1: File access', 'FAIL', `Cannot read content-orchestrator.js: ${error.message}`);
  }
}

// ========================================
// PHASE 2 VALIDATION: Generic Niche Handling
// ========================================

async function validatePhase2() {
  console.log('\n🔍 Validating Phase 2: Generic Niche Handling...\n');

  // Test 2.1: niche-manager.js has generic extraction
  try {
    const nicheManagerPath = path.join(projectRoot, 'mcp/tools/niche-manager.js');
    const nicheContent = await fs.readFile(nicheManagerPath, 'utf-8');

    // Check for extractIndustryFromBrief method
    if (nicheContent.includes('extractIndustryFromBrief')) {
      logTest('Phase 2.1: extractIndustryFromBrief exists', 'PASS', 'Generic extraction method found');
    } else {
      logTest('Phase 2.1: extractIndustryFromBrief exists', 'FAIL', 'extractIndustryFromBrief method not found');
    }

    // Check for semantic patterns (healthcare, education, technology, etc.)
    const semanticPatterns = ['healthcare', 'education', 'technology', 'finance', 'legal'];
    let patternsFound = 0;
    for (const pattern of semanticPatterns) {
      if (nicheContent.includes(pattern)) {
        patternsFound++;
      }
    }

    if (patternsFound >= 5) {
      logTest('Phase 2.2: Semantic patterns defined', 'PASS', `${patternsFound}+ semantic patterns found`);
    } else {
      logTest('Phase 2.2: Semantic patterns defined', 'WARN', `Only ${patternsFound} semantic patterns found`);
    }

    // Check for graceful fallback in getNicheInsights
    if (nicheContent.includes('isGeneric') && nicheContent.includes('GRACEFUL FALLBACK')) {
      logTest('Phase 2.3: Graceful fallback in getNicheInsights', 'PASS', 'Graceful fallback implemented');
    } else {
      logTest('Phase 2.3: Graceful fallback in getNicheInsights', 'FAIL', 'Graceful fallback not found');
    }

    // Check that it doesn't throw error for unknown niche
    if (nicheContent.includes('throw new Error') && nicheContent.includes('Niche') && nicheContent.includes('not found')) {
      logTest('Phase 2.4: No error throw for unknown niche', 'FAIL', 'Still throws error for unknown niche');
    } else {
      logTest('Phase 2.4: No error throw for unknown niche', 'PASS', 'No error throw found (graceful)');
    }

  } catch (error) {
    logTest('Phase 2: File access', 'FAIL', `Cannot read niche-manager.js: ${error.message}`);
  }

  // Test 2.5: mcp-config.json has templates (not "supported")
  try {
    const configPath = path.join(projectRoot, 'mcp/config/mcp-config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (config.settings?.niches?.templates) {
      logTest('Phase 2.5: Config uses templates', 'PASS', '"templates" field found in niches config');
    } else if (config.settings?.niches?.supported) {
      logTest('Phase 2.5: Config uses templates', 'WARN', 'Still using "supported" instead of "templates"');
    } else {
      logTest('Phase 2.5: Config uses templates', 'FAIL', 'Neither "templates" nor "supported" found');
    }

    if (config.settings?.niches?.genericSupport) {
      logTest('Phase 2.6: genericSupport flag', 'PASS', 'genericSupport flag present');
    } else {
      logTest('Phase 2.6: genericSupport flag', 'WARN', 'genericSupport flag missing');
    }

  } catch (error) {
    logTest('Phase 2.5-2.6: Config validation', 'FAIL', `Cannot read/parse mcp-config.json: ${error.message}`);
  }
}

// ========================================
// PHASE 3 VALIDATION: Generic Platform Handling
// ========================================

async function validatePhase3() {
  console.log('\n🔍 Validating Phase 3: Generic Platform Handling...\n');

  // Test 3.1: variant-generator.js has generic platform support
  try {
    const variantPath = path.join(projectRoot, 'mcp/tools/variant-generator.js');
    const variantContent = await fs.readFile(variantPath, 'utf-8');

    // Check for getGenericPlatformSpec method
    if (variantContent.includes('getGenericPlatformSpec')) {
      logTest('Phase 3.1: getGenericPlatformSpec exists', 'PASS', 'Generic platform spec method found');
    } else {
      logTest('Phase 3.1: getGenericPlatformSpec exists', 'FAIL', 'getGenericPlatformSpec method not found');
    }

    // Check for graceful fallback in generateVariant
    if (variantContent.includes('GRACEFUL FALLBACK') && variantContent.includes('platform')) {
      logTest('Phase 3.2: Graceful fallback in generateVariant', 'PASS', 'Graceful fallback implemented');
    } else {
      logTest('Phase 3.2: Graceful fallback in generateVariant', 'FAIL', 'Graceful fallback not found');
    }

    // Check that it doesn't throw error for unknown platform
    const throwErrorMatch = variantContent.match(/throw new Error.*Unsupported platform/);
    if (throwErrorMatch) {
      logTest('Phase 3.3: No error throw for unknown platform', 'FAIL', 'Still throws error for unknown platform');
    } else {
      logTest('Phase 3.3: No error throw for unknown platform', 'PASS', 'No error throw found (graceful)');
    }

    // Check isGeneric flag in generic specs
    if (variantContent.includes('isGeneric: true')) {
      logTest('Phase 3.4: isGeneric flag in specs', 'PASS', 'isGeneric flag found');
    } else {
      logTest('Phase 3.4: isGeneric flag in specs', 'WARN', 'isGeneric flag missing');
    }

  } catch (error) {
    logTest('Phase 3.1-3.4: File access', 'FAIL', `Cannot read variant-generator.js: ${error.message}`);
  }

  // Test 3.5: mcp-config.json platforms use templates
  try {
    const configPath = path.join(projectRoot, 'mcp/config/mcp-config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (config.settings?.platforms?.templates) {
      logTest('Phase 3.5: Platform config uses templates', 'PASS', '"templates" field found in platforms config');
    } else if (config.settings?.platforms?.supported) {
      logTest('Phase 3.5: Platform config uses templates', 'WARN', 'Still using "supported" instead of "templates"');
    } else {
      logTest('Phase 3.5: Platform config uses templates', 'FAIL', 'Neither "templates" nor "supported" found');
    }

    if (config.settings?.platforms?.genericSupport) {
      logTest('Phase 3.6: Platform genericSupport flag', 'PASS', 'genericSupport flag present');
    } else {
      logTest('Phase 3.6: Platform genericSupport flag', 'WARN', 'genericSupport flag missing');
    }

  } catch (error) {
    logTest('Phase 3.5-3.6: Config validation', 'FAIL', `Cannot read/parse mcp-config.json: ${error.message}`);
  }

  // Test 3.7: Hardcoded fallback fixed (facebook → instagram or other)
  try {
    const orchestratorPath = path.join(projectRoot, 'mcp/tools/content-orchestrator.js');
    const orchestratorContent = await fs.readFile(orchestratorPath, 'utf-8');

    // Check if facebook is still hardcoded as sole fallback
    const facebookFallbackMatch = orchestratorContent.match(/\|\|\s*['"]facebook['"]/g);
    if (facebookFallbackMatch && facebookFallbackMatch.length > 0) {
      logTest('Phase 3.7: Hardcoded facebook fallback fixed', 'WARN', 'Facebook still used as fallback (check if intended)');
    } else {
      logTest('Phase 3.7: Hardcoded facebook fallback fixed', 'PASS', 'Facebook fallback removed or changed');
    }

  } catch (error) {
    logTest('Phase 3.7: Fallback check', 'FAIL', `Cannot verify fallback: ${error.message}`);
  }
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Architecture Validation Test Suite                      ║');
  console.log('║   MCP Enterprise Transformation - Phases 1-3              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\nStarted: ${new Date().toISOString()}\n`);

  await validatePhase1();
  await validatePhase2();
  await validatePhase3();

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   TEST SUMMARY                                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`✅ PASSED: ${results.passed.length}`);
  console.log(`❌ FAILED: ${results.failed.length}`);
  console.log(`⚠️  WARNINGS: ${results.warnings.length}`);
  console.log(`\nTotal Tests: ${results.passed.length + results.failed.length + results.warnings.length}`);

  if (results.failed.length === 0) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED! ✅');
    console.log('Architecture is valid and ready for Phase 4 (Rename)');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Review before proceeding');
    console.log('\nFailed Tests:');
    results.failed.forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings (review but not blocking):');
    results.warnings.forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  // Return summary for programmatic use
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    allPassed: results.failed.length === 0,
    results: results
  };
}

// Run tests
runAllTests()
  .then(summary => {
    console.log(`\nCompleted: ${new Date().toISOString()}`);
    process.exit(summary.failed.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ TEST SUITE ERROR:', error);
    process.exit(1);
  });
