import { generateImageWithFlux } from './lib/replicate-client.js';

async function testRealConnections() {
  console.log('🔌 TESTING REAL API CONNECTIONS...\n');
  
  // Test solo si las API keys están configuradas
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log('❌ REPLICATE_API_TOKEN not set. Skipping real tests.');
    return;
  }
  
  console.log('1️⃣ Testing Replicate with simple prompt...');
  try {
    const result = await generateImageWithFlux('A simple red circle');
    if (result.success) {
      console.log('✅ Replicate connection working!');
      console.log('Image URL:', result.imageUrl);
    } else {
      console.log('❌ Replicate error:', result.error);
    }
  } catch (error) {
    console.log('❌ Replicate connection failed:', error.message);
  }
  
  // Test Veo3 solo si Replicate funciona
  if (!process.env.FAL_KEY) {
    console.log('❌ FAL_KEY not set. Skipping Veo3 test.');
    return;
  }
  
  console.log('\n2️⃣ Testing Veo3 connection...');
  // Nota: Este test puede tomar varios minutos
  console.log('⏱️ Note: Veo3 test may take several minutes...');
}

// Solo ejecutar si se llama directamente
if (import.meta.url.endsWith('test-api-connections.js')) {
  testRealConnections().catch(console.error);
} 