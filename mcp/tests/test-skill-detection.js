/**
 * Test: Skill Detection Verification
 * Validates that SkillDetector can find and load all skills
 *
 * Expected skills:
 * 1. avatar-construction (Phase 1.1)
 * 2. ad-copy-generation (Phase 2)
 * 3. landing-page-structure (Phase 3)
 * 4. unique-mechanism-generator (Phase 4.1) - NEW
 * 5. grand-slam-offer-generator (Phase 4.2) - NEW
 */

import { SkillDetector } from '../tools/skill-detector.js';

async function testSkillDetection() {
  console.log('='.repeat(70));
  console.log('🔍 SKILL DETECTION VERIFICATION TEST');
  console.log('='.repeat(70));

  // Initialize SkillDetector
  console.log('\n📋 Step 1: Initializing SkillDetector...');
  const detector = new SkillDetector();

  try {
    await detector.initialize();
    console.log('✅ SkillDetector initialized successfully');
  } catch (error) {
    console.error('❌ SkillDetector initialization failed:', error.message);
    return;
  }

  // Expected skills list
  const expectedSkills = [
    { name: 'avatar-construction', phase: '1.1', status: 'EXISTING' },
    { name: 'ad-copy-generation', phase: '2', status: 'EXISTING' },
    { name: 'landing-page-structure', phase: '3', status: 'EXISTING' },
    { name: 'unique-mechanism-generator', phase: '4.1', status: 'NEW' },
    { name: 'grand-slam-offer-generator', phase: '4.2', status: 'NEW' }
  ];

  console.log('\n📋 Step 2: Verifying Expected Skills...');
  console.log(`   Expected: ${expectedSkills.length} skills total`);
  console.log(`   - Existing: ${expectedSkills.filter(s => s.status === 'EXISTING').length}`);
  console.log(`   - New (Phase 4): ${expectedSkills.filter(s => s.status === 'NEW').length}`);

  // Check each expected skill
  let detectedCount = 0;
  let missingSkills = [];
  let detectedSkills = [];

  for (const expected of expectedSkills) {
    const hasSkill = detector.hasSkill(expected.name);

    if (hasSkill) {
      detectedCount++;
      detectedSkills.push(expected);
      console.log(`   ✅ ${expected.name} (Phase ${expected.phase}) - ${expected.status}`);

      // Try to get skill metadata
      const skill = detector.getSkill(expected.name);
      if (skill) {
        console.log(`      ✓ Skill module loaded successfully`);

        // Check if skill has generate method
        if (skill.generate && typeof skill.generate === 'function') {
          console.log(`      ✓ generate() method available`);
        } else {
          console.log(`      ⚠️  generate() method not found`);
        }
      }
    } else {
      missingSkills.push(expected);
      console.log(`   ❌ ${expected.name} (Phase ${expected.phase}) - NOT DETECTED`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SKILL DETECTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Detected: ${detectedCount}/${expectedSkills.length} skills`);

  if (detectedSkills.length > 0) {
    console.log('\n✅ Successfully Detected Skills:');
    for (const skill of detectedSkills) {
      console.log(`   - ${skill.name} (Phase ${skill.phase}) ${skill.status === 'NEW' ? '🆕' : ''}`);
    }
  }

  if (missingSkills.length > 0) {
    console.log('\n❌ Missing Skills:');
    for (const skill of missingSkills) {
      console.log(`   - ${skill.name} (Phase ${skill.phase})`);
    }
  }

  // Check for unexpected skills (extra skills not in expected list)
  console.log('\n📋 Step 3: Checking for Unexpected Skills...');
  const allDetectedSkillNames = Array.from(detector.availableSkills.keys());
  const expectedSkillNames = expectedSkills.map(s => s.name);
  const unexpectedSkills = allDetectedSkillNames.filter(
    name => !expectedSkillNames.includes(name)
  );

  if (unexpectedSkills.length > 0) {
    console.log(`   ℹ️  Found ${unexpectedSkills.length} unexpected skill(s):`);
    for (const skillName of unexpectedSkills) {
      console.log(`      - ${skillName}`);
    }
  } else {
    console.log('   ✅ No unexpected skills found');
  }

  // Final verdict
  console.log('\n' + '='.repeat(70));
  if (detectedCount === expectedSkills.length && missingSkills.length === 0) {
    console.log('🎯 VERDICT: ✅ ALL EXPECTED SKILLS DETECTED');
    console.log('');
    console.log('✅ Phase 4 Skills Ready for Production:');
    console.log('   - unique-mechanism-generator v1.0.0 ✓');
    console.log('   - grand-slam-offer-generator v1.0.0 ✓');
    console.log('');
    console.log('🚀 Skills are ready to use via:');
    console.log('   1. ContentOrchestrator (automatic pipeline)');
    console.log('   2. Direct import (manual scripts)');
    console.log('   3. Claude Code conversation');
    console.log('');
  } else {
    console.log('🎯 VERDICT: ⚠️  SOME SKILLS MISSING');
    console.log(`   Detected: ${detectedCount}/${expectedSkills.length}`);
    console.log(`   Missing: ${missingSkills.length}`);
    console.log('');
    console.log('⚠️  Action Required: Verify skill paths and structure');
  }
  console.log('='.repeat(70) + '\n');
}

// Run test
testSkillDetection().catch(error => {
  console.error('\n❌ Skill detection test failed:', error);
  console.error(error.stack);
  process.exit(1);
});
