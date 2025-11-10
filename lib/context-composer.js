/**
 * Context Composer - Unifies context flow across all asset types
 * Eliminates context degradation between copy → images → videos
 *
 * PROBLEM: Currently copy receives full context (avatar + offer + mechanism)
 *          but images/videos receive only partial context
 *
 * SOLUTION: Single function that composes complete scene context for ALL assets
 */

/**
 * Compose complete scene context from strategic frameworks
 *
 * @param {Object} params - Context parameters
 * @param {Object} params.nicheContext - Niche/market context
 * @param {Object} params.avatarProfile - Customer avatar profile (demographics, psychographics)
 * @param {Object} params.mechanism - Unique mechanism from analysis
 * @param {Object} params.offer - Grand Slam Offer from analysis
 * @param {Object} params.copyContent - Generated copy with hooks/frameworks
 * @param {Object} params.brief - Original campaign brief
 * @param {string} params.assetType - Type: 'product' | 'avatar' | 'video'
 * @param {Object} params.options - Additional options (imageUrl, videoStyle, etc.)
 * @returns {Object} Composed context with enriched prompts
 */
export function composeSceneWithContext({
  nicheContext,
  avatarProfile = null,
  mechanism = null,
  offer = null,
  copyContent = null,
  brief = '',
  assetType = 'product',
  options = {}
}) {
  console.log(`📦 Composing scene context for: ${assetType}`);

  // STEP 1: Extract strategic elements
  const strategicElements = extractStrategicElements({
    mechanism,
    offer,
    copyContent,
    avatarProfile
  });

  console.log(`  [INFO] Strategic elements extracted: ${Object.keys(strategicElements).length} components`);

  // STEP 2: Build unified context string
  const unifiedContext = buildUnifiedContext({
    nicheContext,
    avatarProfile,
    strategicElements,
    brief
  });

  console.log(`  [INFO] Unified context built: ${unifiedContext.length} chars`);

  // STEP 3: Compose asset-specific prompts with FULL context
  const composedPrompts = composeAssetPrompts({
    assetType,
    unifiedContext,
    strategicElements,
    options
  });

  console.log(`  [INFO] Asset prompts composed for: ${assetType}`);

  return {
    success: true,
    assetType,
    unifiedContext,
    strategicElements,
    prompts: composedPrompts,
    metadata: {
      contextLength: unifiedContext.length,
      elementsCount: Object.keys(strategicElements).length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Extract strategic elements from frameworks
 */
function extractStrategicElements({ mechanism, offer, copyContent, avatarProfile }) {
  const elements = {};

  // From Unique Mechanism
  if (mechanism) {
    elements.mechanism = {
      name: mechanism.mechanism_name || '',
      description: mechanism.description || '',
      differentiator: mechanism.why_different || '',
      promise: mechanism.big_promise || ''
    };
  }

  // From Grand Slam Offer
  if (offer) {
    elements.offer = {
      dreamOutcome: offer.dream_outcome || '',
      perceivedLikelihood: offer.perceived_likelihood || '',
      timeDelay: offer.time_delay || '',
      effortSacrifice: offer.effort_sacrifice || '',
      valueEquation: offer.value_summary || ''
    };
  }

  // From Copy Generation
  if (copyContent) {
    elements.copy = {
      headline: copyContent.headline || copyContent.main_headline || '',
      hook: copyContent.hook || copyContent.opening_hook || '',
      cta: copyContent.cta || copyContent.call_to_action || '',
      keyBenefits: copyContent.key_benefits || [],
      emotionalTriggers: copyContent.emotional_triggers || []
    };
  }

  // From Customer Avatar
  if (avatarProfile) {
    elements.avatar = {
      painPoints: avatarProfile.pain_points || [],
      desires: avatarProfile.desires || [],
      demographics: avatarProfile.demographics || {},
      sophistication: avatarProfile.market_sophistication || 'Stage 3'
    };
  }

  return elements;
}

/**
 * Build unified context string from all components
 */
function buildUnifiedContext({ nicheContext, avatarProfile, strategicElements, brief }) {
  const contextParts = [];

  // Market/Niche Context
  if (nicheContext) {
    contextParts.push(`Market: ${nicheContext.industry || nicheContext.niche || 'general'}`);
    if (nicheContext.sophistication_level) {
      contextParts.push(`Sophistication: ${nicheContext.sophistication_level}`);
    }
  }

  // Customer Avatar Context
  if (avatarProfile && strategicElements.avatar) {
    const avatar = strategicElements.avatar;
    if (avatar.demographics?.age_range) {
      contextParts.push(`Target: ${avatar.demographics.age_range}`);
    }
    if (avatar.painPoints?.length > 0) {
      contextParts.push(`Pain: ${avatar.painPoints[0]}`);
    }
    if (avatar.desires?.length > 0) {
      contextParts.push(`Desire: ${avatar.desires[0]}`);
    }
  }

  // Unique Mechanism Context
  if (strategicElements.mechanism) {
    const mech = strategicElements.mechanism;
    if (mech.name) {
      contextParts.push(`Mechanism: ${mech.name}`);
    }
    if (mech.promise) {
      contextParts.push(`Promise: ${mech.promise}`);
    }
  }

  // Offer Context
  if (strategicElements.offer) {
    const off = strategicElements.offer;
    if (off.dreamOutcome) {
      contextParts.push(`Outcome: ${off.dreamOutcome}`);
    }
  }

  // Copy Context
  if (strategicElements.copy) {
    const copy = strategicElements.copy;
    if (copy.hook) {
      contextParts.push(`Hook: ${copy.hook}`);
    }
  }

  return contextParts.join(' | ');
}

/**
 * Compose asset-specific prompts with full context
 */
function composeAssetPrompts({ assetType, unifiedContext, strategicElements, options }) {
  const prompts = {};

  switch (assetType) {
    case 'product':
      prompts.main = composeProductPrompt(unifiedContext, strategicElements, options);
      break;

    case 'avatar':
      prompts.main = composeAvatarPrompt(unifiedContext, strategicElements, options);
      break;

    case 'video':
      prompts.main = composeVideoPrompt(unifiedContext, strategicElements, options);
      prompts.script = composeVideoScript(strategicElements, options);
      break;

    default:
      prompts.main = `${unifiedContext} - ${options.basePrompt || ''}`;
  }

  return prompts;
}

/**
 * Compose product image prompt with full context
 */
function composeProductPrompt(context, elements, options) {
  const parts = [options.basePrompt || 'Professional product photography'];

  // Add mechanism differentiation
  if (elements.mechanism?.differentiator) {
    parts.push(`showcasing: ${elements.mechanism.differentiator}`);
  }

  // Add offer value
  if (elements.offer?.dreamOutcome) {
    parts.push(`representing: ${elements.offer.dreamOutcome}`);
  }

  // Add emotional triggers from copy
  if (elements.copy?.emotionalTriggers?.length > 0) {
    parts.push(`emotion: ${elements.copy.emotionalTriggers[0]}`);
  }

  // Add unified context
  parts.push(`Context: ${context}`);

  return parts.join('. ');
}

/**
 * Compose avatar/persona prompt with full context
 */
function composeAvatarPrompt(context, elements, options) {
  const parts = [options.basePrompt || 'Professional portrait'];

  // Add avatar demographics
  if (elements.avatar?.demographics) {
    const demo = elements.avatar.demographics;
    if (demo.age_range) parts.push(`age: ${demo.age_range}`);
    if (demo.profession) parts.push(`profession: ${demo.profession}`);
  }

  // Add emotional state matching copy
  if (elements.copy?.emotionalTriggers?.length > 0) {
    parts.push(`expression: ${elements.copy.emotionalTriggers[0]}`);
  }

  // Add unified context
  parts.push(`Context: ${context}`);

  return parts.join('. ');
}

/**
 * Compose video prompt with full context
 */
function composeVideoPrompt(context, elements, options) {
  const parts = [options.basePrompt || 'Cinematic video scene'];

  // Add mechanism as central theme
  if (elements.mechanism?.name) {
    parts.push(`Theme: ${elements.mechanism.name}`);
  }

  // Add offer promise as visual goal
  if (elements.offer?.dreamOutcome) {
    parts.push(`Goal: ${elements.offer.dreamOutcome}`);
  }

  // Add copy hook as opening
  if (elements.copy?.hook) {
    parts.push(`Opening: ${elements.copy.hook}`);
  }

  // Add unified context
  parts.push(`Context: ${context}`);

  return parts.join('. ');
}

/**
 * Compose video script from strategic elements
 */
function composeVideoScript(elements, options) {
  const scriptParts = [];

  // Hook (0-2s)
  if (elements.copy?.hook) {
    scriptParts.push(`[0-2s] HOOK: ${elements.copy.hook}`);
  }

  // Mechanism introduction (2-4s)
  if (elements.mechanism?.name) {
    scriptParts.push(`[2-4s] MECHANISM: ${elements.mechanism.name} - ${elements.mechanism.description || ''}`);
  }

  // Offer value (4-6s)
  if (elements.offer?.dreamOutcome) {
    scriptParts.push(`[4-6s] OFFER: ${elements.offer.dreamOutcome}`);
  }

  // CTA (6-8s)
  if (elements.copy?.cta) {
    scriptParts.push(`[6-8s] CTA: ${elements.copy.cta}`);
  }

  return scriptParts.join('\n');
}

/**
 * Validate context completeness
 */
export function validateContextCompleteness(context) {
  const required = ['nicheContext', 'avatarProfile', 'mechanism', 'offer'];
  const missing = required.filter(field => !context[field]);

  return {
    isComplete: missing.length === 0,
    missing: missing,
    completeness: ((required.length - missing.length) / required.length) * 100
  };
}
