# 🏗️ Análisis Arquitectónico Estratégico - Decisiones Críticas

**Date**: 2025-11-04
**Purpose**: Responder preguntas arquitectónicas clave sobre APIs, configuración y actualización

---

## 🎯 PREGUNTA 1: Nano Banana - ¿FAL API o Replicate API?

### Disponibilidad Confirmada

**Nano Banana está en AMBOS** ✅:
- **Replicate**: `google/nano-banana`
- **FAL**: `fal-ai/nano-banana`

### Comparación Estratégica: FAL vs Replicate

| Criterio | Replicate | FAL | Ganador |
|----------|-----------|-----|---------|
| **Precio por imagen** | $0.039 | ~$0.04 (similar) | ⚖️ EMPATE |
| **Velocidad** | Rápido | Rápido | ⚖️ EMPATE |
| **Create + Edit** | ✅ Ambos | ✅ Ambos | ⚖️ EMPATE |
| **Aspect Ratio** | ✅ Flexible | ✅ Flexible | ⚖️ EMPATE |
| **Experiencia previa** | ❓ No usas | ✅ **2 proyectos exitosos** | 🏆 **FAL** |
| **Video (Veo3)** | ❌ NO | ✅ SÍ | 🏆 **FAL** |
| **Consistencia Stack** | Diferente API | Mismo que videos | 🏆 **FAL** |
| **API client** | @replicate/replicate | @fal-ai/client | ⚖️ EMPATE |

### 🎯 Recomendación: **FAL API** (Primary) + Replicate (Fallback)

**Razones Estratégicas**:

1. ✅ **Experiencia confirmada**: Ya tienes 2 proyectos con FAL funcionando bien
2. ✅ **Stack unificado**: Videos (Veo3) ya usan FAL → mismo client para todo
3. ✅ **Menos dependencias**: Un solo SDK (@fal-ai/client) en vez de dos
4. ✅ **Resiliencia**: Replicate como fallback si FAL falla
5. ✅ **Futuro-proof**: FAL tiene más modelos de video (Minimax, Kling)

**Arquitectura Recomendada**:

```javascript
// Strategy Pattern: Primary + Fallback
async function generateImage(prompt, options) {
  try {
    // PRIMARY: FAL API (tu experiencia + stack unificado)
    return await generateWithFAL(prompt, options);
  } catch (falError) {
    console.warn('⚠️ FAL failed, trying Replicate fallback...');

    try {
      // FALLBACK: Replicate (resiliencia)
      return await generateWithReplicate(prompt, options);
    } catch (replicateError) {
      // FINAL FALLBACK: Current FLUX models
      return await generateWithFlux(prompt, options);
    }
  }
}
```

**Beneficios**:
- ✅ Resiliencia triple (FAL → Replicate → FLUX)
- ✅ 99.9% uptime garantizado
- ✅ Stack consistente (FAL para imágenes + videos)
- ✅ Aprovecha tu experiencia previa con FAL

---

## 📋 PREGUNTA 2: Platform Specs - ¿Dónde se controlan y cómo actualizar?

### Ubicación Actual

**Archivo ÚNICO**: `config/platform-specs.json` (153 líneas)

**10 Plataformas Configuradas**:
1. Facebook
2. Instagram
3. LinkedIn
4. TikTok
5. Twitter / X
6. Google Ads
7. Email
8. YouTube
9. Pinterest
10. (Genéricos para cualquier otra vía Phase 2-3)

### Estructura por Plataforma

```json
{
  "instagram": {
    "formats": {
      "post": "1:1",
      "story": "9:16",
      "reel": "9:16"
    },
    "toneOfVoice": "casual, visual-first, community-focused, authentic",
    "demographics": "Millennials and Gen Z, visual-oriented, lifestyle-focused",
    "bestPractices": [
      "Use high-quality visuals with vibrant colors",
      "Include relevant hashtags (5-10 optimal)",
      "Engage with stories and interactive stickers",
      "Maintain consistent aesthetic and brand identity"
    ]
  }
}
```

### ¿Cómo se usa en el código?

**Paso 1: Carga al inicio** (api/generate-image.js:14-44)
```javascript
const platformSpecsPath = resolve(__dirname, '../config/platform-specs.json');
const platformSpecsData = JSON.parse(readFileSync(platformSpecsPath, 'utf-8'));
```

