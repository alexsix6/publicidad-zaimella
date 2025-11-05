# MCP Enterprise Transformation Analysis
**Publicidad Zaimella → Generic Enterprise Content MCP**

**Generated**: 2025-11-04 00:15
**Status**: 🔍 ANALYSIS COMPLETE - Awaiting User Confirmation
**Goal**: Transform MCP from Zaimella-specific to generic enterprise-ready replicable system

---

## EXECUTIVE SUMMARY

### Current State: ✅ Skills-Integrated BUT Zaimella-Specific

**What's Working:**
- ✅ SkillDetector auto-loads 5 skills from creator_skills/
- ✅ ContentOrchestrator integrates all 5 skills in pipeline (Steps 6.5-7.5)
- ✅ Graceful degradation when skills unavailable
- ✅ MCP Server structure solid (4 tools exposed)

**What's Hardcoded (Zaimella-Specific):**
- ❌ **Niches hardcoded**: `['marketing-agency', 'e-commerce', 'real-estate', 'fitness', 'food-beverage', 'auto']`
- ❌ **Platforms hardcoded**: `['instagram', 'tiktok', 'linkedin', 'x-twitter', 'facebook']`
- ❌ **Context Profile integration missing**: Skills don't receive contextProfileId
- ❌ **Brand guidelines unused**: No extraction of color_spec, typography, Pantone colors
- ❌ **Platform specs unused**: toneOfVoice, demographics, bestPractices ignored
- ❌ **Digital Twin mode unsupported**: 75% threshold detection missing

### Business Impact

**Current limitation:**
> MCP works ONLY for Publicidad Zaimella projects with predefined niches/platforms

**Desired outcome:**
> MCP works for ANY client/project by:
> 1. Auto-detecting niches/platforms (NOT hardcoded lists)
> 2. Using Context Profiles (brand_guidelines, platformSpecs)
> 3. Supporting ANY industry (same generic extraction as skills)
> 4. Replicable deployment (1 MCP → N clients)

---

## ARCHITECTURAL ANALYSIS

### Current Architecture (Zaimella-Specific)

```
┌─────────────────────────────────────────────────────────────┐
│ MCP Server: publicidad-zaimella-content-generator           │
│ Purpose: Content generation for Zaimella clients only       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4 Tools Exposed                                              │
│ - generate_complete_content (hardcoded niches)              │
│ - analyze_content_context                                    │
│ - get_niche_insights (6 niches only)                        │
│ - check_cache_status                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ ContentOrchestrator (9-step pipeline)                        │
│                                                               │
│ Step 1: Context Gathering                                    │
│ Step 2: Cache Check                                          │
│ Step 3: Niche Context (hardcoded 6 niches)                  │
│ Step 4: Product Image                                        │
│ Step 5: Avatar Image                                         │
│ Step 6: Video                                                │
│ Step 6.5: Customer Avatar (avatar-construction skill)       │
│ Step 6.6: Unique Mechanism (unique-mechanism-generator)     │
│ Step 6.7: Grand Slam Offer (grand-slam-offer-generator)     │
│ Step 7: Copy (ad-copy-generation skill)                     │
│ Step 7.5: Landing Page (landing-page-structure skill)       │
│ Step 8: Variants                                             │
│ Step 9: Cache Store                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Existing APIs (localhost:3000)                               │
│ - /api/generate-image (FLUX.1 Kontext Max)                  │
│ - /api/generate-video (Veo3)                                 │
│ - /api/context-profiles (Context Profile Manager)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Hardcoded Data (Zaimella-Specific)                          │
│ - niches/ (6 JSON files: fitness.json, auto.json, etc.)    │
│ - platformSpecs in config (5 platforms hardcoded)           │
│ - NO contextProfileId passing to skills                     │
└─────────────────────────────────────────────────────────────┘
```

**Problems:**
1. **Niche-locked**: Only 6 niches work (marketing, e-commerce, real-estate, fitness, food, auto)
2. **Platform-locked**: Only 5 platforms (Instagram, TikTok, LinkedIn, X, Facebook)
3. **No brand guidelines**: Skills don't extract Pantone colors, typography
4. **No context profiles**: contextProfileId not passed from MCP → Skills
5. **Not replicable**: Can't deploy for other clients without code changes

---

