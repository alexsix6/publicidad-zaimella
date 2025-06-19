// Context Enhancer - Advanced prompt enhancement with JSON Context Profiles
// Provides intelligent prompt building and context application

import { contextProfileManager } from './context-profile-manager.js';

// 🎯 Main function to enhance prompt with context
export async function enhancePromptWithContext(prompt, contextProfileId, options = {}) {
  try {
    console.log(`🧠 Enhancing prompt with context profile: ${contextProfileId}`);
    
    // Apply context profile
    const contextResult = await contextProfileManager.applyContextToPrompt(prompt, contextProfileId);
    
    if (!contextResult.success) {
      console.warn(`⚠️ Context application failed: ${contextResult.error}`);
      return {
        success: false,
        enhancedPrompt: prompt,
        originalPrompt: prompt,
        error: contextResult.error
      };
    }

    // Apply additional enhancements if requested
    let finalPrompt = contextResult.enhancedPrompt;
    
    if (options.useAdvancedEnhancement) {
      finalPrompt = await applyAdvancedEnhancements(finalPrompt, contextResult.profile, options);
    }

    console.log(`✨ Prompt enhancement completed`);
    console.log(`   Original: "${prompt}"`);
    console.log(`   Enhanced: "${finalPrompt}"`);

    return {
      success: true,
      enhancedPrompt: finalPrompt,
      originalPrompt: prompt,
      contextApplied: true,
      profile: contextResult.profile,
      enhancements: {
        contextProfile: contextProfileId,
        advancedEnhancement: options.useAdvancedEnhancement || false
      }
    };
  } catch (error) {
    console.error('❌ Error enhancing prompt with context:', error);
    return {
      success: false,
      enhancedPrompt: prompt,
      originalPrompt: prompt,
      error: error.message
    };
  }
}

// 🚀 Apply advanced enhancements based on profile and options
async function applyAdvancedEnhancements(prompt, profile, options) {
  let enhancedPrompt = prompt;

  // Apply semantic connections
  if (profile.relationships?.semantic_connections) {
    enhancedPrompt = applySemanticConnections(enhancedPrompt, profile.relationships.semantic_connections);
  }

  // Apply learned patterns
  if (profile.memory?.learned_patterns) {
    enhancedPrompt = applyLearnedPatterns(enhancedPrompt, profile.memory.learned_patterns);
  }

  // Apply style associations
  if (profile.relationships?.style_associations) {
    enhancedPrompt = applyStyleAssociations(enhancedPrompt, profile.relationships.style_associations);
  }

  // Apply technical optimizations
  if (options.optimizeForModel) {
    enhancedPrompt = optimizeForModel(enhancedPrompt, options.optimizeForModel, profile);
  }

  return enhancedPrompt;
}

// 🔗 Apply semantic connections from profile
function applySemanticConnections(prompt, semanticConnections) {
  let enhancedPrompt = prompt;

  for (const [concept, relatedTerms] of Object.entries(semanticConnections)) {
    if (prompt.toLowerCase().includes(concept.toLowerCase())) {
      // Add related terms that aren't already in the prompt
      const newTerms = relatedTerms.filter(term => 
        !enhancedPrompt.toLowerCase().includes(term.toLowerCase())
      );
      
      if (newTerms.length > 0) {
        enhancedPrompt += `, ${newTerms.slice(0, 2).join(', ')}`; // Limit to 2 terms to avoid bloat
      }
    }
  }

  return enhancedPrompt;
}

