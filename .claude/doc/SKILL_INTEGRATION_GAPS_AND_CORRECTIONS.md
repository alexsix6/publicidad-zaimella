# SKILL INTEGRATION GAPS AND CORRECTIONS
**Publicidad Zaimella - Claude Skills Real Integration**

**Generated:** 2025-11-03
**Status:** 🔴 CRITICAL GAPS IDENTIFIED - Requires Methodical Correction
**Project:** `/mnt/d/Dev/publicidad-zaimella`

---

## EXECUTIVE SUMMARY

### Current Status
✅ **Phase 1 Complete:** Basic skills structure implemented (avatar-construction, ad-copy-generation, landing-page-structure)
✅ **Phase 1 Complete:** SkillDetector auto-loading system functional
✅ **Phase 1 Complete:** ContentOrchestrator integration with Skill-First with Fallback pattern
🔴 **Phase 2 BLOCKED:** Skills NOT integrated with real architecture

### Critical Issue
The implemented skills generate **basic JSON structures** but are **NOT connected** to the real system:
- ❌ No Context Profile Manager integration
- ❌ No brand_guidelines extraction (Pantone colors, typography)
- ❌ No platform specs consumption (toneOfVoice, demographics, bestPractices)
- ❌ No Digital Twin mode support (75% threshold detection)
- ❌ No FLUX/Veo3 API-compatible prompt generation
- ❌ Landing page lacks technical score output with CSS code

### Business Impact
**Without corrections:**
- Skills produce "genérico" outputs, not aligned to brand requirements
- No Pantone color accuracy (ΔE < 2 tolerance required for Digital Twin)
- No platform-optimized copy (hardcoded platformSpecs unused)
- Landing pages lack CSS implementation with brand colors
- Skills cannot leverage existing Context Profiles (3 profiles available)

**User feedback:**
> "si testeas estas cosas basicas logicamente va a pasar todo satisfactoriamente pero si realmente evaluas la integridad y su funcionalidad, que pasaría?"

> "necesito que revises en la memoria cual es el score tecnico ideal con el cual trabajo mis arquitecturas web, hay paletas de colores y detalles tecnicos"

---

## GAP ANALYSIS

### GAP #1: No Context Profile Manager Integration
**Severity:** 🔴 CRITICAL (P0)
**Affects:** All 3 skills
**Impact:** Skills cannot access brand_guidelines, product_specifications, validation_rules

**Current State:**
```javascript
// avatar-construction/v1.0.0/index.js
async generate(input) {
  const { brief, nicheContext, industry } = input;
  // Generates basic structure - NO Context Profile access
  return { demographics: {...}, psychographics: {...} };
}
```

**Expected State:**
```javascript
// Skills should receive contextProfileId and load real data
async generate(input) {
  const { brief, nicheContext, industry, contextProfileId } = input;

  // Load Context Profile
  const profile = await contextProfileManager.loadProfile(contextProfileId);

  // Extract brand_guidelines
  const brandGuidelines = profile.context.brand_guidelines;
  const colorSpec = brandGuidelines.color_spec; // Pantone colors
  const typography = brandGuidelines.typography; // Font specs

  // Use real data in generation
  return {
    demographics: {...},
    brand_alignment: {
      colors: colorSpec,
      typography: typography,
      tone: brandGuidelines.values
    }
  };
}
```

**Root Cause:**
- Skills defined `input` interface without `contextProfileId` parameter
- No import of `contextProfileManager` in skill files
- ContentOrchestrator doesn't pass contextProfileId to skills

**Correction Required:**
1. Add `contextProfileId` parameter to all skill inputs
2. Import `contextProfileManager` in skill files
3. Load profile at skill initialization
4. Extract and use brand_guidelines data

---

### GAP #2: Landing Page - No Brand Guidelines + Pantone Colors
**Severity:** 🔴 CRITICAL (P0)
**Affects:** landing-page-structure skill
**Impact:** No CSS code generation, no Pantone colors, no technical score