### Desired Architecture (Enterprise Generic)

```
┌─────────────────────────────────────────────────────────────┐
│ MCP Server: enterprise-content-generator                    │
│ Purpose: Generic content generation for ANY client          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4 Tools Exposed (Generic Interfaces)                        │
│ - generate_complete_content (ANY niche/platform)            │
│ - analyze_content_context (auto-detect niche/platform)      │
│ - get_niche_insights (generic extraction)                   │
│ - check_cache_status                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ ContentOrchestrator (9-step pipeline - ENHANCED)             │
│                                                               │
│ Step 0: Context Profile Resolution (NEW)                    │
│   - Receives contextProfileId OR auto-selects               │
│   - Loads Context Profile (brand_guidelines, platformSpecs) │
│   - Detects Digital Twin mode (≥75% threshold)              │
│                                                               │
│ Step 1-6: Unchanged (image/video generation)                │
│                                                               │
│ Step 6.5: Customer Avatar (ENHANCED)                        │
│   - Passes contextProfileId to skill ✅                      │
│   - Skill extracts brand_guidelines ✅                       │
│   - Digital Twin mode respected ✅                           │
│                                                               │
│ Step 6.6: Unique Mechanism (ENHANCED)                       │
│   - Passes contextProfileId to skill ✅                      │
│   - Uses avatar sophistication level ✅                      │
│                                                               │
│ Step 6.7: Grand Slam Offer (ENHANCED)                       │
│   - Passes contextProfileId + mechanism ✅                   │
│   - Integrates mechanism in offer ✅                         │
│                                                               │
│ Step 7: Copy (ENHANCED)                                      │
│   - Passes contextProfileId + platformSpecs ✅               │
│   - Uses real toneOfVoice/demographics ✅                    │
│                                                               │
│ Step 7.5: Landing Page (ENHANCED)                           │
│   - Passes contextProfileId ✅                               │
│   - Generates CSS with Pantone colors ✅                     │
│   - Outputs technical score (color accuracy ΔE < 2) ✅       │
│                                                               │
│ Step 8-9: Unchanged (variants + cache)                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Generic Pattern Extraction (Same as Skills)                 │
│ - NO hardcoded niches (works ANY industry)                  │
│ - NO hardcoded platforms (auto-detects from brief)          │
│ - Context Profile Manager integration (brand_guidelines)    │
│ - platformSpecs extracted from Context Profile              │
│ - Digital Twin mode auto-detected (4 criteria, ≥75%)        │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
1. **Industry-agnostic**: Works for insurance, SaaS, coaching, real estate, ANY industry
2. **Platform-flexible**: Supports ANY platform (not limited to 5)
3. **Brand-aligned**: Extracts Pantone colors, typography from Context Profiles
4. **Client-replicable**: 1 MCP deployment → N clients (each with own Context Profiles)
5. **Enterprise-grade**: Same quality as skills (90-95/100 scores)

---

## GAP ANALYSIS: MCP vs. Skills Generic Approach

### Skills Approach (✅ Generic & Enterprise-Grade)

**Example: unique-mechanism-generator**

```javascript
// ✅ GENERIC INPUT - Works ANY industry
async generate(input) {
  const { brief, avatar, nicheContext } = input;

  // ✅ NO hardcoded industry data
  // Extracts insights FROM brief + avatar dynamically

  // Generic extraction pattern
  const insights = this.extractInsights(brief, avatar);
  const painPoints = avatar.pain_points_and_desires.top_pain_points;
  const dreamOutcome = avatar.pain_points_and_desires.dream_outcome;
  const sophisticationLevel = avatar.market_sophistication.primary_level.level;

  // ✅ Todd Brown framework applied generically (ANY industry)
  const mechanismStrategy = this.selectStrategy(sophisticationLevel);

  // ✅ Industry-agnostic output
  return {
    mechanism: { name: "...", tagline: "...", strategy: "..." },
    three_pillars: [...],
    sophistication_rationale: "..."
  };
}
```

**Why Generic:**
- ❌ NO if (industry === 'fitness') { ... }
- ❌ NO hardcoded lists
- ✅ Extracts data FROM input dynamically
- ✅ Applies frameworks universally (Todd Brown, Hormozi)

---

### MCP Current Approach (❌ Hardcoded & Zaimella-Specific)

**Example: NicheManager**

```javascript
// ❌ HARDCODED niches
const SUPPORTED_NICHES = [
  'marketing-agency',
  'e-commerce',
  'real-estate',
  'fitness',
  'food-beverage',
  'auto'
];