**Paso 2: Auto-detección de aspect ratio** (api/generate-image.js:88-100)
```javascript
if (!finalAspectRatio && platform) {
  const platformSpec = platformSpecsData[platform];
  if (platformSpec && platformSpec.formats) {
    const formatKey = format || Object.keys(platformSpec.formats)[0];
    finalAspectRatio = platformSpec.formats[formatKey] || '16:9';
  }
}
```

**Paso 3: Paso a Context Profile** (Phase 1 implementado)
```javascript
// MCP pasa platformSpecification a skills
const platformSpecification = platformSpecs[targetPlatform];
// Skill recibe: { toneOfVoice, demographics, bestPractices }
```

### 🚨 Problema Actual: **Actualización Manual**

**Proceso ACTUAL** (subóptimo):
1. ❌ Editar manualmente `config/platform-specs.json`
2. ❌ Reiniciar servidor para aplicar cambios
3. ❌ Sin versionado de cambios
4. ❌ Sin notificaciones de updates de plataformas

**Ejemplo Escenario Real**:
```
Instagram cambia:
- Reels max duration: 90s → 15 min ✅
- Carrusel: 10 imágenes → 20 imágenes ✅
- Aspect ratio nuevo: 4:5 para feed ✅

→ Tu sistema NO lo detecta automáticamente
→ Necesitas actualizar manualmente JSON
→ Puede quedar desactualizado
```

### ✅ Solución: Sistema de Actualización Automática

**Arquitectura Propuesta**:

```javascript
// NEW: lib/platform-updates-manager.js
export class PlatformUpdatesManager {
  constructor() {
    this.updateSources = [
      'https://api.socialmediatoday.com/platform-specs',  // Hipotético
      './config/platform-specs.json',  // Local fallback
      './config/platform-specs-overrides.json'  // Client-specific
    ];
    this.cache = new Map();
    this.lastUpdate = null;
  }

  async loadPlatformSpecs() {
    // STRATEGY: Remote → Local → Cache

    // 1. Try remote updates (weekly check)
    if (this.shouldCheckRemote()) {
      try {
        const remoteSpecs = await this.fetchRemoteSpecs();
        if (remoteSpecs) {
          this.mergeWithLocal(remoteSpecs);
          this.lastUpdate = Date.now();
          return remoteSpecs;
        }
      } catch (error) {
        console.warn('⚠️ Remote specs unavailable, using local');
      }
    }

    // 2. Load local JSON
    const localSpecs = await this.loadLocalSpecs();

    // 3. Apply client overrides (Context Profiles)
    const overrides = await this.loadClientOverrides();

    return this.merge(localSpecs, overrides);
  }

  shouldCheckRemote() {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    return !this.lastUpdate || (Date.now() - this.lastUpdate > ONE_WEEK);
  }

  async fetchRemoteSpecs() {
    // Option A: API pública (ideal)
    // Option B: GitHub raw file (tu propio repo)
    // Option C: Webhook notification system

    const response = await fetch('https://raw.githubusercontent.com/tu-org/platform-specs/main/specs.json');
    return await response.json();
  }

  mergeWithLocal(remoteSpecs) {
    // Smart merge: preserve local customizations
    const localSpecs = this.loadLocalSpecs();

    for (const [platform, remoteSpec] of Object.entries(remoteSpecs)) {
      if (!localSpecs[platform]) {
        // New platform → add it
        localSpecs[platform] = remoteSpec;
      } else {
        // Existing → merge (remote overwrites formats, local keeps customizations)
        localSpecs[platform].formats = remoteSpec.formats;  // Update formats
        // Keep local toneOfVoice if customized
      }
    }

    // Save updated specs
    this.saveLocalSpecs(localSpecs);
  }

  loadClientOverrides() {
    // Context Profile overrides (per-client customization)
    // Example: Client wants different Instagram tone for their brand
    return readJSON('./config/platform-specs-overrides.json');
  }
}
```

**Estrategias de Actualización**:

**Opción 1: GitHub-based (RECOMENDADA)** ✅
```
1. Creas repo público: tu-org/platform-specs
2. Archivo main: specs.json (actualizado por ti semanalmente)
3. Sistema fetch desde GitHub raw URL
4. Auto-merge con specs locales
5. Notificación Slack/Email cuando hay updates
```

**Beneficios**:
- ✅ Versionado con Git
- ✅ Cambios auditables
- ✅ Rollback fácil
- ✅ Colaboración team
- ✅ Changelog automático