**Current State:**
```javascript
// landing-page-structure/v1.0.0/index.js
buildHeroSection(insights, adCopy) {
  return {
    section_name: 'Hero',
    elements: {
      headline: insights.headline,
      hero_image: '[Image: Hero visual showing transformation]',
      cta_button: { text: 'Yes, I Want This →', style: 'primary' }
    },
    html_structure: '<section class="hero">...</section>'
  };
}
```

**Expected State:**
```javascript
buildHeroSection(insights, adCopy, brandGuidelines) {
  const colorSpec = brandGuidelines.color_spec;
  const typography = brandGuidelines.typography;

  return {
    section_name: 'Hero',
    elements: {
      headline: insights.headline,
      hero_image: '[Image: Hero visual]',
      cta_button: {
        text: 'Yes, I Want This →',
        style: 'primary',
        colors: {
          background: colorSpec.primary_blue.hex, // #005EB8
          text: colorSpec.white.hex, // #FFFFFF
          pantone: colorSpec.primary_blue.pantone // Pantone 2935 C
        }
      }
    },
    css_code: `
      .hero {
        background-color: ${colorSpec.primary_blue.hex};
        font-family: '${typography.primary_font}', sans-serif;
        line-height: ${typography.line_height};
      }
      .hero h1 {
        color: ${colorSpec.white.hex};
        font-size: ${typography.heading_size}px;
        letter-spacing: ${typography.tracking_pt}pt;
      }
    `,
    technical_score: {
      color_accuracy: 'ΔE < 2 (Pantone-matched)',
      typography_compliance: '100%',
      brand_alignment: '95%'
    }
  };
}
```

**Root Cause:**
- Skill doesn't extract `brand_guidelines.color_spec`
- No CSS generation logic
- No `typography` integration
- No technical score calculation

**Data Available in Context Profile:**
```json
{
  "context": {
    "brand_guidelines": {
      "color_spec": {
        "primary_blue": {
          "hex": "#005EB8",
          "pantone": "Pantone 2935 C",
          "cmyk": "100 -63 -0 -0"
        },
        "white": {
          "hex": "#FFFFFF",
          "pantone": "White"
        }
      },
      "typography": {
        "primary_font": "Poppins Bold",
        "tracking_pt": 0,
        "line_height": "110 %",
        "font_files": ["https://fonts.gstatic.com/..."]
      }
    }
  }
}
```

**Correction Required:**
1. Extract `brand_guidelines.color_spec` from Context Profile
2. Generate CSS code with Pantone hex colors
3. Include typography specifications
4. Calculate technical score (color_accuracy, typography_compliance, brand_alignment)
5. Add `css_code` and `technical_score` to output

---

### GAP #3: Ad Copy - No Platform Specs Usage
**Severity:** 🟠 HIGH (P1)
**Affects:** ad-copy-generation skill
**Impact:** Generic copy not optimized for platform-specific requirements

**Current State:**
```javascript
// ad-copy-generation/v1.0.0/index.js
async generate(input) {
  const { brief, avatar, platform } = input;

  // Generic platform logic
  const hookTypes = ['mechanism', 'proof', 'big_promise', 'enemy', 'curiosity'];

  return {
    variants: [
      {
        hook_type: 'mechanism',
        copy: {
          headline: 'Generic headline',
          subheadline: 'Generic subheadline'
        }
      }
    ]
  };
}
```

**Expected State:**
```javascript
async generate(input) {
  const { brief, avatar, platform } = input;

  // Load REAL platform specs from generate-image.js
  const platformSpecs = {
    instagram: {
      toneOfVoice: 'casual, visual-first, community-focused',
      demographics: 'Millennials and Gen Z, visual-oriented',
      bestPractices: ['Use high-quality visuals', 'Include hashtags', 'Engage with stories']
    },
    linkedin: {
      toneOfVoice: 'professional, authoritative, insightful, networking-focused',
      demographics: 'Working professionals, B2B decision makers',
      bestPractices: ['Share professional insights', 'Use data', 'Network professionally']
    }
  };

  const platformSpec = platformSpecs[platform];

  return {
    variants: [
      {
        hook_type: 'mechanism',
        copy: {
          headline: 'Platform-optimized headline',
          subheadline: 'Using toneOfVoice: ' + platformSpec.toneOfVoice
        },
        platform_optimization: {
          toneOfVoice: platformSpec.toneOfVoice,
          demographics: platformSpec.demographics,
          bestPractices: platformSpec.bestPractices
        }
      }
    ]
  };
}
```