// ❌ Fails for OTHER industries
async applyNicheContext(niche, contextData) {
  if (!SUPPORTED_NICHES.includes(niche)) {
    throw new Error(`Unsupported niche: ${niche}`);
  }

  // Load hardcoded niche file
  const nicheData = await this.loadNicheFile(niche); // niches/fitness.json
  return { ...contextData, niche_insights: nicheData };
}
```

**Problems:**
- ❌ Only 6 niches work
- ❌ SaaS, insurance, coaching → FAIL
- ❌ Requires code changes for new industries
- ❌ Not replicable to other clients

---

### MCP Desired Approach (✅ Generic Pattern Like Skills)

```javascript
// ✅ GENERIC niche handling
async applyNicheContext(brief, contextData) {
  // Auto-detect niche FROM brief (same as skills)
  const detectedNiche = this.detectNicheFromBrief(brief);

  // ✅ NO hardcoded niche files
  // Extract insights dynamically using NLP/semantic analysis
  const nicheInsights = await this.extractNicheInsights(brief, contextData);

  return {
    ...contextData,
    niche: detectedNiche, // e.g., "SaaS B2B" (not limited to 6)
    niche_insights: nicheInsights // Generic extraction
  };
}

// Generic extraction (same pattern as skills)
extractNicheInsights(brief, contextData) {
  return {
    target_audience: this.extractAudience(brief),
    pain_points: this.extractPainPoints(brief),
    value_proposition: this.extractValueProp(brief),
    competitors_landscape: this.analyzeCompetition(brief)
  };
}
```

**Why Generic:**
- ✅ Works for ANY industry (insurance, SaaS, coaching, etc.)
- ✅ No hardcoded lists
- ✅ Same pattern as skills (dynamic extraction)
- ✅ Replicable to other clients

---

## CRITICAL GAPS TO FIX

### GAP #1: Context Profile Integration (P0 - CRITICAL)

**Current State:**
```javascript
// content-orchestrator.js - Step 6.5
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

**Desired State:**
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

**Impact:** Skills can't access brand_guidelines, Pantone colors, typography
**Fix Time:** 15 minutes
**Priority:** P0 (CRITICAL)

---

### GAP #2: Hardcoded Niches (P0 - CRITICAL)

**Current State:**
```javascript
// mcp-config.json
"niches": {
  "supported": ["marketing-agency", "e-commerce", "real-estate", "fitness", "food-beverage", "auto"],
  "autoDetection": true // ❌ But ONLY for 6 niches
}
```

**Desired State:**
```javascript
"niches": {
  "mode": "generic", // ✅ Works ANY industry
  "autoDetection": true, // ✅ Detects from brief
  "extraction": "dynamic" // ✅ NO hardcoded files
}
```

**Fix Strategy:**
1. Remove hardcoded niche list
2. Implement generic niche detection (NLP/semantic analysis)
3. Remove niche JSON files (fitness.json, auto.json, etc.)
4. Use generic extraction pattern (same as skills)

**Impact:** MCP works for ANY industry, not just 6
**Fix Time:** 45 minutes
**Priority:** P0 (CRITICAL)

---

### GAP #3: Hardcoded Platforms (P1 - HIGH)

**Current State:**
```javascript
// mcp-config.json
"platforms": {
  "supported": ["instagram", "tiktok", "linkedin", "x-twitter", "facebook"]
}
```

**Desired State:**
```javascript
"platforms": {
  "mode": "generic", // ✅ Works ANY platform
  "autoDetection": true, // ✅ Detects from brief
  "specs": "context_profile" // ✅ Load from Context Profile
}
```

**Fix Strategy:**
1. Remove hardcoded platform list
2. Extract platformSpecs from Context Profile (toneOfVoice, demographics, bestPractices)
3. Auto-detect platform from brief if not specified

**Impact:** Supports ANY platform, not just 5
**Fix Time:** 30 minutes
**Priority:** P1 (HIGH)

---

### GAP #4: Brand Guidelines Unused (P0 - CRITICAL)

