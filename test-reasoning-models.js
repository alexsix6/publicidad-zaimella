// 🧠 Test de Modelos Razonadores y Validación de Checkboxes
// Valida que: 1) Los modelos funcionan, 2) Los checkboxes son respetados, 3) El límite de 500 chars se respeta

import { enhancePrompt, analyzeAndImprove, REASONING_MODELS } from './lib/openrouter-client.js';

const testPrompts = {
  image: "A beautiful sunset over a mountain lake",
  video: "A cat walking through a garden with flowers"
};

async function testReasoningModels() {
  console.log('🧠 TESTING REASONING MODELS FOR AI CONTENT GENERATION\n');
  
  // 📊 MOSTRAR MODELOS DISPONIBLES
  console.log('📋 Available Reasoning Models:');
  Object.entries(REASONING_MODELS).forEach(([model, info]) => {
    console.log(`  ${info.reasoning ? '🧠' : '🤖'} ${model}`);
    console.log(`     └─ ${info.name} (${info.cost} cost)`);
  });
  console.log('');

  // 🧪 PRUEBA 1: ENHANCEMENT HABILITADO
  console.log('🧪 TEST 1: Enhancement ENABLED');
  console.log('='.repeat(50));
  
  for (const [modelKey, modelInfo] of Object.entries(REASONING_MODELS)) {
    try {
      console.log(`\n🧠 Testing ${modelInfo.name} (${modelInfo.cost})...`);
      
      // Test imagen
      const imageResult = await enhancePrompt(
        testPrompts.image, 
        'image', 
        modelKey, 
        true // ✅ Enhancement ENABLED
      );
      
      if (imageResult.success && imageResult.enhanced) {
        console.log(`  ✅ Image: ${imageResult.promptLength} chars`);
        console.log(`     Original: "${imageResult.originalPrompt}"`);
        console.log(`     Enhanced: "${imageResult.enhancedPrompt.substring(0, 100)}..."`);
      } else {
        console.log(`  ❌ Image failed: ${imageResult.error}`);
      }
      
      // Test video (CRÍTICO: límite 500 chars)
      const videoResult = await enhancePrompt(
        testPrompts.video, 
        'video', 
        modelKey, 
        true // ✅ Enhancement ENABLED
      );
      
      if (videoResult.success && videoResult.enhanced) {
        const withinLimit = videoResult.promptLength <= 500;
        console.log(`  ${withinLimit ? '✅' : '⚠️'} Video: ${videoResult.promptLength} chars ${withinLimit ? '(OK)' : '(TOO LONG!)'}`);
        console.log(`     Enhanced: "${videoResult.enhancedPrompt}"`);
        
        if (videoResult.warning) {
          console.log(`     ⚠️ Warning: ${videoResult.warning}`);
        }
      } else {
        console.log(`  ❌ Video failed: ${videoResult.error}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Model ${modelKey} failed: ${error.message}`);
    }
  }

  // 🧪 PRUEBA 2: ENHANCEMENT DESHABILITADO (CHECKBOX UNCHECKED)
  console.log('\n\n🧪 TEST 2: Enhancement DISABLED (Checkbox unchecked)');
  console.log('='.repeat(50));
  
  const disabledResult = await enhancePrompt(
    testPrompts.image, 
    'image', 
    'deepseek/deepseek-r1', 
    false // ❌ Enhancement DISABLED
  );
  
  if (disabledResult.success && !disabledResult.enhanced) {
    console.log(`✅ Checkbox respected - returned original prompt`);
    console.log(`   Original: "${disabledResult.originalPrompt}"`);
    console.log(`   Enhanced: "${disabledResult.enhancedPrompt}"`);
    console.log(`   Are equal: ${disabledResult.originalPrompt === disabledResult.enhancedPrompt}`);
  } else {
    console.log(`❌ Checkbox NOT respected - enhancement still applied!`);
  }

  // 🧪 PRUEBA 3: ANÁLISIS DE PROMPTS
  console.log('\n\n🧪 TEST 3: Prompt Analysis');
  console.log('='.repeat(50));
  
  const analysisResult = await analyzeAndImprove(
    testPrompts.image, 
    'creative', 
    'deepseek/deepseek-r1'
  );
  
  if (analysisResult.success) {
    console.log(`✅ Analysis successful with ${analysisResult.modelInfo?.name}`);
    console.log(`📊 Analysis: ${analysisResult.analysis.substring(0, 200)}...`);
  } else {
    console.log(`❌ Analysis failed: ${analysisResult.error}`);
  }

  // 🧪 PRUEBA 4: VALIDACIÓN CRÍTICA DE LÍMITES
  console.log('\n\n🧪 TEST 4: Critical Limit Validation (500 chars for Veo 3)');
  console.log('='.repeat(50));
  
  const longPrompt = "A very detailed and extremely long prompt that describes a complex scene with multiple elements, characters, actions, camera movements, lighting conditions, and various other detailed specifications that might exceed the 500 character limit imposed by Veo 3 video generation model which requires careful handling and truncation to ensure compatibility with the API limitations and prevent errors during video generation process.";
  
  console.log(`📏 Long prompt length: ${longPrompt.length} chars`);
  
  const limitResult = await enhancePrompt(
    longPrompt, 
    'video', 
    'deepseek/deepseek-r1', 
    true
  );
  
  if (limitResult.success) {
    console.log(`✅ Limit handling: ${limitResult.promptLength} chars`);
    console.log(`🎯 Within limits: ${limitResult.withinLimits}`);
    if (limitResult.warning) {
      console.log(`⚠️ Warning: ${limitResult.warning}`);
    }
    console.log(`📝 Final prompt: "${limitResult.enhancedPrompt}"`);
  } else {
    console.log(`❌ Limit test failed: ${limitResult.error}`);
  }

  console.log('\n🏁 Testing completed!');
}

// 🚀 EJECUTAR PRUEBAS
if (process.env.OPENROUTER_API_KEY) {
  testReasoningModels().catch(console.error);
} else {
  console.log('❌ OPENROUTER_API_KEY not found in environment variables');
  console.log('💡 Set it in your .env file to run these tests');
  console.log('📝 Example: OPENROUTER_API_KEY=sk-or-...');
} 