**Data Available in generate-image.js:**
```javascript
const platformSpecs = {
  instagram: {
    formats: { post: '1:1', story: '9:16', reel: '9:16' },
    toneOfVoice: 'casual, visual-first, community-focused',
    demographics: 'Millennials and Gen Z, visual-oriented',
    bestPractices: ['Use high-quality visuals', 'Include hashtags', 'Engage with stories']
  },
  linkedin: {
    formats: { post: '1.91:1', article: '1.91:1' },
    toneOfVoice: 'professional, authoritative, insightful',
    demographics: 'Working professionals, B2B decision makers',
    bestPractices: ['Share professional insights', 'Use data', 'Network professionally']
  }
  // ... 5 platforms total
};
```

**Root Cause:**
- Skill has generic platform logic
- Doesn't import/use `platformSpecs` from generate-image.js
- No `toneOfVoice` extraction
- No `demographics` matching
- No `bestPractices` application

**Correction Required:**
1. Extract `platformSpecs` from generate-image.js to shared file
2. Import in ad-copy-generation skill
3. Use `toneOfVoice` to adjust copy style
4. Match `demographics` to avatar data
5. Include `bestPractices` recommendations in output

---

### GAP #4: No Digital Twin Mode Support
**Severity:** 🟠 HIGH (P1)
**Affects:** All skills
**Impact:** Cannot leverage high-precision Digital Twin profiles (75% threshold)

**Current State:**
- Skills don't detect Digital Twin mode
- No validation_rules extraction (ΔE < 2, ±1 mm, 100% text accuracy)
- No product_specifications usage

**Expected State:**
```javascript
async generate(input) {
  const { contextProfileId } = input;

  const profile = await contextProfileManager.loadProfile(contextProfileId);
  const isDigitalTwin = contextProfileManager.isDigitalTwinProfile(profile);

  if (isDigitalTwin) {
    // High-precision mode
    const validationRules = profile.context.validation_rules;
    const productSpecs = profile.context.product_specifications;

    return {
      ...output,
      digital_twin_mode: true,
      validation_requirements: {
        color_tolerance: validationRules.tolerance.color, // ΔE < 2
        dimension_tolerance: validationRules.tolerance.dimensions_mm, // ±1 mm
        text_accuracy: validationRules.tolerance.text_accuracy // 100%
      },
      product_specs: productSpecs
    };
  }
}
```

**Digital Twin Detection (4 Criteria):**
1. `product_specifications.pack_dimensions_mm` present
2. `brand_guidelines.color_spec` present (Pantone colors)
3. `technical_preferences.color_accuracy` defined
4. `user_preferences.lighting` includes 'studio'

**Score ≥ 75% (3/4 criteria) = Digital Twin Mode**

**Correction Required:**
1. Check `isDigitalTwinProfile()` before generation
2. Extract `validation_rules` if Digital Twin
3. Extract `product_specifications` if Digital Twin
4. Include precision requirements in output

---

### GAP #5: No FLUX/Veo3 API Compatibility
**Severity:** 🟡 MEDIUM (P2)
**Affects:** All skills (prompt generation)
**Impact:** Generated prompts not compatible with existing APIs

**Current State:**
- Skills generate text outputs (headlines, copy)
- No prompt formatting for FLUX.1 Kontext Max
- No prompt formatting for Veo3 video generation

**Expected State:**
```javascript
// Skills should generate API-compatible prompts
return {
  ...output,
  flux_prompt: {
    prompt: finalPrompt, // Enhanced by context-enhancer.js
    contextProfileId: contextProfileId,
    aspectRatio: '16:9',
    outputFormat: 'png',
    platform: 'instagram',
    format: 'post'
  },
  veo3_prompt: {
    prompt: videoPrompt,
    duration: 5,
    aspectRatio: '9:16'
  }
};
```

**APIs Available:**
- `generateImageWithFlux(prompt, inputImage, model, aspectRatio, outputFormat)` in replicate-client.js
- `contextProfileManager.applyContextToPrompt(prompt, profileId)` for enhancement
- `enhancePrompt(prompt, type, model, enhanceEnabled, useKnowledge, platformContext)` in openrouter-client.js

