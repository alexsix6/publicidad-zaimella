// Context Enhancer - Advanced prompt enhancement with JSON Context Profiles
// Provides intelligent prompt building and context application with DIGITAL TWIN support
// 🎯 FIXED VERSION: Digital Twin auto-detection + Smart length limits + Critical element preservation

import { contextProfileManager } from './context-profile-manager.js';

// 🎯 Main function to enhance prompt with context
export async function enhancePromptWithContext(prompt, contextProfileId, options = {}) {
  try {
    //console.log(` Enhancing prompt with context profile: ${contextProfileId}`);
    
    // Apply context profile
    const contextResult = await contextProfileManager.applyContextToPrompt(prompt, contextProfileId);
    
    if (!contextResult.success) {
      console.warn(`[WARN] Context application failed: ${contextResult.error}`);
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
    console.error('[ERROR] Error enhancing prompt with context:', error);
    return {
      success: false,
      enhancedPrompt: prompt,
      originalPrompt: prompt,
      error: error.message
    };
  }
}

// 🆕 NEW: Detect if profile is a Digital Twin based on validation score
function isDigitalTwinProfile(profile) {
  const context = profile.context;
  let score = 0;
  let totalChecks = 4;

  // Check 1: Has detailed product specifications
  if (context.product_specifications?.pack_dimensions_mm) score++;

  // Check 2: Has exact Pantone color specifications
  if (context.brand_guidelines?.color_spec) score++;

  // Check 3: Has validation rules with must_include
  if (context.validation_rules?.must_include?.length > 0) score++;

  // Check 4: Has specific copy/text requirements
  if (context.product_specifications?.front_panel) score++;

  const digitalTwinScore = score / totalChecks;
  const isDigitalTwin = digitalTwinScore >= 0.75; // 75% threshold for digital twin

  console.log(`[DEBUG] Profile ${profile.profile?.id}: Digital Twin = ${isDigitalTwin} (score: ${score}/${totalChecks})`);
  
  return isDigitalTwin;
}

// 🚀 Apply advanced enhancements based on profile and options
async function applyAdvancedEnhancements(prompt, profile, options) {
  let enhancedPrompt = prompt;

  // 🆕 FIXED: Smart deduplication for Digital Twin profiles
  const isDigitalTwin = isDigitalTwinProfile(profile);
  
  if (isDigitalTwin) {
    //console.log(` Digital Twin detected - applying smart deduplication`);
    
    // For Digital Twin profiles, avoid duplicating elements that are already in the prompt
    // The buildContextualPrompt already includes all critical elements precisely
    
    // Only add non-redundant semantic connections
    if (profile.relationships?.semantic_connections) {
      enhancedPrompt = applyNonRedundantSemanticConnections(enhancedPrompt, profile.relationships.semantic_connections);
    }

    // Only add learned patterns that aren't already present
    if (profile.memory?.learned_patterns) {
      enhancedPrompt = applyNonRedundantLearnedPatterns(enhancedPrompt, profile.memory.learned_patterns);
    }

    // Skip applyDigitalTwinSpecs since buildContextualPrompt already handled it comprehensively
    //console.log(` Digital Twin enhancement completed without duplication`);
    
  } else {
    // 🔄 ORIGINAL: Standard enhancement for non-Digital Twin profiles
    
    // 🆕 Apply digital twin specifications if available
    if (profile.context?.product_specifications) {
      enhancedPrompt = applyDigitalTwinSpecs(enhancedPrompt, profile.context);
    }

    // Apply semantic connections
    if (profile.relationships?.semantic_connections) {
      enhancedPrompt = applySemanticConnections(enhancedPrompt, profile.relationships.semantic_connections);
    }

    // Apply learned patterns
    if (profile.memory?.learned_patterns) {
      enhancedPrompt = applyLearnedPatterns(enhancedPrompt, profile.memory.learned_patterns);
    }
  }

  // Apply style associations (safe for both types)
  if (profile.relationships?.style_associations) {
    enhancedPrompt = applyStyleAssociations(enhancedPrompt, profile.relationships.style_associations);
  }

  // Apply technical optimizations
  if (options.optimizeForModel) {
    enhancedPrompt = optimizeForModel(enhancedPrompt, options.optimizeForModel, profile);
  }

  return enhancedPrompt;
}

// 🆕 NEW: Non-redundant semantic connections (avoids duplication)
function applyNonRedundantSemanticConnections(prompt, semanticConnections) {
  let enhancedPrompt = prompt;
  const promptLower = prompt.toLowerCase();

  for (const [concept, relatedTerms] of Object.entries(semanticConnections)) {
    if (promptLower.includes(concept.toLowerCase())) {
      // Only add terms that aren't already in the prompt (strict checking for Digital Twin)
      const newTerms = relatedTerms.filter(term => {
        const termLower = term.toLowerCase();
        // More strict checking to avoid near-duplicates
        return !promptLower.includes(termLower) && 
               !promptLower.includes(termLower.replace(/[^a-z0-9]/g, ''));
      });
      
      if (newTerms.length > 0) {
        // Limit to 1 term for Digital Twin to avoid bloat
        enhancedPrompt += `, ${newTerms.slice(0, 1).join(', ')}`;
      }
    }
  }

  return enhancedPrompt;
}

// 🆕 NEW: Non-redundant learned patterns (avoids duplication)
function applyNonRedundantLearnedPatterns(prompt, learnedPatterns) {
  let enhancedPrompt = prompt;
  const promptLower = prompt.toLowerCase();

  // Apply effective keywords (only if not already present)
  if (learnedPatterns.effective_keywords) {
    const keywords = learnedPatterns.effective_keywords;
    const relevantKeywords = keywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      return !promptLower.includes(keywordLower) && 
             !promptLower.includes(keywordLower.replace(/[^a-z0-9]/g, ''));
    });
    
    if (relevantKeywords.length > 0) {
      // Limit to 1 keyword for Digital Twin
      enhancedPrompt += `, ${relevantKeywords.slice(0, 1).join(', ')}`;
    }
  }

  // Skip style combinations for Digital Twin as they're already optimally defined
  
  return enhancedPrompt;
}

