/**
 * Prompt Sanitizer - Content Safety for AI Generation
 * Sanitizes sensitive medical terms to brand-safe alternatives
 * Preserves semantic meaning while avoiding content filters
 */

// 🎯 SAFE TOKENS DICTIONARY - Prudential Specific
export const SAFE_TOKENS = {
  // Medical terms → Professional care terms
  'diaper': 'paquete de cuidado personal',
  'diapers': 'paquetes de cuidado personal',
  'diaper package': 'paquete de cuidado personal',
  'diaper packages': 'paquetes de cuidado personal',
  
  // Medical conditions → Professional care
  'incontinence': 'cuidado y protección',
  'incontinent': 'cuidado personal',
  'adult incontinence': 'cuidado y protección integral',
  'incontinencia': 'cuidado y protección',
  'incontinencia adulta': 'cuidado y protección integral',
  
  // Product specific terms
  'absorbency': 'capacidad de protección',
  'leakage': 'filtración',
  'wetness': 'humedad'
};

// 🛡️ SANITIZE FUNCTION - Multi-pass with logging
export function sanitizePrompt(rawPrompt, options = {}) {
  const { enableLogging = true, preserveOriginal = true } = options;
  
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return { sanitized: rawPrompt, original: rawPrompt, changed: false };
  }
  
  let sanitized = rawPrompt;
  const changes = [];
  
  // Multi-pass sanitization with word boundary detection
  Object.entries(SAFE_TOKENS).forEach(([sensitive, safe]) => {
    const regex = new RegExp(`\\b${sensitive}\\b`, 'gi');
    const beforeCount = (sanitized.match(regex) || []).length;
    
    if (beforeCount > 0) {
      sanitized = sanitized.replace(regex, safe);
      changes.push({ term: sensitive, replacement: safe, count: beforeCount });
      
      if (enableLogging) {
        console.log(`🛡️ Sanitized: "${sensitive}" → "${safe}" (${beforeCount} occurrences)`);
      }
    }
  });
  
  const result = {
    sanitized,
    original: preserveOriginal ? rawPrompt : null,
    changed: changes.length > 0,
    changes,
    metadata: {
      originalLength: rawPrompt.length,
      sanitizedLength: sanitized.length,
      termsReplaced: changes.length,
      timestamp: new Date().toISOString()
    }
  };
  
  if (enableLogging && result.changed) {
    //console.log(`✅ Prompt sanitized: ${changes.length} terms replaced`);
  }
  
  return result;
}

// 🔍 REVERSE SANITIZE - For internal metadata only
export function getOriginalTerms(sanitizedPrompt) {
  const reverseTokens = Object.fromEntries(
    Object.entries(SAFE_TOKENS).map(([k, v]) => [v, k])
  );
  
  let original = sanitizedPrompt;
  Object.entries(reverseTokens).forEach(([safe, sensitive]) => {
    const regex = new RegExp(`\\b${safe}\\b`, 'gi');
    original = original.replace(regex, sensitive);
  });
  
  return original;
}

// 🧪 TEST FUNCTION - Validate sanitizer
export function testSanitizer() {
  const testCases = [
    "Prudential Comfort Total diaper package size P",
    "adult incontinence care products",
    "high absorbency diapers for maximum protection"
  ];
  
  testCases.forEach((test, index) => {
    console.log(`\n🧪 Test ${index + 1}:`);
    console.log(`Original: "${test}"`);
    const result = sanitizePrompt(test);
    console.log(`Sanitized: "${result.sanitized}"`);
    console.log(`Changed: ${result.changed}`);
  });
}