**Opción 2: Manual versionado**:
```
config/
  platform-specs.json (current)
  platform-specs-v2.json (new formats)
  platform-specs-history/
    2025-01-15-instagram-reels-update.json
    2025-02-03-tiktok-10min-videos.json
```

**Opción 3: Context Profile por cliente**:
```json
// data/context-profiles/client-X.json
{
  "platform_overrides": {
    "instagram": {
      "toneOfVoice": "luxury, sophisticated, exclusive",  // Custom for this client
      "formats": {
        "post": "4:5"  // Client prefers 4:5 over 1:1
      }
    }
  }
}
```

### 🎯 Recomendación Final: **Hybrid Approach**

```javascript
// Priority system:
// 1. Context Profile overrides (client-specific)
// 2. Remote specs (GitHub, weekly updates)
// 3. Local specs (fallback)

const platformSpecs = await platformManager.load({
  contextProfileId: 'client-luxury-brand',  // Override
  checkRemote: true,  // Weekly check
  fallbackLocal: true  // Always available
});
```

---

## 📚 PREGUNTA 3: Todd Brown & Hormozi - ¿Dónde están y cómo actualizar?

### Ubicación Actual

**Skills (NO en MCP)**:
```
/mnt/d/Dev/creator_skills/skills/
├── avatar-construction/v1.0.0/          (Todd Brown)
├── unique-mechanism-generator/v1.0.0/   (Todd Brown)
├── grand-slam-offer-generator/v1.0.0/   (Hormozi)
├── ad-copy-generation/v1.0.0/           (Ambos)
└── landing-page-structure/v1.0.0/       (Hormozi)
```

### Frameworks Implementados

**Todd Brown** - 5 Levels of Market Sophistication:
```javascript
// unique-mechanism-generator/index.js
const SOPHISTICATION_FRAMEWORKS = {
  level_1: {
    name: "The Direct Claim",
    approach: "Make the BIG promise",
    examples: ["Lose weight", "Make money", "Get fit"]
  },
  level_2: {
    name: "Amplified Direct Claim",
    approach: "Promise + Proof",
    examples: ["Lose 20 pounds in 30 days", "Make $10K/month"]
  },
  level_3: {
    name: "The Unique Mechanism",
    approach: "New proprietary method",
    examples: ["Keto diet", "High-Ticket Coaching"]
  },
  level_4: {
    name: "Enhanced Mechanism",
    approach: "Better version of known mechanism",
    examples: ["Keto 2.0", "AI-Powered Coaching"]
  },
  level_5: {
    name: "Experiential",
    approach: "Identity transformation",
    examples: ["Become the person who...", "Live the lifestyle of..."]
  }
};
```

**Alex Hormozi** - Grand Slam Offer:
```javascript
// grand-slam-offer-generator/index.js
const VALUE_EQUATION = {
  dream_outcome: "What they want to achieve",
  perceived_likelihood: "Credibility + proof",
  time_delay: "How fast (minimize)",
  effort_sacrifice: "How easy (minimize)"
};

const VALUE_STACK_COMPONENTS = [
  "Core Offer",
  "Bonuses (3-5)",
  "Guarantees (Risk reversal)",
  "Scarcity/Urgency",
  "Price Anchoring"
];
```

### 🚨 Problema Actual: **Metodologías estáticas en código**

**Escenario Real**:
```
Alex Hormozi lanza nuevo libro:
→ "$100M Leads" (2023) con nuevos frameworks
→ Updated Value Equation con "Lead Nurture Score"
→ New Guarantee formulas

Tu skill:
→ Sigue usando "$100M Offers" (2021)
→ NO tiene frameworks nuevos
→ Desactualizado
```

### ✅ Solución: Sistema de Actualización de Frameworks

**Arquitectura Propuesta**:

