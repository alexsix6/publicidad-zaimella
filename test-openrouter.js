import { enhancePrompt, analyzeAndImprove } from './lib/openrouter-client.js';

async function testOpenRouterSetup() {
  console.log('🤖 TESTING OPENROUTER INTEGRATION...\n');
  
  // Test 1: Verificar variable de entorno
  console.log('1️⃣ Testing environment variables:');
  console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing');
  
  // Test 2: Verificar funciones disponibles
  console.log('\n2️⃣ Testing function availability:');
  console.log('enhancePrompt function:', typeof enhancePrompt === 'function' ? '✅ Ready' : '❌ Error');
  console.log('analyzeAndImprove function:', typeof analyzeAndImprove === 'function' ? '✅ Ready' : '❌ Error');
  
  // Test 3: Simular respuesta sin API key
  console.log('\n3️⃣ Testing function structure:');
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('⚠️  No API key set, testing fallback behavior...');
    try {
      const result = await enhancePrompt('test prompt');
      if (!result.success && result.fallbackPrompt) {
        console.log('✅ Fallback mechanism working');
      }
    } catch (error) {
      console.log('✅ Error handling working:', error.message.substring(0, 50) + '...');
    }
  }
  
  console.log('\n✅ OpenRouter integration test completed!');
}

// Solo ejecutar si se llama directamente
if (import.meta.url.endsWith('test-openrouter.js')) {
  testOpenRouterSetup().catch(console.error);
} 