**Current State:**
- Landing Page skill generates HTML structure but NO CSS
- NO Pantone color extraction
- NO typography specs
- NO technical score (color accuracy ΔE < 2)

**Desired State:**
```javascript
// Landing Page output with brand guidelines
{
  hero: {
    elements: {...},
    css_code: `
      .hero {
        background-color: #005EB8; /* Pantone 2935 C */
        font-family: 'Poppins Bold', sans-serif;
        line-height: 110%;
      }
    `,
    technical_score: {
      color_accuracy: 'ΔE < 2 (Pantone-matched)',
      typography_compliance: '100%',
      brand_alignment: '95%'
    }
  }
}
```

**Impact:** Landing pages lack technical quality expected for enterprise
**Fix Time:** 45 minutes (Phase 2 from SKILL_INTEGRATION_GAPS_AND_CORRECTIONS.md)
**Priority:** P0 (CRITICAL)

---

### GAP #5: Digital Twin Mode Unsupported (P1 - HIGH)

**Current State:**
- MCP doesn't detect Digital Twin mode (75% threshold)
- Skills don't receive validation_rules (ΔE < 2, ±1 mm, 100% text accuracy)
- No product_specifications usage

**Desired State:**
```javascript
// Step 0: Context Profile Resolution
const profile = await contextProfileManager.loadProfile(contextProfileId);
const isDigitalTwin = contextProfileManager.isDigitalTwinProfile(profile);

if (isDigitalTwin) {
  console.log('🎯 Digital Twin mode detected - High-precision requirements');
  const validationRules = profile.context.validation_rules;
  // Pass to all skills
}
```

**Impact:** Can't leverage high-precision Digital Twin profiles
**Fix Time:** 30 minutes
**Priority:** P1 (HIGH)

---

### GAP #6: Platform Specs Unused in Ad Copy (P1 - HIGH)

**Current State:**
```javascript
// ad-copy-generation skill receives generic platform string
await copySkill.generate({
  brief,
  avatar,
  platform: 'instagram' // ❌ NO platformSpecs (toneOfVoice, demographics)
});
```

**Desired State:**
```javascript
// Extract platformSpecs from Context Profile
const platformSpecs = profile.context.platform_specifications[platform];

await copySkill.generate({
  brief,
  avatar,
  platform: 'instagram',
  platformSpecs: platformSpecs // ✅ toneOfVoice, demographics, bestPractices
});
```

**Impact:** Ad copy not optimized for platform-specific requirements
**Fix Time:** 30 minutes
**Priority:** P1 (HIGH)

---

## ENTERPRISE TRANSFORMATION PLAN

### Phase 1: Context Profile Integration (P0 - 45 min)

**Goal:** Connect MCP → Skills via contextProfileId

**Steps:**

**1.1. Add Step 0 to ContentOrchestrator**
```javascript
// NEW Step 0: Context Profile Resolution
await this.executeStep('context_profile_resolution', async () => {
  let contextProfileId = session.config.contextProfileId;

  // Auto-select if not provided
  if (!contextProfileId) {
    const autoSelection = await this.contextProfileManager.autoSelectProfile(
      session.config.brief,
      'image'
    );
    contextProfileId = autoSelection.profileId;
    console.log(`🔍 Auto-selected Context Profile: ${contextProfileId}`);
  }

  // Load profile
  const profile = await this.contextProfileManager.loadProfile(contextProfileId);

  // Detect Digital Twin mode
  const isDigitalTwin = this.contextProfileManager.isDigitalTwinProfile(profile);

  return {
    contextProfileId,
    profile,
    isDigitalTwin,
    brand_guidelines: profile.context.brand_guidelines || {},
    platform_specifications: profile.context.platform_specifications || {}
  };
});
```