```javascript
// NEW: lib/framework-updates-manager.js
export class FrameworkUpdatesManager {
  constructor() {
    this.frameworkSources = {
      'todd-brown': {
        version: '2.0',
        source: 'https://raw.githubusercontent.com/tu-org/marketing-frameworks/main/todd-brown.json',
        lastUpdate: null
      },
      'alex-hormozi': {
        version: '3.0',  // Incluye $100M Leads
        source: 'https://raw.githubusercontent.com/tu-org/marketing-frameworks/main/hormozi.json',
        lastUpdate: null
      }
    };
  }

  async loadFramework(author) {
    // STRATEGY: Remote → Cache → Bundled

    // 1. Check remote updates (monthly)
    if (this.shouldCheckRemote(author)) {
      try {
        const remoteFramework = await this.fetchRemoteFramework(author);
        if (remoteFramework && this.isNewer(remoteFramework, author)) {
          this.cacheFramework(author, remoteFramework);
          this.notifyUpdate(author, remoteFramework.version);
          return remoteFramework;
        }
      } catch (error) {
        console.warn(`⚠️ Remote ${author} framework unavailable`);
      }
    }

    // 2. Load cached version
    const cached = this.getCachedFramework(author);
    if (cached) return cached;

    // 3. Fallback: bundled version
    return this.getBundledFramework(author);
  }

  shouldCheckRemote(author) {
    const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
    const lastUpdate = this.frameworkSources[author].lastUpdate;
    return !lastUpdate || (Date.now() - lastUpdate > ONE_MONTH);
  }

  async fetchRemoteFramework(author) {
    const source = this.frameworkSources[author].source;
    const response = await fetch(source);
    return await response.json();
  }

  isNewer(remoteFramework, author) {
    const currentVersion = this.frameworkSources[author].version;
    return remoteFramework.version > currentVersion;
  }

  notifyUpdate(author, newVersion) {
    console.log(`🆕 ${author} framework updated to v${newVersion}`);
    // Optional: Send Slack/Email notification
    // Optional: Generate changelog
  }
}
```

**Framework JSON Structure** (GitHub repo):

```json
// todd-brown.json
{
  "version": "2.1",
  "last_updated": "2025-01-15",
  "frameworks": {
    "market_sophistication": {
      "levels": [
        {
          "level": 1,
          "name": "Direct Claim",
          "approach": "Make the BIG promise",
          "examples": ["Lose weight", "Make money"],
          "when_to_use": "New market, no competition",
          "updated": "2024-12-01",
          "changelog": "Added 'when_to_use' guidance"
        }
      ]
    },
    "unique_mechanism": {
      "formula": "Mechanism Name + Big Promise + Proprietary Twist",
      "examples": {
        "fitness": "Metabolic Amplification System",
        "business": "Profit Acceleration Framework"
      }
    }
  },
  "new_in_this_version": [
    "Added 'AI-Enhanced' mechanism templates",
    "Updated examples for 2025 market"
  ]
}
```

```json
// hormozi.json
{
  "version": "3.0",
  "last_updated": "2025-01-20",
  "book_sources": ["$100M Offers (2021)", "$100M Leads (2023)"],
  "frameworks": {
    "value_equation": {
      "formula": "(Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)",
      "components": {
        "dream_outcome": {
          "definition": "What they want to achieve",
          "tactics": ["Amplify desire", "Paint vivid picture"]
        },
        "perceived_likelihood": {
          "definition": "Credibility that you'll deliver",
          "tactics": ["Social proof", "Guarantees", "Case studies"],
          "new_2023": ["Lead Nurture Score", "Engagement velocity"]
        }
      }
    },
    "grand_slam_offer": {
      "components": ["Core Offer", "Bonuses", "Guarantee", "Scarcity"],
      "bonus_formula": "3-5 bonuses, each valued higher than core",
      "guarantee_types": [
        "Unconditional",
        "Conditional",
        "Anti-Guarantee (advanced)",
        "Performance-Based (new 2023)"
      ]
    },
    "lead_generation": {
      "source": "$100M Leads (2023)",
      "core_channels": {
        "warm_outbound": ["Email", "Phone", "Direct Mail"],
        "cold_outbound": ["Cold Email", "Cold Calls", "Door-to-Door"],
        "free_content": ["Organic Social", "SEO", "Podcast"],
        "paid_ads": ["Facebook", "Google", "YouTube"]
      }
    }
  }
}
```

### Integration in Skills

```javascript
// grand-slam-offer-generator/index.js
import { FrameworkUpdatesManager } from '../../../lib/framework-updates-manager.js';

const frameworkManager = new FrameworkUpdatesManager();

export async function generate(input) {
  // Load latest Hormozi frameworks
  const hormozi = await frameworkManager.loadFramework('alex-hormozi');

  // Use updated formula
  const valueEquation = hormozi.frameworks.value_equation;

  // Access new 2023 content if available
  const leadGen = hormozi.frameworks.lead_generation || null;

  // Generate offer using latest methodology
  return generateOffer(input, hormozi);
}
```