// 🆕 NEW: Apply digital twin specifications for photorealistic product rendering
function applyDigitalTwinSpecs(prompt, context) {
  let enhancedPrompt = prompt;
  const specs = [];

  // Physical specifications
  if (context.product_specifications?.pack_dimensions_mm) {
    const dims = context.product_specifications.pack_dimensions_mm;
    specs.push(`package dimensions ${dims.height}×${dims.width}×${dims.depth}mm`);
  }

  if (context.product_specifications?.pack_type) {
    specs.push(`${context.product_specifications.pack_type}`);
  }

  // Exact Pantone colors
  if (context.brand_guidelines?.color_spec) {
    const colorSpecs = [];
    for (const [colorName, colorData] of Object.entries(context.brand_guidelines.color_spec)) {
      if (colorData.hex && colorData.pantone) {
        colorSpecs.push(`${colorData.hex} (${colorData.pantone})`);
      }
    }
    if (colorSpecs.length > 0) {
      specs.push(`exact colors: ${colorSpecs.join(', ')}`);
    }
  }

  // Professional lighting setup
  if (context.user_preferences?.lighting) {
    specs.push(`professional lighting: ${context.user_preferences.lighting}`);
  }

  // Precise composition
  if (context.user_preferences?.composition) {
    specs.push(`composition: ${context.user_preferences.composition}`);
  }

  // Product visual elements
  if (context.product_specifications?.front_panel) {
    const frontPanel = context.product_specifications.front_panel;
    
    if (frontPanel.upper_section?.elements) {
      specs.push(`upper section: ${frontPanel.upper_section.elements.join(', ')}`);
    }
    
    if (frontPanel.lower_section?.elements) {
      const lowerElements = frontPanel.lower_section.elements.slice(0, 3); // Limit to avoid bloat
      specs.push(`lower section: ${lowerElements.join(', ')}`);
    }
    
    if (frontPanel.divider_wave) {
      specs.push(`${frontPanel.divider_wave.thickness_mm}mm golden wave divider`);
    }
  }

  // Size and content specifications
  if (context.product_specifications?.size) {
    const size = context.product_specifications.size;
    specs.push(`size ${size.code} (${size.descriptor})`);
  }

  if (context.product_specifications?.unit_count) {
    specs.push(`${context.product_specifications.unit_count} units package`);
  }

  // Absorbency indicators
  if (context.product_specifications?.absorbency) {
    specs.push(`${context.product_specifications.absorbency.level} absorbency`);
    if (context.product_specifications.absorbency.graphic) {
      specs.push(`absorbency indicator: ${context.product_specifications.absorbency.graphic}`);
    }
  }

  // Technical quality specs
  if (context.technical_preferences?.color_accuracy) {
    specs.push(`color accuracy: ${context.technical_preferences.color_accuracy}`);
  }

  if (context.technical_preferences?.print_resolution_ppi) {
    specs.push(`${context.technical_preferences.print_resolution_ppi} PPI resolution`);
  }

  // Typography specifications
  if (context.brand_guidelines?.typography) {
    const typo = context.brand_guidelines.typography;
    if (typo.primary_font) {
      specs.push(`typography: ${typo.primary_font}`);
    }
  }

  // Add specifications to prompt if any were found
  if (specs.length > 0) {
    enhancedPrompt += `, ${specs.join(', ')}`;
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
    },
    'veo-3': {
      prefix: '',
      suffix: ', cinematic quality, smooth motion',
      emphasize: ['cinematic', 'smooth', 'fluid']
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

// 🎯 Build contextual prompt from profile (FIXED: AUTO DIGITAL TWIN + SMART LIMITS + CRITICAL PRESERVATION)
export function buildContextualPrompt(prompt, profile, options = {}) {
  const context = profile.context;
  const parts = [prompt];
  
  // 🚀 AUTO-DETECT DIGITAL TWIN + ADAPTIVE LIMITS
  const isDigitalTwin = isDigitalTwinProfile(profile);
  const digitalTwinMode = options.includeDigitalTwin !== false && isDigitalTwin; // Auto-enable for digital twins
  const smartMaxLength = digitalTwinMode ? Number.MAX_SAFE_INTEGER : (options.maxLength || 350); // 🎯 NO LIMITS FOR DIGITAL TWIN
  
  //console.log(` buildContextualPrompt starting - Digital Twin: ${digitalTwinMode}, maxLength: ${smartMaxLength}`);

  // 🎯 PRIORITY 1: Core essentials (ALWAYS include)
  if (context.user_preferences?.style) {
    parts.push(`${context.user_preferences.style} style`);
  }

  if (context.user_preferences?.mood) {
    parts.push(`${context.user_preferences.mood} mood`);
  }

  // Project context (essential)
  if (context.project_context?.theme) {
    parts.push(`${context.project_context.theme} theme`);
  }

  // 🎯 PRIORITY 2: Digital Twin Critical Elements (AUTO-ENABLED)
  if (digitalTwinMode && context.product_specifications) {
    
    // Physical dimensions (CRITICAL)
    if (context.product_specifications.pack_dimensions_mm) {
      const dims = context.product_specifications.pack_dimensions_mm;
      parts.push(`dimensions ${dims.height}×${dims.width}×${dims.depth}mm`);
    }

    // Package type (CRITICAL)
    if (context.product_specifications.pack_type) {
      parts.push(`${context.product_specifications.pack_type}`);
    }

    // ALL Pantone colors (CRITICAL for digital twin accuracy)
    if (context.brand_guidelines?.color_spec) {
      const colorEntries = Object.entries(context.brand_guidelines.color_spec);
      const pantoneColors = colorEntries.map(([name, colorData]) => 
        `${colorData.hex} (${colorData.pantone})`
      );
      if (pantoneColors.length > 0) {
        parts.push(`exact colors: ${pantoneColors.join(', ')}`);
      }
    }

    // Professional lighting (FULL specification for accuracy)
    if (context.user_preferences?.lighting) {
      parts.push(`professional lighting: ${context.user_preferences.lighting}`);
    }

    // Composition (FULL specification)
    if (context.user_preferences?.composition) {
      parts.push(`composition: ${context.user_preferences.composition}`);
    }

    // Upper section elements (CRITICAL)
    if (context.product_specifications.front_panel?.upper_section?.elements) {
      const elements = context.product_specifications.front_panel.upper_section.elements;
      parts.push(`upper section: ${elements.join(', ')}`);
    }

    // Lower section elements (CRITICAL - ALL elements for Digital Twin)
    if (context.product_specifications.front_panel?.lower_section?.elements) {
      const elements = context.product_specifications.front_panel.lower_section.elements;
      parts.push(`lower section: ${elements.join(', ')}`);
    }

    // Divider wave (CRITICAL visual element)
    if (context.product_specifications.front_panel?.divider_wave) {
      const wave = context.product_specifications.front_panel.divider_wave;
      parts.push(`${wave.thickness_mm}mm golden wave divider`);
    }

    // Size and content (CRITICAL)
    if (context.product_specifications.size) {
      parts.push(`size ${context.product_specifications.size.code} (${context.product_specifications.size.descriptor})`);
    }

    if (context.product_specifications.unit_count) {
      parts.push(`${context.product_specifications.unit_count} units package`);
    }

    // Absorbency (CRITICAL for product accuracy)
    if (context.product_specifications.absorbency) {
      parts.push(`${context.product_specifications.absorbency.level} absorbency`);
      if (context.product_specifications.absorbency.graphic) {
        parts.push(`absorbency indicator: ${context.product_specifications.absorbency.graphic}`);
      }
    }

    // Quality specifications (CRITICAL)
    if (context.technical_preferences?.color_accuracy) {
      parts.push(`color accuracy: ${context.technical_preferences.color_accuracy}`);
    }

    if (context.technical_preferences?.print_resolution_ppi) {
      parts.push(`${context.technical_preferences.print_resolution_ppi} PPI resolution`);
    }

    // Typography (CRITICAL for brand compliance)
    if (context.brand_guidelines?.typography?.primary_font) {
      parts.push(`typography: ${context.brand_guidelines.typography.primary_font}`);
    }

    // MUST INCLUDE elements (HIGHEST PRIORITY - ALL elements for Digital Twin)
    if (context.validation_rules?.must_include) {
      const mustIncludeElements = context.validation_rules.must_include;
      parts.push(`critical elements: ${mustIncludeElements.join(', ')}`);
    }

    // 🆕 SIDE PANELS (Complete product information)
    if (context.product_specifications.side_panels?.left_panel) {
      const leftPanel = context.product_specifications.side_panels.left_panel;
      if (leftPanel.heading) {
        parts.push(`left panel heading: "${leftPanel.heading}"`);
      }
      if (leftPanel.sections) {
        parts.push(`left panel content: ${leftPanel.sections.join(', ')}`);
      }
    }
    
    if (context.product_specifications.side_panels?.right_panel) {
      const rightPanel = context.product_specifications.side_panels.right_panel;
      if (rightPanel.heading) {
        parts.push(`right panel heading: "${rightPanel.heading}"`);
      }
      if (rightPanel.subsections) {
        parts.push(`right panel instructions: ${rightPanel.subsections.join(', ')}`);
      }
      if (rightPanel.ingredients) {
        parts.push(`ingredients: ${rightPanel.ingredients}`);
      }
      if (rightPanel.barcode_ean13) {
        parts.push(`barcode: ${rightPanel.barcode_ean13}`);
      }
      if (rightPanel.website) {
        parts.push(`website: ${rightPanel.website}`);
      }
    }

    // 🆕 TOP PANEL (Logo and icon repetitions)
    if (context.product_specifications.top_panel) {
      const topPanel = context.product_specifications.top_panel;
      if (topPanel.logo_repeat) {
        parts.push(`top panel: logo repetition enabled`);
      }
      if (topPanel.icons_repeat) {
        parts.push(`top panel icons: ${topPanel.icons_repeat.join(', ')}`);
      }
      if (topPanel.size_badge) {
        parts.push(`top panel badge: ${topPanel.size_badge}`);
      }
    }

    // 🆕 COPY EN ESPAÑOL (Headlines and micro-copy)
    if (context.product_specifications.copy_es) {
      const copyEs = context.product_specifications.copy_es;
      if (copyEs.headline) {
        parts.push(`headline: "${copyEs.headline}"`);
      }
      if (copyEs.subheadline) {
        parts.push(`subheadline: "${copyEs.subheadline}"`);
      }
      if (copyEs.call_to_action) {
        parts.push(`CTA: "${copyEs.call_to_action}"`);
      }
      if (copyEs.value_prop) {
        parts.push(`value proposition: "${copyEs.value_prop}"`);
      }
      if (copyEs.micro) {
        const microCopy = Object.entries(copyEs.micro).map(([key, value]) => `${key}: "${value}"`);
        parts.push(`micro copy: ${microCopy.join(', ')}`);
      }
    }

    // 🆕 EXACT ICON DIMENSIONS
    if (context.product_specifications.icon_pigeon_mm) {
      const pigeonIcon = context.product_specifications.icon_pigeon_mm;
      parts.push(`pigeon icon dimensions: ${pigeonIcon.width}×${pigeonIcon.height}mm`);
    }

    if (context.product_specifications.absorbency_indicator_mm) {
      const absorbencyIcon = context.product_specifications.absorbency_indicator_mm;
      if (absorbencyIcon.big_drop) {
        parts.push(`big drop: ${absorbencyIcon.big_drop.width}×${absorbencyIcon.big_drop.height}mm`);
      }
      if (absorbencyIcon.black_circle) {
        parts.push(`black circle: ${absorbencyIcon.black_circle.diameter}mm diameter`);
      }
    }

    // 🆕 BOTTOM SEAL (Structural details)
    if (context.product_specifications.bottom_seal) {
      const seal = context.product_specifications.bottom_seal;
      if (seal.structure) {
        parts.push(`bottom seal: ${seal.structure}`);
      }
      if (seal.note) {
        parts.push(`seal note: ${seal.note}`);
      }
    }

    // 🆕 SIZE SPECIFICATIONS (Complete sizing info)
    if (context.product_specifications.size) {
      const size = context.product_specifications.size;
      if (size.waist_range_cm) {
        parts.push(`waist range: ${size.waist_range_cm}`);
      }
      if (size.weight_limit_kg) {
        parts.push(`weight limit: ${size.weight_limit_kg}`);
      }
    }

  } else {
    // 🔄 FALLBACK: Original behavior for non-digital-twin profiles
    
    // Visual elements (original logic)
    if (context.user_preferences?.color_palette_hex?.length > 0) {
      const colors = context.user_preferences.color_palette_hex.slice(0, 3); // Limit to 3 colors
      parts.push(`color palette: ${colors.join(', ')}`);
    }

    // Technical preferences (original logic)
    if (context.technical_preferences?.quality) {
      parts.push(`${context.technical_preferences.quality} quality`);
    }

    // Lighting and composition preferences (original logic - simplified)
    if (context.user_preferences?.lighting) {
      parts.push(`${context.user_preferences.lighting.split('(')[0].trim()} lighting`);
    }

    if (context.user_preferences?.composition) {
      parts.push(`${context.user_preferences.composition.split(',')[0].trim()} composition`);
    }
  }

  // 🎯 PRIORITY 3: Brand values (limited for non-digital-twin)
  if (context.brand_guidelines?.values?.length > 0) {
    const valueLimit = digitalTwinMode ? 5 : 3; // More values for digital twins
    const values = context.brand_guidelines.values.slice(0, valueLimit);
    parts.push(`brand values: ${values.join(', ')}`);
  }

  // 🎯 PRIORITY 4: Quality specifications
  if (digitalTwinMode) {
    parts.push(`ultra-high quality, masterpiece`);
  } else if (context.technical_preferences?.quality) {
    parts.push(`${context.technical_preferences.quality} quality`);
  }

  // 🚨 INTELLIGENT TRUNCATION WITH CRITICAL ELEMENT PRESERVATION
  const separator = options.separator || ', ';
  let result = parts.join(separator);
  
  //console.log(` Pre-truncation length: ${result.length}`);
  
  if (result.length > smartMaxLength) {
    console.log(`[WARN] Context prompt too long (${result.length}), intelligently truncating to ${smartMaxLength}`);
    
    if (digitalTwinMode) {
      // 🎯 SMART TRUNCATION FOR DIGITAL TWINS: Preserve critical elements
      result = intelligentDigitalTwinTruncation(parts, smartMaxLength, context, separator);
    } else {
      // 🔄 STANDARD TRUNCATION: Keep essential parts
      const essentialParts = parts.slice(0, 6); // First 6 parts are most critical
      result = essentialParts.join(separator);
      
      if (result.length > smartMaxLength) {
        result = result.substring(0, smartMaxLength - 3) + '...';
        console.log(`🚨 Hard truncation applied`);
      }
    }
  }

  //console.log(` buildContextualPrompt result: ${result.length} chars`);
  return result;
}

// 🆕 NEW: Intelligent truncation for Digital Twin profiles
function intelligentDigitalTwinTruncation(parts, maxLength, context, separator) {
  // Define critical elements that must be preserved
  const criticalKeywords = [
    'dimensions', 'pantone', 'colors', 'lighting', 'composition',
    'upper section', 'lower section', 'wave divider', 'size',
    'units', 'absorbency', 'color accuracy', 'PPI', 'typography'
  ];

  // Add must_include elements as critical
  if (context.validation_rules?.must_include) {
    context.validation_rules.must_include.forEach(element => {
      criticalKeywords.push(element.toLowerCase());
    });
  }

  // Sort parts by criticality (critical elements first)
  const sortedParts = parts.sort((a, b) => {
    const aIsCritical = criticalKeywords.some(keyword => 
      a.toLowerCase().includes(keyword.toLowerCase())
    );
    const bIsCritical = criticalKeywords.some(keyword => 
      b.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (aIsCritical && !bIsCritical) return -1;
    if (!aIsCritical && bIsCritical) return 1;
    return 0;
  });

  // Build result preserving critical elements
  let result = '';
  let usedLength = 0;

  for (const part of sortedParts) {
    const partWithSeparator = result ? separator + part : part;
    
    if (usedLength + partWithSeparator.length <= maxLength) {
      result += partWithSeparator;
      usedLength += partWithSeparator.length;
    } else {
      // Check if this part contains critical elements
      const isCritical = criticalKeywords.some(keyword => 
        part.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isCritical) {
        // Try to fit abbreviated version
        const availableSpace = maxLength - usedLength - separator.length;
        if (availableSpace > 20) { // Minimum viable space
          const abbreviated = part.substring(0, availableSpace - 3) + '...';
          result += separator + abbreviated;
          break;
        }
      }
      // Skip non-critical elements if no space
    }
  }

  //console.log(` Intelligent truncation preserved ${result.length} chars with critical elements`);
  return result;
}

// 🆕 NEW: Extract complete digital twin specifications
export function extractDigitalTwinSpecs(profile) {
  const context = profile.context;
  const specs = {
    physical: {},
    visual: {},
    technical: {},
    brand: {}
  };

  // Physical specifications
  if (context.product_specifications) {
    specs.physical = {
      dimensions: context.product_specifications.pack_dimensions_mm,
      type: context.product_specifications.pack_type,
      size: context.product_specifications.size,
      unitCount: context.product_specifications.unit_count,
      absorbency: context.product_specifications.absorbency
    };
  }

  // Visual specifications
  if (context.brand_guidelines?.color_spec) {
    specs.visual.colors = context.brand_guidelines.color_spec;
  }

  if (context.user_preferences) {
    specs.visual.lighting = context.user_preferences.lighting;
    specs.visual.composition = context.user_preferences.composition;
  }

  // Technical specifications
  if (context.technical_preferences) {
    specs.technical = context.technical_preferences;
  }

  // Brand specifications
  if (context.brand_guidelines) {
    specs.brand = {
      values: context.brand_guidelines.values,
      typography: context.brand_guidelines.typography,
      visualElements: context.brand_guidelines.visual_elements
    };
  }

  return specs;
}

// 📊 Analyze prompt compatibility with profile (ENHANCED)
export function analyzePromptCompatibility(prompt, profile) {
  const context = profile.context;
  const analysis = {
    compatibility: 0,
    matches: [],
    conflicts: [],
    suggestions: [],
    digitalTwinCompliance: 0,
    isDigitalTwin: isDigitalTwinProfile(profile)
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

  // 🆕 ENHANCED: Check digital twin specifications compliance
  if (context.product_specifications) {
    let digitalTwinScore = 0;
    let totalChecks = 0;

    // Check for dimensions mention
    if (context.product_specifications.pack_dimensions_mm) {
      totalChecks++;
      if (promptLower.includes('dimensions') || promptLower.includes('mm')) {
        digitalTwinScore++;
        analysis.matches.push('Physical dimensions specified');
      }
    }

    // Check for Pantone colors
    if (context.brand_guidelines?.color_spec) {
      totalChecks++;
      if (promptLower.includes('pantone') || promptLower.includes('#')) {
        digitalTwinScore++;
        analysis.matches.push('Exact color specifications');
      }
    }

    // Check for professional lighting
    if (context.user_preferences?.lighting) {
      totalChecks++;
      if (promptLower.includes('lighting') || promptLower.includes('studio')) {
        digitalTwinScore++;
        analysis.matches.push('Professional lighting specified');
      }
    }

    // Check for must_include elements
    if (context.validation_rules?.must_include) {
      totalChecks++;
      const includedElements = context.validation_rules.must_include.filter(element =>
        promptLower.includes(element.toLowerCase())
      );
      if (includedElements.length > 0) {
        digitalTwinScore++;
        analysis.matches.push(`Critical elements included: ${includedElements.join(', ')}`);
      }
    }

    // Calculate digital twin compliance
    if (totalChecks > 0) {
      analysis.digitalTwinCompliance = (digitalTwinScore / totalChecks) * 100;
      analysis.compatibility += analysis.digitalTwinCompliance * 0.5; // Weight digital twin compliance
    }
  }

  // Check color palette mentions (enhanced)
  if (context.user_preferences?.color_palette_hex) {
    for (const color of context.user_preferences.color_palette_hex) {
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

  // 🆕 ENHANCED: Generate smarter suggestions
  if (analysis.compatibility < 50) {
    if (context.user_preferences?.style) {
      analysis.suggestions.push(`Consider adding "${context.user_preferences.style} style"`);
    }
    if (context.user_preferences?.mood) {
      analysis.suggestions.push(`Consider adding "${context.user_preferences.mood} mood"`);
    }
  }

  if (analysis.digitalTwinCompliance < 50 && analysis.isDigitalTwin) {
    analysis.suggestions.push('Digital Twin profile detected: Add specific product dimensions, Pantone colors, and critical elements for maximum accuracy');
  }

  // Normalize compatibility score
  analysis.compatibility = Math.max(0, Math.min(100, analysis.compatibility));

  return analysis;
}

// 🔄 Update profile based on successful generation (ENHANCED)
export async function updateProfileFromSuccess(profileId, prompt, result, userFeedback = null) {
  try {
    const profile = await contextProfileManager.loadProfile(profileId);
    if (!profile) return false;

    // Record successful prompt
    const successRecord = {
      prompt: prompt,
      timestamp: new Date().toISOString(),
      result_quality: userFeedback?.quality || 8, // Default to good quality
      user_feedback: userFeedback?.comment || 'Generated successfully',
      // 🆕 NEW: Enhanced metadata
      digitalTwinUsed: isDigitalTwinProfile(profile),
      promptLength: prompt.length,
      enhancementType: result.enhancedPrompt ? 'enhanced' : 'basic'
    };

    // Initialize memory structure if missing
    if (!profile.memory) {
      profile.memory = {
        successful_prompts: [],
        learned_patterns: {},
        usage_stats: {
          total_generations: 0,
          success_rate: 0,
          last_used: null
        }
      };
    }

    profile.memory.successful_prompts = profile.memory.successful_prompts || [];
    profile.memory.successful_prompts.push(successRecord);

    // Limit stored prompts to last 50
    if (profile.memory.successful_prompts.length > 50) {
      profile.memory.successful_prompts = profile.memory.successful_prompts.slice(-50);
    }

    // Update usage stats
    profile.memory.usage_stats.total_generations = (profile.memory.usage_stats.total_generations || 0) + 1;
    profile.memory.usage_stats.last_used = new Date().toISOString();
    
    // Update success rate
    const totalPrompts = profile.memory.usage_stats.total_generations;
    const successfulPrompts = profile.memory.successful_prompts.length;
    profile.memory.usage_stats.success_rate = (successfulPrompts / totalPrompts) * 100;

    // 🆕 NEW: Learn from successful patterns
    if (userFeedback?.quality >= 8) {
      // Extract keywords from successful high-quality prompts
      const keywords = prompt.toLowerCase().match(/\b[\w-]+\b/g) || [];
      const qualityKeywords = keywords.filter(word => word.length > 3);
      
      if (!profile.memory.learned_patterns.effective_keywords) {
        profile.memory.learned_patterns.effective_keywords = [];
      }
      
      // Add new effective keywords (avoid duplicates)
      qualityKeywords.forEach(keyword => {
        if (!profile.memory.learned_patterns.effective_keywords.includes(keyword)) {
          profile.memory.learned_patterns.effective_keywords.push(keyword);
        }
      });
      
      // Limit to 20 most recent keywords
      if (profile.memory.learned_patterns.effective_keywords.length > 20) {
        profile.memory.learned_patterns.effective_keywords = 
          profile.memory.learned_patterns.effective_keywords.slice(-20);
      }
    }

    // Save updated profile
    await contextProfileManager.updateProfile(profileId, profile);

    console.log(`📈 Updated profile ${profileId} with successful generation`);
    return true;
  } catch (error) {
    console.error('[ERROR] Error updating profile from success:', error);
    return false;
  }
}