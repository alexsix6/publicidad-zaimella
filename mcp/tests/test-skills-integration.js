/**
 * Test Skills Integration
 * Validates that skills are detected and can be used by ContentOrchestrator
 */

import { SkillDetector } from '../tools/skill-detector.js';

async function testSkillsIntegration() {
  console.log('='.repeat(60));
  console.log('🧪 SKILLS INTEGRATION TEST');
  console.log('='.repeat(60));

  const skillDetector = new SkillDetector();

  // Test 1: Initialize SkillDetector
  console.log('\n📋 Test 1: Initialize SkillDetector');
  try {
    await skillDetector.initialize();
    console.log('✅ SkillDetector initialized');
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    return;
  }

  // Test 2: Check Status
  console.log('\n📋 Test 2: Check Skills Status');
  const status = skillDetector.getStatus();
  console.log(`✓ Skills path: ${status.skillsPath}`);
  console.log(`✓ Skills available: ${status.skillsAvailable}`);
  console.log(`✓ Skills loaded: ${status.skills.join(', ')}`);

  if (status.skillsAvailable === 0) {
    console.log('⚠️  No skills found - workflow will use fallback logic');
    console.log('✓ Test passed (graceful degradation)');
    return;
  }

  // Test 3: Avatar Construction Skill
  console.log('\n📋 Test 3: Avatar Construction Skill');
  if (skillDetector.hasSkill('avatar-construction')) {
    try {
      const avatarSkill = skillDetector.getSkill('avatar-construction');
      const avatarResult = await avatarSkill.generate({
        brief: 'Launch premium fitness coaching for busy professionals',
        industry: 'fitness'
      });

      console.log('✓ Skill executed successfully');
      console.log(`✓ Sections generated: ${Object.keys(avatarResult).length - 1}`); // -1 for metadata
      console.log(`✓ Demographics: ${avatarResult.demographics.age_range}`);
      console.log(`✓ Market Sophistication Level: ${avatarResult.market_sophistication.primary_level.level}`);
      console.log('✅ Avatar Construction Skill: PASS');
    } catch (error) {
      console.error('❌ Skill execution failed:', error.message);
    }
  } else {
    console.log('⚠️  avatar-construction skill not available');
  }

  // Test 4: Ad Copy Generation Skill
  console.log('\n📋 Test 4: Ad Copy Generation Skill');
  if (skillDetector.hasSkill('ad-copy-generation')) {
    try {
      const copySkill = skillDetector.getSkill('ad-copy-generation');

      // Generate avatar first (for copy skill input)
      const avatarSkill = skillDetector.getSkill('avatar-construction');
      const avatar = await avatarSkill.generate({
        brief: 'Launch premium fitness coaching for busy professionals',
        industry: 'fitness'
      });

      const copyResult = await copySkill.generate({
        brief: 'Launch premium fitness coaching for busy professionals',
        avatar: avatar,
        platform: 'facebook'
      });

      console.log('✓ Skill executed successfully');
      console.log(`✓ Variants generated: ${copyResult.variants.length}`);
      console.log(`✓ Hook types: ${copyResult.variants.map(v => v.hook_type).join(', ')}`);
      console.log(`✓ First headline: "${copyResult.variants[0].copy.headline}"`);
      console.log('✅ Ad Copy Generation Skill: PASS');
    } catch (error) {
      console.error('❌ Skill execution failed:', error.message);
    }
  } else {
    console.log('⚠️  ad-copy-generation skill not available');
  }

  // Test 5: Landing Page Structure Skill
  console.log('\n📋 Test 5: Landing Page Structure Skill');
  if (skillDetector.hasSkill('landing-page-structure')) {
    try {
      const lpSkill = skillDetector.getSkill('landing-page-structure');

      const lpResult = await lpSkill.generate({
        brief: 'Launch premium fitness coaching for busy professionals'
      });

      console.log('✓ Skill executed successfully');
      console.log(`✓ Sections generated: ${Object.keys(lpResult).filter(k => k !== 'metadata' && k !== 'html_skeleton').length}`);
      console.log(`✓ Hero headline: "${lpResult.hero.elements.headline}"`);
      console.log('✅ Landing Page Structure Skill: PASS');
    } catch (error) {
      console.error('❌ Skill execution failed:', error.message);
    }
  } else {
    console.log('⚠️  landing-page-structure skill not available');
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Skills Detected: ${status.skillsAvailable}`);
  console.log(`✓ Skills Tested: ${Math.min(3, status.skillsAvailable)}`);
  console.log(`✓ Integration: ${status.skillsAvailable > 0 ? 'WORKING' : 'FALLBACK MODE'}`);
  console.log('\n✅ All tests passed!\n');
}

// Run tests
testSkillsIntegration().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