// 📚 Apply learned patterns from successful generations
function applyLearnedPatterns(prompt, learnedPatterns) {
  let enhancedPrompt = prompt;

  // Apply effective keywords
  if (learnedPatterns.effective_keywords) {
    const keywords = learnedPatterns.effective_keywords;
    const relevantKeywords = keywords.filter(keyword => 
      !enhancedPrompt.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (relevantKeywords.length > 0) {
      enhancedPrompt += `, ${relevantKeywords.slice(0, 2).join(', ')}`;
    }
  }

  // Apply successful style combinations
  if (learnedPatterns.style_combinations) {
    for (const combination of learnedPatterns.style_combinations) {
      if (typeof combination === 'string' && combination.includes('=')) {
        const [styles, result] = combination.split('=');
        const styleTerms = styles.split('+').map(s => s.trim());
        
        // If prompt contains any of these styles, add the successful combination
        if (styleTerms.some(style => prompt.toLowerCase().includes(style.toLowerCase()))) {
          const missingStyles = styleTerms.filter(style => 
            !enhancedPrompt.toLowerCase().includes(style.toLowerCase())
          );
          
          if (missingStyles.length > 0) {
            enhancedPrompt += `, ${missingStyles.join(', ')}`;
          }
        }
      }
    }
  }

  return enhancedPrompt;
}

// 🎨 Apply style associations
function applyStyleAssociations(prompt, styleAssociations) {
  let enhancedPrompt = prompt;

  for (const [style, associations] of Object.entries(styleAssociations)) {
    if (prompt.toLowerCase().includes(style.toLowerCase())) {
      const relevantAssociations = associations.filter(assoc => 
        !enhancedPrompt.toLowerCase().includes(assoc.toLowerCase())
      );
      
      if (relevantAssociations.length > 0) {
        enhancedPrompt += `, ${relevantAssociations.slice(0, 1).join(', ')}`; // Add one association
      }
    }
  }

  return enhancedPrompt;
}

// ⚙️ Optimize prompt for specific model
function optimizeForModel(prompt, modelType, profile) {
  let optimizedPrompt = prompt;

  const modelOptimizations = {
    'kontext-max': {
      prefix: '',
      suffix: ', highly detailed, professional quality',
      emphasize: ['detailed', 'precise', 'high-quality']
    },
    'kontext-pro': {
      prefix: '',
      suffix: ', professional grade, detailed composition',
      emphasize: ['professional', 'detailed', 'composition']
    },
    'pro-ultra': {
      prefix: '',
      suffix: ', ultra-high quality, masterpiece',
      emphasize: ['ultra-high', 'masterpiece', 'premium']
    },
    'alexseis': {
      prefix: '',
      suffix: ', artistic style, creative interpretation',
      emphasize: ['artistic', 'creative', 'unique']
    }
  };

  const optimization = modelOptimizations[modelType];
  if (optimization) {
    // Add prefix if specified
    if (optimization.prefix) {
      optimizedPrompt = `${optimization.prefix} ${optimizedPrompt}`;
    }

    // Add suffix if not already present
    if (optimization.suffix && !optimizedPrompt.includes(optimization.suffix.trim())) {
      optimizedPrompt += optimization.suffix;
    }

    // Emphasize certain terms if they're already in the prompt
    optimization.emphasize.forEach(term => {
      if (optimizedPrompt.toLowerCase().includes(term.toLowerCase())) {
        // Term is already present, no need to add again
        return;
      }
    });
  }

  return optimizedPrompt;
}

// 🎯 Build contextual prompt from profile (alternative method)
export function buildContextualPrompt(prompt, profile, options = {}) {
  const context = profile.context;
  const parts = [prompt];

  // Core style and mood
  if (context.user_preferences?.style) {
    parts.push(`${context.user_preferences.style} style`);
  }

  if (context.user_preferences?.mood) {
    parts.push(`${context.user_preferences.mood} mood`);
  }

  // Visual elements
  if (context.user_preferences?.color_palette?.length > 0) {
    const colors = context.user_preferences.color_palette.slice(0, 3); // Limit to 3 colors
    parts.push(`color palette: ${colors.join(', ')}`);
  }

  // Project and brand context
  if (context.project_context?.theme) {
    parts.push(`${context.project_context.theme} theme`);
  }

  if (context.brand_guidelines?.values?.length > 0) {
    const values = context.brand_guidelines.values.slice(0, 2); // Limit to 2 values
    parts.push(`brand values: ${values.join(', ')}`);
  }

  // Technical preferences
  if (context.technical_preferences?.quality) {
    parts.push(`${context.technical_preferences.quality} quality`);
  }

  // Lighting and composition preferences
  if (context.user_preferences?.lighting) {
    parts.push(`${context.user_preferences.lighting} lighting`);
  }

  if (context.user_preferences?.composition) {
    parts.push(`${context.user_preferences.composition} composition`);
  }

  // Things to avoid (add as negative prompt if supported)
  if (context.user_preferences?.avoid?.length > 0 && options.includeNegatives) {
    const avoid = context.user_preferences.avoid.slice(0, 3); // Limit to 3 items
    parts.push(`avoid: ${avoid.join(', ')}`);
  }

  // Join with appropriate separator
  const separator = options.separator || ', ';
  return parts.join(separator);
}

// 📊 Analyze prompt compatibility with profile
export function analyzePromptCompatibility(prompt, profile) {
  const context = profile.context;
  const analysis = {
    compatibility: 0,
    matches: [],
    conflicts: [],
    suggestions: []
  };

  const promptLower = prompt.toLowerCase();

  // Check style compatibility
  if (context.user_preferences?.style) {
    const style = context.user_preferences.style.toLowerCase();
    if (promptLower.includes(style)) {
      analysis.matches.push(`Style: ${context.user_preferences.style}`);
      analysis.compatibility += 20;
    }
  }

  // Check for avoided terms
  if (context.user_preferences?.avoid) {
    for (const avoidTerm of context.user_preferences.avoid) {
      if (promptLower.includes(avoidTerm.toLowerCase())) {
        analysis.conflicts.push(`Contains avoided term: ${avoidTerm}`);
        analysis.compatibility -= 15;
      }
    }
  }

  // Check color palette mentions
  if (context.user_preferences?.color_palette) {
    for (const color of context.user_preferences.color_palette) {
      if (promptLower.includes(color.toLowerCase())) {
        analysis.matches.push(`Color: ${color}`);
        analysis.compatibility += 10;
      }
    }
  }

  // Check brand values alignment
  if (context.brand_guidelines?.values) {
    for (const value of context.brand_guidelines.values) {
      if (promptLower.includes(value.toLowerCase())) {
        analysis.matches.push(`Brand value: ${value}`);
        analysis.compatibility += 15;
      }
    }
  }

  // Generate suggestions
  if (analysis.compatibility < 50) {
    if (context.user_preferences?.style) {
      analysis.suggestions.push(`Consider adding "${context.user_preferences.style} style"`);
    }
    if (context.user_preferences?.mood) {
      analysis.suggestions.push(`Consider adding "${context.user_preferences.mood} mood"`);
    }
  }

  // Normalize compatibility score
  analysis.compatibility = Math.max(0, Math.min(100, analysis.compatibility));

  return analysis;
}

// 🔄 Update profile based on successful generation
export async function updateProfileFromSuccess(profileId, prompt, result, userFeedback = null) {
  try {
    const profile = await contextProfileManager.loadProfile(profileId);
    if (!profile) return false;

    // Record successful prompt
    const successRecord = {
      prompt: prompt,
      timestamp: new Date().toISOString(),
      result_quality: userFeedback?.quality || 8, // Default to good quality
      user_feedback: userFeedback?.comment || 'Generated successfully'
    };

    profile.memory.successful_prompts.push(successRecord);

    // Limit stored prompts to last 50
    if (profile.memory.successful_prompts.length > 50) {
      profile.memory.successful_prompts = profile.memory.successful_prompts.slice(-50);
    }

    // Update success rate
    const totalPrompts = profile.memory.usage_stats.total_generations;
    const successfulPrompts = profile.memory.successful_prompts.length;
    profile.memory.usage_stats.success_rate = (successfulPrompts / totalPrompts) * 100;

    // Save updated profile
    await contextProfileManager.updateProfile(profileId, profile);

    console.log(`📈 Updated profile ${profileId} with successful generation`);
    return true;
  } catch (error) {
    console.error('❌ Error updating profile from success:', error);
    return false;
  }
} 