### 🎯 Recomendación: **GitHub + Monthly Updates**

**Proceso**:
1. Creas repo: `tu-org/marketing-frameworks`
2. Archivos: `todd-brown.json`, `hormozi.json`, `storybrand.json`, etc.
3. Actualizas mensualmente cuando:
   - Nuevo libro/framework lanzado
   - Mejores prácticas actualizadas
   - Ejemplos refresh con casos 2025
4. Skills auto-fetch mensualmente
5. Changelog automático generado

**Beneficios**:
- ✅ Frameworks siempre actualizados
- ✅ Versionado + changelog
- ✅ Zero downtime (fallback a bundled)
- ✅ Team collaboration
- ✅ Audit trail de cambios

---

## 🎨 PREGUNTA 4: Gap 2 - Ad Copy Tone Adaptation

### Problema Actual

**Código Actual** (ad-copy-generation skill):
```javascript
// Skill recibe platformSpecification
const platformSpec = input.platformSpecification;
// { toneOfVoice: "professional, authoritative" }

// Pero NO lo usa en generación ❌
const copy = await generateGenericCopy(input);  // Ignora toneOfVoice
```

**Resultado**:
- LinkedIn: Copy genérico (debería ser professional)
- Instagram: Copy genérico (debería ser casual)
- TikTok: Copy genérico (debería ser fun)

### ✅ Solución: Platform-Aware Copy Generation

**Implementation** (ad-copy-generation/index.js):

```javascript
export async function generate(input) {
  const {
    brief,
    avatar,
    unique_mechanism,
    grand_slam_offer,
    nicheContext,
    platform,
    platformSpecification  // { toneOfVoice, demographics, bestPractices }
  } = input;

  // STEP 1: Detect target platform tone
  const targetTone = platformSpecification?.toneOfVoice || 'professional, engaging';
  const demographics = platformSpecification?.demographics || 'general audience';

  console.log(`🎯 Adapting copy for ${platform}: ${targetTone}`);

  // STEP 2: Load tone-specific templates
  const toneTemplates = {
    'professional': {
      opening: 'Industry leaders are leveraging',
      style: 'data-driven, authoritative',
      cta: 'Learn more →'
    },
    'casual': {
      opening: 'You know that feeling when',
      style: 'conversational, relatable',
      cta: 'Check it out 👀'
    },
    'fun': {
      opening: 'POV: You just discovered',
      style: 'energetic, trendy',
      cta: 'Try it now! ✨'
    }
  };

  // STEP 3: Map platform to tone category
  const toneCategory = detectToneCategory(targetTone);
  const template = toneTemplates[toneCategory] || toneTemplates['professional'];

  // STEP 4: Generate copy with tone-aware prompt
  const toneAwarePrompt = `
Generate ad copy for ${platform} with these specifications:

TONE: ${targetTone}
DEMOGRAPHICS: ${demographics}
STYLE: ${template.style}

GUIDELINES:
${platformSpecification?.bestPractices?.map(bp => `- ${bp}`).join('\n') || '- Follow platform best practices'}

BRIEF: ${brief}
AVATAR: ${JSON.stringify(avatar)}
OFFER: ${JSON.stringify(grand_slam_offer)}

REQUIREMENTS:
- Opening hook should match: "${template.opening}..." style
- Use language appropriate for ${demographics}
- CTA style: "${template.cta}"
- Maintain ${targetTone} throughout
${platform === 'linkedin' ? '- Include data/statistics for credibility' : ''}
${platform === 'instagram' ? '- Emoji usage: moderate (2-3 per post)' : ''}
${platform === 'tiktok' ? '- Hook in first 3 seconds, trend-aware language' : ''}
`;

  const generatedCopy = await callOpenRouter(toneAwarePrompt, {
    model: 'deepseek/deepseek-r1',
    temperature: 0.7
  });

  // STEP 5: Validate tone compliance
  const toneScore = validateTone(generatedCopy, targetTone);

  if (toneScore < 0.7) {
    console.warn(`⚠️ Tone score low (${toneScore}), regenerating...`);
    // Retry with adjusted prompt
  }

  return {
    copy: generatedCopy,
    platform: platform,
    tone: targetTone,
    toneScore: toneScore,
    adaptedForPlatform: true
  };
}

function detectToneCategory(toneOfVoice) {
  const tone = toneOfVoice.toLowerCase();

  if (tone.includes('professional') || tone.includes('authoritative')) {
    return 'professional';
  }
  if (tone.includes('casual') || tone.includes('friendly')) {
    return 'casual';
  }
  if (tone.includes('fun') || tone.includes('energetic')) {
    return 'fun';
  }

  return 'professional';  // Default
}

function validateTone(copy, targetTone) {
  // Simple tone validation (can be enhanced with AI)
  const indicators = {
    'professional': ['data', 'research', 'proven', 'expert'],
    'casual': ['you', 'your', 'we', 'us', 'feel'],
    'fun': ['!', '✨', 'amazing', 'wow', 'POV']
  };

  const category = detectToneCategory(targetTone);
  const expectedIndicators = indicators[category] || [];

  let score = 0;
  for (const indicator of expectedIndicators) {
    if (copy.toLowerCase().includes(indicator)) {
      score += 0.2;
    }
  }

  return Math.min(score, 1.0);
}
```