**Correction Required:**
1. Generate prompts in FLUX-compatible format
2. Call `contextProfileManager.applyContextToPrompt()` for enhancement
3. Include `aspectRatio`, `platform`, `format` parameters
4. Return structured `flux_prompt` and `veo3_prompt` objects

---

### GAP #6: ContentOrchestrator - No Context Profile Passing
**Severity:** 🔴 CRITICAL (P0)
**Affects:** ContentOrchestrator
**Impact:** Skills receive NO contextProfileId parameter

**Current State:**
```javascript
// content-orchestrator.js
async generateCustomerAvatarProfile(brief, nicheContext) {
  const avatarSkill = this.skillDetector.getSkill('avatar-construction');
  const avatarProfile = await avatarSkill.generate({
    brief,
    nicheContext,
    industry: nicheContext.niche
    // ❌ NO contextProfileId passed
  });
}
```

**Expected State:**
```javascript
async generateCustomerAvatarProfile(brief, nicheContext, contextProfileId) {
  const avatarSkill = this.skillDetector.getSkill('avatar-construction');
  const avatarProfile = await avatarSkill.generate({
    brief,
    nicheContext,
    industry: nicheContext.niche,
    contextProfileId: contextProfileId // ✅ Pass contextProfileId
  });
}
```

**Root Cause:**
- ContentOrchestrator methods don't receive `contextProfileId` parameter
- No `contextProfileManager` import in ContentOrchestrator
- No auto-selection logic if contextProfileId not provided

**Correction Required:**
1. Add `contextProfileId` parameter to all ContentOrchestrator methods
2. Import `contextProfileManager`
3. Implement auto-selection fallback:
   ```javascript
   if (!contextProfileId) {
     const autoSelection = await contextProfileManager.autoSelectProfile(brief, 'image');
     contextProfileId = autoSelection.profileId;
   }
   ```
4. Pass `contextProfileId` to all skill calls

---

### GAP #7: No Validation Against Real Data
**Severity:** 🟡 MEDIUM (P2)
**Affects:** Testing suite
**Impact:** Tests pass with basic data but don't validate real integration

**Current Test:**
```javascript
// test-skills-integration.js
const avatarResult = await avatarSkill.generate({
  brief: 'Launch premium fitness coaching',
  industry: 'fitness'
  // ❌ NO contextProfileId, no real data validation
});
```

**Expected Test:**
```javascript
// Test with REAL Context Profile
const avatarResult = await avatarSkill.generate({
  brief: 'Launch premium fitness coaching',
  industry: 'fitness',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

// Validate brand_guidelines extracted
assert(avatarResult.brand_alignment.colors.primary_blue.hex === '#005EB8');
assert(avatarResult.brand_alignment.colors.primary_blue.pantone === 'Pantone 2935 C');

// Validate Digital Twin mode detected
assert(avatarResult.digital_twin_mode === true);
```

**Correction Required:**
1. Update test suite to use real Context Profiles
2. Add assertions for brand_guidelines extraction
3. Add assertions for Digital Twin mode detection
4. Test with Prudential profile (Digital Twin)

---

## METHODOLOGICAL CORRECTION PLAN

### Philosophy: "Un Paso a la Vez para Llegar a la Integralidad"

**Principles:**
1. ✅ **Build incrementally** - One gap at a time
2. ✅ **Validate immediately** - Test after each correction
3. ✅ **No disconnections** - Ensure architectural alignment at each step
4. ✅ **Real data only** - Test with actual Context Profiles

---

### PHASE 1: Foundation - Context Profile Integration (P0)
**Goal:** Connect skills to ContextProfileManager
**Time:** 30 minutes
**Dependencies:** None

**Steps:**

**1.1. Modify avatar-construction skill**
- Add `contextProfileId` parameter to `generate()` input
- Import `contextProfileManager`
- Load profile: `const profile = await contextProfileManager.loadProfile(contextProfileId)`
- Extract `brand_guidelines`
- Include in output: `brand_alignment` section

