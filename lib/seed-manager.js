// lib/seed-manager.js - Consistent Seed Generation for Digital Twins
// 🎯 Generates deterministic seeds for Digital Twin consistency

/**
 * Generates consistent seed for Digital Twin profiles
 * @param {string} contextProfileId - The context profile ID  
 * @param {boolean} isDigitalTwin - Whether this is a Digital Twin profile
 * @param {string} promptHash - Optional hash of the prompt for variation
 * @returns {number} Consistent seed for the given profile
 */
export function generateConsistentSeed(contextProfileId, isDigitalTwin, promptHash = '') {
  if (isDigitalTwin && contextProfileId) {
    // Create deterministic seed based on profile ID + prompt hash
    const combinedString = contextProfileId + promptHash;
    
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Ensure positive number within 1M range
    const seed = Math.abs(hash % 1000000);
    
    //console.log(`🎯 Digital Twin seed generated: ${seed} (from ${contextProfileId})`);
    return seed;
  }
  
  // Random seed for normal prompts
  const randomSeed = Math.floor(Math.random() * 1000000);
  //console.log(`🎲 Random seed generated: ${randomSeed}`);
  return randomSeed;
}

/**
 * Generates multiple seeds for batch generation
 * @param {string} contextProfileId - The context profile ID
 * @param {boolean} isDigitalTwin - Whether this is a Digital Twin profile
 * @param {number} count - Number of seeds to generate (default: 3)
 * @returns {number[]} Array of seeds for batch generation
 */
export function generateSeedBatch(contextProfileId, isDigitalTwin, count = 3) {
  if (!isDigitalTwin) {
    // Random seeds for normal prompts
    return Array.from({ length: count }, () => Math.floor(Math.random() * 1000000));
  }
  
  // Consistent seeds with small variations for Digital Twins
  const baseSeed = generateConsistentSeed(contextProfileId, isDigitalTwin);
  const seeds = [];
  
  for (let i = 0; i < count; i++) {
    // Small incremental variations while maintaining base consistency
    seeds.push(baseSeed + i);
  }
  
  //console.log(`🎯 Digital Twin seed batch: [${seeds.join(', ')}]`);
  return seeds;
}

/**
 * Simple hash function for prompt content
 * @param {string} prompt - The prompt to hash
 * @returns {string} Hash of the prompt
 */
export function hashPrompt(prompt) {
  if (!prompt) return '';
  
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}