**1.2. Modify all skill calls to pass contextProfileId**
```javascript
// Step 6.5: Customer Avatar
await avatarSkill.generate({
  brief,
  nicheContext,
  industry,
  contextProfileId: session.results.context_profile_resolution.contextProfileId // ✅
});

// Step 6.6: Unique Mechanism
await mechanismSkill.generate({
  brief,
  avatar,
  nicheContext,
  contextProfileId: session.results.context_profile_resolution.contextProfileId // ✅
});

// Step 6.7: Grand Slam Offer
await offerSkill.generate({
  brief,
  avatar,
  uniqueMechanism,
  pricing,
  contextProfileId: session.results.context_profile_resolution.contextProfileId // ✅
});

// Step 7: Ad Copy
await copySkill.generate({
  brief,
  avatar,
  platform,
  contextProfileId: session.results.context_profile_resolution.contextProfileId, // ✅
  platformSpecs: session.results.context_profile_resolution.platform_specifications[platform] // ✅
});

// Step 7.5: Landing Page
await lpSkill.generate({
  brief,
  avatar,
  offer,
  adCopy,
  contextProfileId: session.results.context_profile_resolution.contextProfileId // ✅
});
```

**Validation:**
```javascript
// Test with Prudential Digital Twin profile
const result = await orchestrator.generateCompleteContent({
  brief: 'Launch insurance product',
  contextProfileId: 'prudential_product_photography_1752994608940'
});

// Validate
assert(result.customer_avatar_profile.brand_alignment !== undefined);
assert(result.landing_page_structure.hero.css_code.includes('#005EB8')); // Pantone hex
assert(result.landing_page_structure.technical_score.color_accuracy === 'ΔE < 2');
```

**Checkpoint:** ✅ Skills receive contextProfileId and extract brand_guidelines

---

### Phase 2: Generic Niche Handling (P0 - 45 min)

**Goal:** Remove hardcoded niches, implement generic extraction

**Steps:**

**2.1. Remove hardcoded niche list from mcp-config.json**
```javascript
// OLD (Zaimella-specific)
"niches": {
  "supported": ["marketing-agency", "e-commerce", "real-estate", "fitness", "food-beverage", "auto"]
}

// NEW (Generic)
"niches": {
  "mode": "generic",
  "autoDetection": true,
  "extraction": "dynamic"
}
```

**2.2. Modify NicheManager to use generic detection**
```javascript
// niche-manager.js
async detectNiche(brief) {
  // Generic NLP-based detection (NOT hardcoded list)
  const keywords = this.extractKeywords(brief);
  const industry = this.classifyIndustry(keywords);

  return {
    detected_niche: industry, // e.g., "SaaS B2B", "Insurance", "Coaching"
    confidence: 0.85,
    keywords: keywords
  };
}

async applyNicheContext(brief, contextData) {
  // ✅ NO hardcoded niche files
  const nicheInsights = await this.extractNicheInsights(brief, contextData);

  return {
    ...contextData,
    niche: nicheInsights.detected_niche,
    niche_insights: nicheInsights
  };
}

extractNicheInsights(brief, contextData) {
  // Generic extraction pattern (same as skills)
  return {
    target_audience: this.extractAudience(brief),
    pain_points: this.extractPainPoints(brief),
    value_proposition: this.extractValueProp(brief),
    competitors_landscape: this.analyzeCompetition(brief)
  };
}
```

**2.3. Delete niche JSON files**
```bash
rm /mnt/d/Dev/publicidad-zaimella/mcp/niches/*.json
```

**Validation:**
```javascript
// Test with NON-hardcoded industry
const result = await orchestrator.generateCompleteContent({
  brief: 'Launch SaaS project management tool for remote teams'
  // ✅ Should work (SaaS NOT in original 6 niches)
});

assert(result.niche_context.niche === 'SaaS' || result.niche_context.niche.includes('Software'));
```

**Checkpoint:** ✅ MCP works for ANY industry, not just 6 niches

---

### Phase 3: Generic Platform Handling (P1 - 30 min)

**Goal:** Remove hardcoded platforms, use Context Profile platformSpecs

**Steps:**

**3.1. Remove hardcoded platform list**
```javascript
// mcp-config.json
// OLD
"platforms": {
  "supported": ["instagram", "tiktok", "linkedin", "x-twitter", "facebook"]
}

// NEW
"platforms": {
  "mode": "generic",
  "autoDetection": true,
  "specs_source": "context_profile"
}
```

