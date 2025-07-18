import { generateImageWithFlux } from './lib/replicate-client.js';
import { generateVideoWithVeo3 } from './lib/veo-client.js';
import { generateFileName, enhancePromptForVideo } from './lib/utils.js';

async function testBasicSetup() {
  console.log('🧪 TESTING BASIC SETUP...\n');
  
  // Test 1: Verificar variables de entorno
  console.log('1️⃣ Testing environment variables:');
  console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('FAL_KEY:', process.env.FAL_KEY ? '✅ Set' : '❌ Missing');
  
  // Test 2: Verificar funciones utilitarias
  console.log('\n2️⃣ Testing utility functions:');
  const testFileName = generateFileName('test', 'png');
  console.log('Generate filename:', testFileName);
  
  const enhancedPrompt = enhancePromptForVideo('A cat sitting', 'cinematic');
  console.log('Enhanced prompt:', enhancedPrompt);
  
  // Test 3: Test básico de conexión Replicate (sin generar imagen real)
  console.log('\n3️⃣ Testing Replicate connection:');
  try {
    // Solo verificamos que la función se pueda llamar
    console.log('Replicate client function:', typeof generateImageWithFlux === 'function' ? '✅ Ready' : '❌ Error');
  } catch (error) {
    console.log('❌ Replicate setup error:', error.message);
  }
  
  // Test 4: Test básico de conexión Veo3
  console.log('\n4️⃣ Testing Veo3 connection:');
  try {
    console.log('Veo3 client function:', typeof generateVideoWithVeo3 === 'function' ? '✅ Ready' : '❌ Error');
  } catch (error) {
    console.log('❌ Veo3 setup error:', error.message);
  }
  
  console.log('\n✅ Basic setup test completed!');
}

// Ejecutar test
testBasicSetup().catch(console.error); 