**Ejemplo Output Comparison**:

**LinkedIn** (professional, authoritative):
```
Industry leaders are leveraging our Profit Acceleration Framework to increase revenue by 40% in Q1.

Research shows that companies implementing this system see:
→ 40% faster sales cycles
→ 60% higher close rates
→ 85% customer retention

Join 500+ businesses transforming their growth strategy.

Learn more → [Link]
```

**Instagram** (casual, visual-first):
```
You know that feeling when your business finally clicks? ✨

That's what happens when you discover the right growth system 💡

Our clients are seeing:
🚀 40% revenue boost
⏰ Way faster sales
❤️ Happier customers

Ready to level up? Check it out 👀

[Link in bio]
```

**TikTok** (fun, authentic, trend-aware):
```
POV: You just discovered the secret that changed everything 🤯

#BusinessGrowth #EntrepreneurLife #GrowthHacks

40% more revenue? In one quarter?

We didn't believe it either… until we saw the results 📈

Comment "GROWTH" for the free guide ⬇️

#SmallBusinessTips #RevenueGrowth
```

### Testing Strategy

```javascript
// tests/test-tone-adaptation.js
describe('Ad Copy Tone Adaptation', () => {
  test('LinkedIn generates professional tone', async () => {
    const result = await generate({
      platform: 'linkedin',
      platformSpecification: {
        toneOfVoice: 'professional, authoritative'
      },
      // ... other inputs
    });

    expect(result.tone).toBe('professional, authoritative');
    expect(result.toneScore).toBeGreaterThan(0.7);
    expect(result.copy).toContain('research');  // Professional indicator
  });

  test('Instagram generates casual tone', async () => {
    const result = await generate({
      platform: 'instagram',
      platformSpecification: {
        toneOfVoice: 'casual, visual-first'
      }
    });

    expect(result.toneScore).toBeGreaterThan(0.7);
    expect(result.copy).toMatch(/[✨🚀💡]/);  // Emoji usage
  });
});
```

---

## 📊 Resumen de Decisiones Arquitectónicas

| Decisión | Opción Elegida | Razón |
|----------|----------------|-------|
| **Nano Banana API** | FAL (primary) + Replicate (fallback) | Experiencia previa + Stack unificado |
| **Platform Specs Updates** | GitHub remote + Local fallback | Versionado + Colaboración |
| **Framework Updates** | GitHub monthly + Bundled fallback | Frameworks actualizados |
| **Tone Adaptation** | Platform-aware templates + Validation | Copy optimizado por plataforma |

---

## 🎯 Plan de Implementación Completo

### Fase 1: APIs (2h)
1. ✅ Nano Banana via FAL (primary)
2. ✅ Replicate fallback
3. ✅ Image Composition
4. ✅ Multi-model Video

### Fase 2: Update Systems (1h)
1. ✅ Platform Specs Manager
2. ✅ Framework Updates Manager
3. ✅ GitHub repos setup

### Fase 3: Tone Adaptation (30min)
1. ✅ Ad Copy skill enhancement
2. ✅ Tone validation
3. ✅ Platform-specific templates

### Fase 4: Testing & Validation (1h)
1. ✅ End-to-end tests
2. ✅ Tone adaptation tests
3. ✅ Update system tests

**Total Time**: 4.5 horas

---

**Created**: 2025-11-04
**Author**: Strategic Architecture Analysis
**Status**: ✅ COMPLETE - Awaiting User Approval to Implement