**3.2. Extract platformSpecs from Context Profile**
```javascript
// Step 0: Context Profile Resolution (ENHANCED)
const platformSpecs = profile.context.platform_specifications || {};

// Example: platformSpecs
{
  "instagram": {
    "toneOfVoice": "casual, visual-first, community-focused",
    "demographics": "Millennials and Gen Z, visual-oriented",
    "bestPractices": ["Use high-quality visuals", "Include hashtags"]
  },
  "linkedin": {
    "toneOfVoice": "professional, authoritative, insightful",
    "demographics": "Working professionals, B2B decision makers",
    "bestPractices": ["Share professional insights", "Use data"]
  }
}
```

**Validation:**
```javascript
// Test with ANY platform
const result = await orchestrator.generateCompleteContent({
  brief: 'Launch product',
  platforms: ['instagram', 'youtube', 'pinterest'], // ✅ Works ANY platform
  contextProfileId: 'prudential_product_photography_1752994608940'
});

assert(result.copy_generation.variants[0].platform_optimization.toneOfVoice !== undefined);
```

**Checkpoint:** ✅ MCP supports ANY platform, not just 5

---

### Phase 4: Enterprise MCP Rename & Repackaging (P2 - 30 min)

**Goal:** Rename from "publicidad-zaimella" to "enterprise-content-generator"

**Steps:**

**4.1. Rename package.json**
```javascript
{
  "name": "@enterprise/content-generator-mcp",
  "version": "2.0.0",
  "description": "Generic enterprise-grade MCP for content generation (ANY client/industry)"
}
```

**4.2. Rename mcp-config.json server name**
```javascript
{
  "server": {
    "name": "enterprise-content-generator",
    "version": "2.0.0",
    "description": "Generic content generation MCP for ANY industry"
  }
}
```

**4.3. Update Claude Desktop config**
```javascript
// User's claude_desktop_config.json
{
  "mcpServers": {
    "enterprise-content-generator": {
      "command": "node",
      "args": ["/mnt/d/Dev/publicidad-zaimella/mcp/server.js"]
    }
  }
}
```

**Validation:**
- ✅ MCP name reflects generic purpose
- ✅ No "Zaimella" references in public interfaces

**Checkpoint:** ✅ MCP renamed for enterprise deployment

---

## REPLICABILITY DESIGN

### Deployment Pattern: 1 MCP → N Clients

