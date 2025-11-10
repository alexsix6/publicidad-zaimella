/**
 * TEST: Context Coherence Implementation
 * Validates that strategic context flows correctly from copy → images → videos
 */

import { composeSceneWithContext } from '../../lib/context-composer.js';

console.log('========================================');
console.log('TEST: CONTEXT COHERENCE');
console.log('========================================\n');

// Mock data simulating a complete campaign pipeline
const mockNicheContext = {
  niche: 'real_estate',
  sophistication_level: 'Stage 4',
  industry: 'Real Estate - Luxury Apartments'
};

const mockAvatarProfile = {
  demographics: {
    age_range: '35-50 years',
    profession: 'Corporate Executives',
    gender: 'male and female'
  },
  pain_points: [
    'Struggling to find luxury property that matches their success level',
    'Wasting time visiting generic apartments'
  ],
  desires: [
    'Own a prestigious address that reflects their achievements',
    'Enjoy premium lifestyle with exclusive amenities'
  ],
  market_sophistication: 'Stage 4'
};

const mockMechanism = {
  mechanism_variants: [
    {
      name: 'Smart Living Integration System',
      description: 'Proprietary technology that transforms ordinary apartments into intelligent luxury spaces',
      why_different: 'Unlike traditional luxury apartments with separate systems, we integrate everything into one seamless ecosystem',
      big_promise: 'Experience true luxury living where technology anticipates your every need'
    }
  ]
};

const mockOffer = {
  dream_outcome: 'Own a luxury apartment that becomes more valuable while you sleep',
  perceived_likelihood: 'Proven 8-12% annual ROI in premium zone',
  time_delay: 'Move-in ready in 60 days, ROI starts immediately',
  effort_sacrifice: 'Zero renovation needed - turnkey luxury ready',
  value_summary: 'High value (luxury lifestyle + ROI) / Low effort (turnkey ready)'
};

const mockCopyContent = {
  variants: [
    {
      headline: 'La Inversión Que Vivís Todos Los Días',
      hook: '¿Por qué elegir entre lifestyle y ROI cuando podés tener ambos?',
      main_headline: 'Departamentos de Lujo con Smart Living Integration',
      opening_hook: 'Los ejecutivos más inteligentes ya no solo compran propiedades...',
      key_benefits: [
        'ROI 8-12% anual garantizado',
        'Tecnología smart home integrada',
        'Amenities 5 estrellas exclusivos'
      ],
      emotional_triggers: ['exclusivity', 'achievement', 'smart-investment'],
      call_to_action: 'Agendá tu tour virtual personalizado'
    }
  ]
};

const mockBrief = `Lanzar campaña de marketing para departamentos de lujo en zona premium de CMF Inmobiliaria.
Producto: Departamentos exclusivos con vista panorámica, amenities 5 estrellas, tecnología smart home.
Target: Profesionales exitosos 35-50 años, nivel socioeconómico A/B.`;

console.log('📋 TEST SCENARIO:');
console.log('- Niche: Real Estate - Luxury Apartments');
console.log('- Avatar: Corporate Executives 35-50');
console.log('- Mechanism: Smart Living Integration System');
console.log('- Offer: 8-12% ROI + Luxury Lifestyle');
console.log('- Copy: "La Inversión Que Vivís Todos Los Días"\n');

// TEST 1: Compose context for VIDEO
console.log('========================================');
console.log('TEST 1: VIDEO CONTEXT COMPOSITION');
console.log('========================================\n');

const videoContext = composeSceneWithContext({
  nicheContext: mockNicheContext,
  avatarProfile: mockAvatarProfile,
  mechanism: mockMechanism,
  offer: mockOffer,
  copyContent: mockCopyContent,
  brief: mockBrief,
  assetType: 'video',
  options: {
    basePrompt: '',
    videoScript: {
      hook_type: 'mechanism',
      hook_text: '¿Por qué elegir entre lifestyle y ROI cuando podés tener ambos?',
      duration: '8s'
    }
  }
});

console.log('✅ VIDEO CONTEXT COMPOSED:');
console.log(`  - Success: ${videoContext.success}`);
console.log(`  - Asset Type: ${videoContext.assetType}`);
console.log(`  - Unified Context Length: ${videoContext.unifiedContext.length} chars`);
console.log(`  - Strategic Elements: ${Object.keys(videoContext.strategicElements).length} components`);
console.log('\n📦 STRATEGIC ELEMENTS:');
Object.keys(videoContext.strategicElements).forEach(key => {
  console.log(`  ✓ ${key}:`, videoContext.strategicElements[key]);
});

console.log('\n📝 UNIFIED CONTEXT:');
console.log(`  "${videoContext.unifiedContext}"`);

console.log('\n🎬 VIDEO PROMPTS:');
console.log(`  Main: "${videoContext.prompts.main}"`);
if (videoContext.prompts.script) {
  console.log(`  Script: "${videoContext.prompts.script}"`);
}