**Validation:**
```javascript
const result = await avatarSkill.generate({
  brief: 'Test',
  industry: 'fitness',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

assert(result.brand_alignment !== undefined);
assert(result.brand_alignment.colors !== undefined);
```

**1.2. Modify ad-copy-generation skill**
- Same pattern: Add `contextProfileId`, load profile, extract brand_guidelines
- Include in output: `brand_alignment` section

**Validation:**
```javascript
assert(result.brand_alignment !== undefined);
```

**1.3. Modify landing-page-structure skill**
- Same pattern: Add `contextProfileId`, load profile, extract brand_guidelines
- Store for use in Phase 2 (CSS generation)

**Validation:**
```javascript
assert(result.brand_alignment !== undefined);
```

**1.4. Modify ContentOrchestrator**
- Add `contextProfileId` parameter to all methods
- Import `contextProfileManager`
- Implement auto-selection fallback
- Pass `contextProfileId` to all skill calls

**Validation:**
```javascript
// Test auto-selection
const result = await orchestrator.generateCustomerAvatarProfile(brief, nicheContext);
// Should auto-select profile and pass to skill
```

**Checkpoint:** All skills can load Context Profiles ✅

---

### PHASE 2: Landing Page - CSS + Pantone Colors (P0)
**Goal:** Generate CSS code with Pantone colors
**Time:** 45 minutes
**Dependencies:** Phase 1 complete

**Steps:**

**2.1. Extract color_spec from brand_guidelines**
```javascript
const colorSpec = brandGuidelines.color_spec;
// colorSpec.primary_blue.hex = '#005EB8'
// colorSpec.primary_blue.pantone = 'Pantone 2935 C'
```

**2.2. Extract typography from brand_guidelines**
```javascript
const typography = brandGuidelines.typography;
// typography.primary_font = 'Poppins Bold'
// typography.line_height = '110 %'
// typography.tracking_pt = 0
```

**2.3. Modify buildHeroSection()**
- Add `brandGuidelines` parameter
- Generate CSS with hex colors
- Include typography specs
- Add Pantone references in comments

**2.4. Modify all 8 sections**
- Apply pattern to: hero, problem, solution, proof, offer, objections, guarantee, cta
- Generate CSS for each section

**2.5. Add technical_score calculation**
```javascript
technical_score: {
  color_accuracy: 'ΔE < 2 (Pantone-matched)',
  typography_compliance: '100%',
  brand_alignment: calculateBrandAlignment(brandGuidelines)
}
```

**Validation:**
```javascript
const result = await lpSkill.generate({
  brief: 'Test',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

// Validate CSS generated
assert(result.hero.css_code.includes('#005EB8')); // Pantone hex
assert(result.hero.css_code.includes('Poppins Bold')); // Typography

// Validate technical score
assert(result.technical_score.color_accuracy === 'ΔE < 2 (Pantone-matched)');
```

**Checkpoint:** Landing page generates CSS with Pantone colors ✅

---

### PHASE 3: Ad Copy - Platform Specs Integration (P1)
**Goal:** Use real platformSpecs from generate-image.js
**Time:** 30 minutes
**Dependencies:** Phase 1 complete

**Steps:**

**3.1. Extract platformSpecs to shared file**
- Create `/mnt/d/Dev/publicidad-zaimella/lib/platform-specs.js`
- Move `platformSpecs` from generate-image.js
- Export as named export

**3.2. Modify ad-copy-generation skill**
- Import `platformSpecs`
- Load spec for requested platform
- Extract: `toneOfVoice`, `demographics`, `bestPractices`

**3.3. Apply platform optimization**
- Adjust copy style based on `toneOfVoice`
- Match `demographics` to avatar data
- Include `bestPractices` in output

**Validation:**
```javascript
const result = await copySkill.generate({
  brief: 'Test',
  avatar: {...},
  platform: 'instagram',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

// Validate platform optimization
assert(result.variants[0].platform_optimization.toneOfVoice === 'casual, visual-first, community-focused');
assert(result.variants[0].platform_optimization.bestPractices.length === 3);
```

**Checkpoint:** Ad copy uses real platform specs ✅

---