```
┌─────────────────────────────────────────────────────────────┐
│ SINGLE MCP DEPLOYMENT                                        │
│ /mnt/d/Dev/enterprise-content-generator/ (shared codebase)  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT-SPECIFIC DATA (Separate Directories)                 │
│                                                               │
│ /mnt/d/Dev/clients/                                          │
│   ├── zaimella/                                              │
│   │   ├── context-profiles/                                 │
│   │   │   ├── premium_product_1753107444269.json            │
│   │   │   └── prudential_product_1752994608940.json         │
│   │   └── .env (API keys, Zaimella-specific config)         │
│   │                                                           │
│   ├── cliente-b/                                             │
│   │   ├── context-profiles/                                 │
│   │   │   ├── saas_dashboard_1755555555555.json             │
│   │   │   └── enterprise_landing_1755666666666.json         │
│   │   └── .env (Cliente B API keys)                         │
│   │                                                           │
│   └── cliente-c/                                             │
│       ├── context-profiles/                                  │
│       │   └── coaching_program_1755777777777.json            │
│       └── .env (Cliente C API keys)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ MCP RUNTIME BEHAVIOR                                         │
│                                                               │
│ 1. User calls MCP tool with contextProfileId                │
│ 2. MCP loads Context Profile from client-specific directory │
│ 3. MCP extracts brand_guidelines (Pantone, typography)      │
│ 4. MCP passes to skills (generic skills work ANY client)    │
│ 5. Skills generate client-specific output                   │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ 1 codebase → N clients
- ✅ Client data isolated (security)
- ✅ Skills reusable across clients
- ✅ Easy to add new client (just add directory + Context Profiles)

---

## SUCCESS CRITERIA

### Technical
- ✅ MCP passes contextProfileId to all 5 skills
- ✅ Skills extract brand_guidelines (Pantone colors, typography)
- ✅ Skills detect Digital Twin mode (≥75% threshold)
- ✅ Landing Page generates CSS with Pantone hex colors
- ✅ Ad Copy uses platformSpecs (toneOfVoice, demographics, bestPractices)
- ✅ NO hardcoded niches (works ANY industry)
- ✅ NO hardcoded platforms (works ANY platform)

### Business
- ✅ MCP replicable: 1 deployment → N clients
- ✅ Client-specific outputs: brand-aligned (Pantone, typography)
- ✅ Enterprise-grade quality: 90-95/100 scores (same as skills)
- ✅ Time savings: 20.5 hours per campaign (97% faster than manual)

### Architectural Alignment
- ✅ Same generic pattern as skills (dynamic extraction, NO hardcoding)
- ✅ Context Profile integration (brand_guidelines, platformSpecs)
- ✅ Digital Twin support (high-precision mode)
- ✅ Graceful degradation (fallback if Context Profile unavailable)

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Context Profile Integration (45 min) - P0
- [ ] 1.1. Add Step 0 to ContentOrchestrator (Context Profile Resolution)
- [ ] 1.2. Import contextProfileManager in ContentOrchestrator
- [ ] 1.3. Modify Step 6.5 (avatar) to pass contextProfileId
- [ ] 1.4. Modify Step 6.6 (mechanism) to pass contextProfileId
- [ ] 1.5. Modify Step 6.7 (offer) to pass contextProfileId
- [ ] 1.6. Modify Step 7 (copy) to pass contextProfileId + platformSpecs
- [ ] 1.7. Modify Step 7.5 (landing) to pass contextProfileId
- [ ] ✅ Validate: Skills receive contextProfileId and extract brand_guidelines

### Phase 2: Generic Niche Handling (45 min) - P0
- [ ] 2.1. Remove hardcoded niche list from mcp-config.json
- [ ] 2.2. Implement detectNiche() with generic NLP
- [ ] 2.3. Implement extractNicheInsights() with dynamic extraction
- [ ] 2.4. Delete niche JSON files (fitness.json, auto.json, etc.)
- [ ] ✅ Validate: MCP works for NON-hardcoded industries (SaaS, insurance)

### Phase 3: Generic Platform Handling (30 min) - P1
- [ ] 3.1. Remove hardcoded platform list from mcp-config.json
- [ ] 3.2. Extract platformSpecs from Context Profile
- [ ] 3.3. Pass platformSpecs to ad-copy-generation skill
- [ ] ✅ Validate: Platform specs used in copy generation

### Phase 4: Enterprise Rename (30 min) - P2
- [ ] 4.1. Rename package.json to "enterprise-content-generator-mcp"
- [ ] 4.2. Rename mcp-config.json server name
- [ ] 4.3. Update Claude Desktop config
- [ ] ✅ Validate: MCP renamed for generic deployment

### Phase 5: Skill Integration Corrections (2.5 hours) - P0
- [ ] 5.1. Phase 1 from SKILL_INTEGRATION_GAPS_AND_CORRECTIONS.md (Foundation)
- [ ] 5.2. Phase 2 from SKILL_INTEGRATION_GAPS_AND_CORRECTIONS.md (CSS + Pantone)
- [ ] 5.3. Phase 3 from SKILL_INTEGRATION_GAPS_AND_CORRECTIONS.md (Platform Specs)
- [ ] 5.4. Phase 4 from SKILL_INTEGRATION_GAPS_AND_CORRECTIONS.md (Digital Twin)
- [ ] ✅ Validate: End-to-end test with Prudential Digital Twin profile

---

## ESTIMATED TIMELINE

| Phase | Time | Priority | Dependencies |
|-------|------|----------|--------------|
| **Phase 1: Context Profile Integration** | 45 min | P0 | None |
| **Phase 2: Generic Niche Handling** | 45 min | P0 | Phase 1 |
| **Phase 3: Generic Platform Handling** | 30 min | P1 | Phase 1 |
| **Phase 4: Enterprise Rename** | 30 min | P2 | Phases 1-3 |
| **Phase 5: Skill Integration Corrections** | 2.5h | P0 | Phase 1 |
| **TOTAL** | **5 hours** | - | - |

---

## NEXT STEPS

**IMMEDIATE:** Awaiting user confirmation to proceed with implementation

**Questions for User:**
1. ✅ Proceed with Phase 1 (Context Profile Integration)?
2. ✅ Proceed with Phase 2 (Remove hardcoded niches)?
3. ✅ Target: Complete generic transformation in 5 hours?

---

**Document Status:** ✅ COMPLETE - Ready for Implementation
**Approval:** Awaiting user confirmation