// Validate video context
const videoTests = [
  { name: 'Has unified context', pass: videoContext.unifiedContext.length > 0 },
  { name: 'Includes mechanism', pass: videoContext.unifiedContext.includes('Smart Living') || videoContext.unifiedContext.includes('Mechanism') },
  { name: 'Includes offer value', pass: videoContext.unifiedContext.includes('ROI') || videoContext.unifiedContext.includes('8-12%') || videoContext.unifiedContext.includes('Outcome') },
  { name: 'Includes copy hook', pass: videoContext.unifiedContext.includes('lifestyle') || videoContext.unifiedContext.includes('Hook') },
  { name: 'Main prompt exists', pass: videoContext.prompts.main.length > 0 },
  { name: 'Video script exists', pass: !!videoContext.prompts.script }
];

console.log('\n🧪 VIDEO VALIDATION:');
videoTests.forEach(test => {
  console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
});

const videoTestsPassed = videoTests.filter(t => t.pass).length;
const videoTestsTotal = videoTests.length;

// TEST 2: Compose context for PRODUCT IMAGE
console.log('\n========================================');
console.log('TEST 2: PRODUCT IMAGE CONTEXT COMPOSITION');
console.log('========================================\n');

const productContext = composeSceneWithContext({
  nicheContext: mockNicheContext,
  avatarProfile: mockAvatarProfile,
  mechanism: mockMechanism,
  offer: mockOffer,
  copyContent: mockCopyContent,
  brief: mockBrief,
  assetType: 'product',
  options: {
    basePrompt: 'Luxury apartment product photography'
  }
});

console.log('✅ PRODUCT CONTEXT COMPOSED:');
console.log(`  - Unified Context: "${productContext.unifiedContext}"`);
console.log(`  - Main Prompt: "${productContext.prompts.main}"`);

// TEST 3: Compose context for AVATAR IMAGE
console.log('\n========================================');
console.log('TEST 3: AVATAR IMAGE CONTEXT COMPOSITION');
console.log('========================================\n');

const avatarContext = composeSceneWithContext({
  nicheContext: mockNicheContext,
  avatarProfile: mockAvatarProfile,
  mechanism: mockMechanism,
  offer: mockOffer,
  copyContent: mockCopyContent,
  brief: mockBrief,
  assetType: 'avatar',
  options: {
    basePrompt: 'Professional corporate executive portrait'
  }
});

console.log('✅ AVATAR CONTEXT COMPOSED:');
console.log(`  - Unified Context: "${avatarContext.unifiedContext}"`);
console.log(`  - Main Prompt: "${avatarContext.prompts.main}"`);

// FINAL VALIDATION: Context Coherence across assets
console.log('\n========================================');
console.log('FINAL VALIDATION: CONTEXT COHERENCE');
console.log('========================================\n');

const coherenceTests = [
  {
    name: 'All assets share same unified context',
    pass: videoContext.unifiedContext === productContext.unifiedContext &&
          productContext.unifiedContext === avatarContext.unifiedContext
  },
  {
    name: 'All assets have strategic elements',
    pass: Object.keys(videoContext.strategicElements).length > 0 &&
          Object.keys(productContext.strategicElements).length > 0 &&
          Object.keys(avatarContext.strategicElements).length > 0
  },
  {
    name: 'Video prompt includes mechanism',
    pass: videoContext.prompts.main.toLowerCase().includes('smart living') ||
          videoContext.prompts.main.toLowerCase().includes('integration') ||
          videoContext.prompts.main.toLowerCase().includes('mechanism')
  },
  {
    name: 'Product prompt includes offer value',
    pass: productContext.prompts.main.toLowerCase().includes('luxury') ||
          productContext.prompts.main.toLowerCase().includes('roi') ||
          productContext.prompts.main.toLowerCase().includes('outcome')
  },
  {
    name: 'Avatar prompt includes demographics',
    pass: avatarContext.prompts.main.toLowerCase().includes('executive') ||
          avatarContext.prompts.main.toLowerCase().includes('35') ||
          avatarContext.prompts.main.toLowerCase().includes('age')
  }
];

console.log('🧪 COHERENCE TESTS:');
coherenceTests.forEach(test => {
  console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
});

const coherenceTestsPassed = coherenceTests.filter(t => t.pass).length;
const coherenceTestsTotal = coherenceTests.length;

// SUMMARY
console.log('\n========================================');
console.log('TEST SUMMARY');
console.log('========================================\n');

const totalPassed = videoTestsPassed + coherenceTestsPassed;
const totalTests = videoTestsTotal + coherenceTestsTotal;

console.log(`📊 RESULTS:`);
console.log(`  Video Tests: ${videoTestsPassed}/${videoTestsTotal} passed`);
console.log(`  Coherence Tests: ${coherenceTestsPassed}/${coherenceTestsTotal} passed`);
console.log(`  TOTAL: ${totalPassed}/${totalTests} passed (${Math.round(totalPassed/totalTests*100)}%)\n`);

if (totalPassed === totalTests) {
  console.log('✅ CONTEXT COHERENCE TEST: PASSED');
  console.log('\n🎉 Context flows correctly from copy → images → videos');
  console.log('   Strategic elements unified across all assets\n');
  process.exit(0);
} else {
  console.log('❌ CONTEXT COHERENCE TEST: FAILED');
  console.log(`\n   ${totalTests - totalPassed} test(s) failed\n`);
  process.exit(1);
}