### PHASE 4: Digital Twin Mode Support (P1)
**Goal:** Detect and respect Digital Twin profiles
**Time:** 30 minutes
**Dependencies:** Phase 1 complete

**Steps:**

**4.1. Add Digital Twin detection in avatar-construction**
```javascript
const isDigitalTwin = contextProfileManager.isDigitalTwinProfile(profile);

if (isDigitalTwin) {
  const validationRules = profile.context.validation_rules;
  output.digital_twin_mode = true;
  output.validation_requirements = validationRules.tolerance;
}
```

**4.2. Add in ad-copy-generation**
- Same pattern

**4.3. Add in landing-page-structure**
- Same pattern
- Include validation requirements in technical_score

**Validation:**
```javascript
const result = await avatarSkill.generate({
  brief: 'Test',
  contextProfileId: 'prudential_product_photography_1752994608940' // Digital Twin
});

// Validate Digital Twin detected
assert(result.digital_twin_mode === true);
assert(result.validation_requirements.color === 'ΔE < 2');
```

**Checkpoint:** Skills detect and respect Digital Twin mode ✅

---

### PHASE 5: FLUX/Veo3 API Compatibility (P2)
**Goal:** Generate API-compatible prompts
**Time:** 30 minutes
**Dependencies:** All previous phases complete

**Steps:**

**5.1. Modify landing-page-structure**
- Generate `flux_prompt` for hero section image
- Call `contextProfileManager.applyContextToPrompt()`
- Include `aspectRatio`, `platform`, `format`

**5.2. Modify ad-copy-generation**
- Generate `flux_prompt` for ad image
- Apply platform-specific aspect ratio from platformSpecs

**Validation:**
```javascript
const result = await lpSkill.generate({
  brief: 'Test',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

// Validate FLUX prompt generated
assert(result.hero.flux_prompt.prompt !== undefined);
assert(result.hero.flux_prompt.contextProfileId !== undefined);
assert(result.hero.flux_prompt.aspectRatio === '16:9');
```

**Checkpoint:** Skills generate API-compatible prompts ✅

---

### PHASE 6: End-to-End Validation with Real Data (P0)
**Goal:** Validate complete integration with Prudential profile
**Time:** 30 minutes
**Dependencies:** All previous phases complete

**Steps:**

**6.1. Update test suite**
- Use Prudential Context Profile (Digital Twin)
- Test all 3 skills
- Validate all corrections applied

**6.2. Create end-to-end test**
```javascript
// Test complete flow
const contextProfileId = 'prudential_product_photography_1752994608940';

// 1. Avatar
const avatar = await avatarSkill.generate({ brief, industry, contextProfileId });
assert(avatar.digital_twin_mode === true);
assert(avatar.brand_alignment.colors.primary_blue.hex === '#005EB8');

// 2. Ad Copy
const copy = await copySkill.generate({ brief, avatar, platform: 'instagram', contextProfileId });
assert(copy.variants[0].platform_optimization.toneOfVoice !== undefined);

// 3. Landing Page
const lp = await lpSkill.generate({ brief, avatar, offer, adCopy: copy, contextProfileId });
assert(lp.hero.css_code.includes('#005EB8'));
assert(lp.technical_score.color_accuracy === 'ΔE < 2 (Pantone-matched)');
assert(lp.hero.flux_prompt !== undefined);
```

**Validation:**
- All tests pass with real data ✅
- No disconnections found ✅
- Architectural alignment confirmed ✅

**Checkpoint:** Full integration validated with real Context Profile ✅

---

### PHASE 7: Claude Desktop Deployment (P2)
**Goal:** Document deployment instructions
**Time:** 15 minutes
**Dependencies:** Phase 6 complete

**Steps:**

**7.1. Document skill installation**
- Copy skills to Claude Desktop skills directory
- Document path: `~/.claude/skills/` or Windows equivalent

**7.2. Document usage instructions**
- How to invoke skills from Claude Desktop
- How to pass contextProfileId parameter

**7.3. Create deployment guide**
- Create `/mnt/d/Dev/creator_skills/DEPLOYMENT_CLAUDE_DESKTOP.md`

**Checkpoint:** Deployment documented ✅

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (P0) - 30 min
- [ ] 1.1. avatar-construction: Add contextProfileId + load profile
- [ ] 1.2. ad-copy-generation: Add contextProfileId + load profile
- [ ] 1.3. landing-page-structure: Add contextProfileId + load profile
- [ ] 1.4. ContentOrchestrator: Add contextProfileId parameter + auto-selection
- [ ] ✅ Validate: Skills load Context Profiles successfully

### Phase 2: CSS + Pantone (P0) - 45 min
- [ ] 2.1. Extract color_spec from brand_guidelines
- [ ] 2.2. Extract typography from brand_guidelines
- [ ] 2.3. Modify buildHeroSection() with CSS generation
- [ ] 2.4. Modify all 8 sections with CSS generation
- [ ] 2.5. Add technical_score calculation
- [ ] ✅ Validate: CSS generated with Pantone colors

### Phase 3: Platform Specs (P1) - 30 min
- [ ] 3.1. Extract platformSpecs to shared file
- [ ] 3.2. Import platformSpecs in ad-copy-generation
- [ ] 3.3. Apply platform optimization logic
- [ ] ✅ Validate: Platform specs used in copy generation

### Phase 4: Digital Twin (P1) - 30 min
- [ ] 4.1. Add Digital Twin detection in avatar-construction
- [ ] 4.2. Add Digital Twin detection in ad-copy-generation
- [ ] 4.3. Add Digital Twin detection in landing-page-structure
- [ ] ✅ Validate: Digital Twin mode detected and respected

### Phase 5: API Compatibility (P2) - 30 min
- [ ] 5.1. Generate flux_prompt in landing-page-structure
- [ ] 5.2. Generate flux_prompt in ad-copy-generation
- [ ] ✅ Validate: API-compatible prompts generated

### Phase 6: End-to-End Test (P0) - 30 min
- [ ] 6.1. Update test suite with Prudential profile
- [ ] 6.2. Create end-to-end test with all assertions
- [ ] ✅ Validate: All tests pass with real data

### Phase 7: Deployment (P2) - 15 min
- [ ] 7.1. Document skill installation
- [ ] 7.2. Document usage instructions
- [ ] 7.3. Create DEPLOYMENT_CLAUDE_DESKTOP.md
- [ ] ✅ Validate: Deployment guide complete

---

## RISK MITIGATION

### Risk #1: Breaking Changes
**Mitigation:** Run tests after each phase
**Rollback:** Git commit after each phase checkpoint

### Risk #2: Context Profile Not Available
**Mitigation:** Auto-selection fallback in ContentOrchestrator
**Fallback:** Use most-used profile if auto-selection fails

### Risk #3: Brand Guidelines Missing
**Mitigation:** Check if brand_guidelines exists before extraction
**Fallback:** Use default colors if not available

---

## SUCCESS CRITERIA

### Technical
- ✅ All skills load Context Profiles successfully
- ✅ CSS generated with Pantone hex colors
- ✅ Platform specs used in ad copy generation
- ✅ Digital Twin mode detected (≥75% threshold)
- ✅ API-compatible prompts generated
- ✅ All tests pass with Prudential profile

### Business
- ✅ Landing pages have technical score output
- ✅ Color accuracy: ΔE < 2 (Pantone-matched)
- ✅ Typography compliance: 100%
- ✅ Platform optimization: toneOfVoice + demographics + bestPractices
- ✅ Skills leverage existing Context Profiles (3 profiles)

### User Requirements Met
✅ "trabajar con datos reales con la configuración"
✅ "score tecnico ideal... paletas de colores y detalles tecnicos"
✅ "todo debe estar perfectamente alineado en la arquitectura"
✅ "construye un paso a la vez para llegar a la integralidad"
✅ "no quiero que al final te des cuenta que algo no esta conectado"

---

## NEXT STEPS

**IMMEDIATE:** Start Phase 1.1 - Modify avatar-construction skill
**Timeline:** 3 hours total (7 phases × 15-45 min)
**Validation:** Run test suite after each phase
**Completion:** End-to-end test with Prudential Digital Twin profile

---

**Document Status:** ✅ COMPLETE - Ready for Implementation
**Approval:** Awaiting user confirmation to proceed with Phase 1.1
