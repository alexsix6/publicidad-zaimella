# E2E TESTING PLAN - ENTERPRISE ARCHITECTURE
**Date**: 2025-11-10
**Project**: Publicidad Zaimella MCP Content Generation
**Focus**: Validar integración completa MCP → Tools → Skills con contexto estratégico

---

## 🎯 ARQUITECTURA A VALIDAR

### Flujo Completo Enterprise:

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIGQUERY (Datos Reales)                      │
│          Cliente CMF, Fashion Try-On, Otros Clientes            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MCP SERVER (Claude Desktop)                   │
│              server-silent.js - stdio protocol                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MCP TOOLS                                │
│  - generate_complete_content                                    │
│  - analyze_content_context                                      │
│  - get_niche_insights                                           │
│  - generate_copy_content                                        │
│  - generate_product_image                                       │
│  - generate_product_video                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SKILLS (Brain Estratégico)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ad-copy-generation (Todd Brown Sophistication)         │  │
│  │  - Market sophistication levels (1-5)                   │  │
│  │  - Hook types (mechanism, secret, emotional, urgency)   │  │
│  │  - Copy psychology                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  grand-slam-offer-generator (Alex Hormozi)              │  │
│  │  - Dream outcome                                         │  │
│  │  - Perceived likelihood of achievement                   │  │
│  │  - Time delay                                            │  │
│  │  - Effort & sacrifice                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  unique-mechanism-generator                              │  │
│  │  - Propuesta única diferenciada                          │  │
│  │  - Naming + positioning                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  avatar-construction                                     │  │
│  │  - Psychographics                                        │  │
│  │  - Pain points                                           │  │
│  │  - Desires                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GENERACIÓN DE ASSETS                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Image Generation (Nano Banana + FLUX)                  │   │
│  │  - Modelo entrenado para persona (Digital Twin)         │   │
│  │  - Imágenes de producto/servicio                        │   │
│  │  - Context Profile integration                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Video Generation (Veo3)                                 │   │
│  │  - Based on generated images                            │   │
│  │  - Aligned with copy strategy                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTING SUITE - 7 NIVELES

### NIVEL 1: Component Testing (Individual)

#### Test 1.1: BigQuery Connection
**Objetivo**: Verificar que datos reales de CMF se obtienen correctamente

**Input**:
```javascript
// En Claude Desktop
"Query BigQuery para obtener datos de cliente CMF"
```

**Expected Output**:
- ✅ Conexión exitosa a BigQuery
- ✅ Schema CMF cargado
- ✅ Datos de cliente retornados (sanitizados para privacidad)
- ✅ Métricas: revenue, products, customer_behavior

**Success Criteria**:
- [ ] Query ejecutado sin errores
- [ ] Datos estructurados correctamente
- [ ] Schema CMF detectado automáticamente

---

#### Test 1.2: Niche Detection
**Objetivo**: Validar que sistema detecta nicho correctamente

**Input**:
```
Brief: "Quiero promocionar mi startup de ropa deportiva sustentable
para millennials que practican yoga y fitness consciente"
```

**Expected Output**:
```json
{
  "niche": "fitness-eco",
  "confidence": 0.85,
  "keywords": ["ropa deportiva", "sustentable", "yoga", "millennials"],
  "recommended_platforms": ["instagram", "tiktok", "pinterest"]
}
```

**Success Criteria**:
- [ ] Niche detectado con ≥75% confianza
- [ ] Keywords extraídos relevantes
- [ ] Platforms recomendadas alineadas

---

#### Test 1.3: Avatar Construction (Skill)
**Objetivo**: Verificar que skill construye avatar estratégico

**Input**:
```
Niche: fitness-eco
Target: Millennials 25-35 años, conscientes ambientalmente
```

**Expected Output**:
```json
{
  "avatar": {
    "name": "Eco-Conscious Emma",
    "demographics": {
      "age": "28-34",
      "income": "$45K-75K",
      "location": "Urban areas"
    },
    "psychographics": {
      "values": ["sustainability", "wellness", "authenticity"],
      "pain_points": ["greenwashing frustration", "expensive sustainable options"],
      "desires": ["eco-friendly performance", "community belonging"]
    },
    "buying_behavior": {
      "decision_drivers": ["social proof", "brand values", "quality"],
      "objections": ["price premium", "durability concerns"]
    }
  }
}
```

**Success Criteria**:
- [ ] Psychographics profundos y específicos
- [ ] Pain points identificados claramente
- [ ] Desires alineados con niche

---

#### Test 1.4: Grand Slam Offer (Alex Hormozi Skill)
**Objetivo**: Validar que skill aplica framework Hormozi correctamente

**Input**:
```
Product: Yoga mat sustentable de corcho
Avatar: Eco-Conscious Emma
Price: $89
```

**Expected Output**:
```json
{
  "grand_slam_offer": {
    "dream_outcome": "Perfect yoga practice with zero environmental guilt",
    "perceived_likelihood": {
      "credibility_elements": [
        "30-day money-back guarantee",
        "500+ 5-star reviews",
        "Certified B-Corp"
      ],
      "score": 9.2
    },
    "time_delay": {
      "promise": "Transform your practice in 7 days",
      "delivery_speed": "Ships in 24 hours"
    },
    "effort_sacrifice": {
      "reduced_effort": [
        "No breaking-in period (ready from day 1)",
        "Self-cleaning surface (wipe & go)",
        "10-year warranty (buy once)"
      ],
      "reduced_sacrifice": [
        "Price comparison: $89 vs $150 competitors",
        "Free returns (zero risk)",
        "Payment plan: 3 installments of $29.67"
      ]
    },
    "value_equation_score": 8.7
  }
}
```

**Success Criteria**:
- [ ] Dream outcome emocional y específico
- [ ] Credibility elements concretos
- [ ] Time delay minimizado
- [ ] Effort/sacrifice reducido significativamente
- [ ] Value equation score ≥8.0

---

#### Test 1.5: Copy Generation (Todd Brown Skill)
**Objetivo**: Verificar que skill aplica market sophistication correctamente

**Input**:
```
Brief: Yoga mat sustentable
Avatar: Eco-Conscious Emma
Grand Slam Offer: [from Test 1.4]
Platform: Instagram
```

**Expected Output**:
```json
{
  "variants": [
    {
      "hook_type": "mechanism",
      "market_sophistication": 4,
      "copy": {
        "headline": "The Cork Revolution: How 500 Yogis Ditched Plastic Without Sacrificing Grip",
        "hook": "Discover why eco-conscious yogis are switching to cork...",
        "body": "Emma tried 7 'sustainable' mats. All slipped during downward dog...",
        "cta": "Join the Cork Revolution - 30-Day Guarantee"
      },
      "psychology": {
        "sophistication_rationale": "Level 4: Market knows mechanisms exist, needs NEW unique mechanism",
        "emotional_triggers": ["environmental guilt", "community belonging", "performance anxiety"],
        "objection_handling": ["price justified by 10-year warranty", "grip validated by reviews"]
      }
    }
  ]
}
```

**Success Criteria**:
- [ ] Market sophistication level correctamente identificado (1-5)
- [ ] Hook type alineado con sophistication
- [ ] Copy estructura completa (headline, hook, body, CTA)
- [ ] Psychology rationale documentado
- [ ] Emotional triggers específicos del avatar

---

#### Test 1.6: Image Generation (Context Profile)
**Objetivo**: Validar que imágenes se generan con contexto estratégico

**Input**:
```
Copy: [from Test 1.5]
Context Profile: Eco yoga brand (negro mate + verde natural)
Product: Cork yoga mat
```

**Expected Output**:
- ✅ Imagen generada con Nano Banana
- ✅ Colors alineados con brand (negro + verde)
- ✅ Product visible y destacado
- ✅ Estética coherente con avatar (millennial eco-conscious)
- ✅ URL imagen: https://replicate.delivery/...

**Success Criteria**:
- [ ] Imagen generada sin errores
- [ ] Brand colors aplicados (visual consistency)
- [ ] Product positioning correcto
- [ ] Estética alineada con target audience
- [ ] Resolution adecuada para platform (Instagram 1:1)

---

#### Test 1.7: Video Generation
**Objetivo**: Validar generación de video con imagen base

**Input**:
```
Image: [from Test 1.6]
Copy: [from Test 1.5]
Duration: 8s
Style: Cinematic, eco-friendly aesthetic
```

**Expected Output**:
- ✅ Video generado con Veo3
- ✅ Movement natural y fluido
- ✅ Audio/music opcional
- ✅ Duration: 8 segundos
- ✅ URL video: https://fal.ai/...

**Success Criteria**:
- [ ] Video generado sin errores
- [ ] Movement coherente con producto
- [ ] Estética alineada con brand
- [ ] Duration correcta
- [ ] Quality suitable para Instagram Reels

---

### NIVEL 2: Integration Testing (Componentes Conectados)

#### Test 2.1: Niche → Avatar → Offer Flow
**Objetivo**: Validar que contexto fluye correctamente entre skills

**Input**:
```
Brief completo: "Startup ropa deportiva sustentable para millennials yoga"
```

**Expected Flow**:
```
1. Niche Detection → fitness-eco
2. Avatar Construction → Usa niche como input
3. Grand Slam Offer → Usa avatar como input
4. Verify: Offer address avatar's pain points
```

**Success Criteria**:
- [ ] Context se pasa correctamente entre skills
- [ ] Offer referencias pain points de avatar
- [ ] Dream outcome alineado con desires de avatar
- [ ] NO pérdida de contexto entre pasos

---

#### Test 2.2: BigQuery → Copy Generation Flow
**Objetivo**: Validar que datos reales informan copy strategy

**Input**:
```
Cliente: CMF
Query BigQuery: "¿Cuál es el segmento de mayor revenue?"
```

**Expected Flow**:
```
1. BigQuery retorna: "Premium customers 35-50 años, $150+ average order"
2. Avatar Construction usa data → "Luxury Seeker Laura, 42 años"
3. Copy Generation adapta sophistication → Level 5 (awareness exists, needs positioning)
4. Verify: Copy menciona insights de data real
```

**Success Criteria**:
- [ ] BigQuery data se integra en avatar
- [ ] Copy adapta sophistication basado en audience data
- [ ] Insights reales mencionados en copy (ej: "customers like you spend $150+")
- [ ] NO generic copy, sí data-driven personalization

---

#### Test 2.3: Copy → Image → Video Pipeline
**Objetivo**: Validar que assets visuales se alinean con copy strategy

**Input**:
```
Copy generado: [Level 4 sophistication, mechanism hook]
Brief: Yoga mat sustentable
```

**Expected Flow**:
```
1. Copy Generation → "Cork Revolution mechanism"
2. Image Generation → Prompt enhanced incluye "cork texture close-up, eco aesthetic"
3. Video Generation → Movement emphasizes cork grip
4. Verify: Visual storytelling coherente con copy strategy
```

**Success Criteria**:
- [ ] Image prompt derivado de copy insights
- [ ] Visual emphasis alineado con mechanism
- [ ] Video storytelling coherente
- [ ] NO disconnect entre copy y visuals

---

### NIVEL 3: E2E Testing (Flujo Completo Cliente Real)

#### Test 3.1: Caso Real - Cliente CMF
**Objetivo**: Validar flujo completo con datos reales CMF

**Scenario**:
```
Cliente: CMF (Constructora)
Goal: Campaña para venta de departamentos premium
Budget: $8K
Timeline: 2 semanas
```

**Full Pipeline**:
```
1. BigQuery Query: "Segmento premium CMF buyers"
   Expected: Demographics, buying behavior, average ticket

2. Niche Detection: "real-estate-premium"
   Expected: Confidence ≥85%

3. Avatar Construction: "Executive Buyer Ernesto, 38-45 años"
   Expected: Pain points (inversión segura, plusvalía, ubicación)

4. Grand Slam Offer: "Departamento con ROI 15% garantizado en 3 años"
   Expected: Dream outcome (inversión segura + lifestyle upgrade)

5. Unique Mechanism: "Sistema de Pre-Valorización Inmobiliaria"
   Expected: Mechanism unique al mercado

6. Copy Generation (3 platforms):
   - Instagram: Visual storytelling, lifestyle aspiracional
   - LinkedIn: ROI-focused, data-driven
   - Email: Warm nurture sequence

7. Image Generation:
   - Hero shot: Departamento con vista panorámica
   - Lifestyle: Ejecutivo en balcón con laptop
   - Social proof: Testimonial visual

8. Video Generation:
   - Tour virtual 8s
   - Testimonial cliente satisfecho
```

**Success Criteria**:
- [ ] Pipeline completo ejecutado sin errores
- [ ] BigQuery data integrado en avatar
- [ ] Copy diferenciado por platform
- [ ] Images coherentes con target premium
- [ ] Video quality professional
- [ ] Total time: <15 minutos
- [ ] Client satisfaction: Brief → Assets ready para launch

---

#### Test 3.2: Caso Real - Fashion Try-On
**Objetivo**: Validar modelo entrenado (Digital Twin)

**Scenario**:
```
Cliente: Fashion brand
Goal: Try-on virtual de nueva colección
Special: Modelo entrenado con LoRA (Digital Twin)
```

**Full Pipeline**:
```
1. Context Profile: Digital Twin activado
   Expected: ContextProfileManager detecta has_digital_twin=true

2. Niche Detection: "fashion-online"
   Expected: Platform recommendations (Instagram, TikTok, Pinterest)

3. Avatar Construction: "Fashion Forward Fiona, 22-28 años"
   Expected: Style preferences, shopping behavior

4. Image Generation (Digital Twin mode):
   - Input: Base model + LoRA weights
   - Prompt: "Model wearing new summer dress, urban background"
   Expected: Same model face en TODAS las imágenes (consistency)

5. Video Generation:
   - Movement: Model walking, dress flowing
   Expected: Natural movement, face consistency

6. Multi-variant testing:
   - Generate 5 variants con MISMO modelo
   - Verify: Face consistency 100%
```

**Success Criteria**:
- [ ] Digital Twin detectado automáticamente
- [ ] Face consistency ≥95% across all variants
- [ ] LoRA weights aplicados correctamente
- [ ] Image quality professional
- [ ] Mismo modelo en todas las generaciones
- [ ] Context Profile persiste entre generaciones

---

### NIVEL 4: Context Persistence Testing

#### Test 4.1: Session Continuity
**Objetivo**: Validar que contexto persiste durante sesión

**Scenario**:
```
Sesión 1:
1. Generate copy para yoga mat
2. Generate images con copy context
3. Modify copy (user feedback)
4. Regenerate images con nuevo contexto

Verify: Context updated propagates to images
```

**Success Criteria**:
- [ ] Context se mantiene durante sesión
- [ ] Updates se propagan correctamente
- [ ] NO context loss entre tools
- [ ] Context Profile persiste

---

#### Test 4.2: Cross-Session Persistence
**Objetivo**: Validar que Context Profile persiste entre sesiones

**Scenario**:
```
Sesión 1 (Lunes):
1. Create Context Profile para "CMF Premium"
2. Generate campaign

Sesión 2 (Martes):
1. Load Context Profile "CMF Premium"
2. Generate nuevo campaign
3. Verify: Brand colors, tone of voice consistentes
```

**Success Criteria**:
- [ ] Context Profile cargado correctamente
- [ ] Brand guidelines aplicados
- [ ] Visual consistency mantenida
- [ ] Tone of voice consistente

---

### NIVEL 5: Error Handling & Degradation

#### Test 5.1: API Failures
**Objetivo**: Validar graceful degradation

**Scenarios**:
```
1. Replicate API down:
   Expected: Fallback to alternative model or placeholder

2. OpenRouter API rate limited:
   Expected: Use original prompt sin enhancement (degraded pero funcional)

3. BigQuery timeout:
   Expected: Use generic avatar sin data insights
```

**Success Criteria**:
- [ ] Pipeline NO se rompe completamente
- [ ] Fallbacks funcionan automáticamente
- [ ] User recibe warning claro
- [ ] Assets se generan (degraded quality OK)

---

#### Test 5.2: Invalid Inputs
**Objetivo**: Validar manejo de inputs incorrectos

**Scenarios**:
```
1. Brief vacío: ""
   Expected: Error message claro, sugiere ejemplo

2. Platform inválido: "MySpace"
   Expected: Usa default platform (Instagram)

3. Context Profile inexistente:
   Expected: Generic mode sin contexto extra
```

**Success Criteria**:
- [ ] NO crashes
- [ ] Error messages útiles
- [ ] Fallbacks sensatos
- [ ] User guidance claro

---

### NIVEL 6: Performance & Scalability

#### Test 6.1: Load Testing
**Objetivo**: Validar performance bajo carga

**Scenarios**:
```
1. Single request:
   Expected time: <30 segundos (copy + image)

2. Concurrent requests (5):
   Expected: All complete en <60 segundos

3. Large brief (2000 words):
   Expected: Process sin timeout
```

**Success Criteria**:
- [ ] Single request <30s
- [ ] Concurrent handling OK
- [ ] Large inputs procesados
- [ ] Memory stable (no leaks)

---

### NIVEL 7: Business Value Validation

#### Test 7.1: Differentiation vs Competitors
**Objetivo**: Validar que brain estratégico entrega valor único

**Comparison**:
```
Generic AI copy tool:
- Prompt: "Write Instagram post for yoga mat"
- Output: Generic features list

Publicidad Zaimella:
- Input: Brief + BigQuery data + Avatar + Sophistication analysis
- Output: Strategic copy con mechanism + offer structure + psychology
```

**Success Criteria**:
- [ ] Copy notablemente más estratégico
- [ ] Market sophistication aplicado correctamente
- [ ] Alex Hormozi framework visible en offer
- [ ] Todd Brown principles en copy structure
- [ ] Personalization basada en data real
- [ ] Client reconoce diferenciación vs herramientas genéricas

---

## 🎯 TESTING EXECUTION PLAN

### Phase 1: Component Testing (Week 1)
**Duration**: 3 days
**Tests**: 1.1 - 1.7 (individual components)
**Goal**: Validar que cada skill/tool funciona standalone

**Day 1**:
- [ ] Test 1.1: BigQuery Connection
- [ ] Test 1.2: Niche Detection
- [ ] Test 1.3: Avatar Construction

**Day 2**:
- [ ] Test 1.4: Grand Slam Offer
- [ ] Test 1.5: Copy Generation
- [ ] Document findings + fix issues

**Day 3**:
- [ ] Test 1.6: Image Generation
- [ ] Test 1.7: Video Generation
- [ ] Component testing report

---

### Phase 2: Integration Testing (Week 2)
**Duration**: 2 days
**Tests**: 2.1 - 2.3 (connected flows)
**Goal**: Validar que contexto fluye correctamente

**Day 1**:
- [ ] Test 2.1: Niche → Avatar → Offer
- [ ] Test 2.2: BigQuery → Copy
- [ ] Document context flow issues

**Day 2**:
- [ ] Test 2.3: Copy → Image → Video
- [ ] Fix integration gaps
- [ ] Integration testing report

---

### Phase 3: E2E Testing (Week 3)
**Duration**: 3 days
**Tests**: 3.1 - 3.2 (full client scenarios)
**Goal**: Validar casos reales cliente

**Day 1**:
- [ ] Test 3.1: Cliente CMF complete flow
- [ ] Measure total time
- [ ] Document quality vs expectations

**Day 2**:
- [ ] Test 3.2: Fashion Try-On Digital Twin
- [ ] Validate face consistency
- [ ] Document any model training issues

**Day 3**:
- [ ] E2E testing report
- [ ] Client feedback simulation
- [ ] Identify final gaps

---

### Phase 4: Resilience Testing (Week 4)
**Duration**: 2 days
**Tests**: 4.1 - 5.2 (context + errors)
**Goal**: Validar robustness

**Day 1**:
- [ ] Test 4.1: Session continuity
- [ ] Test 4.2: Cross-session persistence
- [ ] Context persistence report

**Day 2**:
- [ ] Test 5.1: API failures
- [ ] Test 5.2: Invalid inputs
- [ ] Error handling report

---

### Phase 5: Performance & Business Value (Week 5)
**Duration**: 2 days
**Tests**: 6.1 - 7.1 (scale + differentiation)
**Goal**: Validate enterprise readiness

**Day 1**:
- [ ] Test 6.1: Load testing
- [ ] Performance optimization if needed

**Day 2**:
- [ ] Test 7.1: Differentiation validation
- [ ] Final comprehensive report
- [ ] Production readiness checklist

---

## 📊 SUCCESS METRICS

### Technical Metrics
- [ ] **Component pass rate**: ≥95% (6.65/7 tests pass)
- [ ] **Integration pass rate**: ≥90% (2.7/3 tests pass)
- [ ] **E2E pass rate**: ≥85% (1.7/2 client scenarios)
- [ ] **Error handling**: 100% graceful degradation
- [ ] **Performance**: <30s single request, <60s concurrent

### Business Metrics
- [ ] **Client satisfaction**: Brief → Assets en <15 minutos
- [ ] **Differentiation score**: ≥8/10 vs generic AI tools
- [ ] **Strategic value**: Client reconoce frameworks (Hormozi, Todd Brown)
- [ ] **Data integration**: BigQuery insights visible en outputs
- [ ] **Visual consistency**: Brand colors aplicados 100%

---

## 🚀 IMMEDIATE NEXT STEPS

**Ahora (Today)**:
1. [ ] Ejecutar Test 1.1: BigQuery Connection
2. [ ] Ejecutar Test 1.2: Niche Detection
3. [ ] Ejecutar Test 1.5: Copy Generation (verificar frameworks)

**Mañana**:
1. [ ] Ejecutar Test 3.1: Cliente CMF E2E completo
2. [ ] Document gaps encontrados
3. [ ] Crear lista priorizada de fixes

**Esta semana**:
1. [ ] Complete Phase 1 (Component Testing)
2. [ ] Start Phase 2 (Integration Testing)
3. [ ] Compile initial findings report

---

## 📝 DOCUMENTATION TEMPLATE

Para cada test, documentar:

```markdown
### Test X.Y: [Name]

**Status**: ⏳ Pending | ✅ Passed | ❌ Failed
**Date**: YYYY-MM-DD
**Duration**: X minutes

**Input**:
[copy exact input used]

**Expected Output**:
[what you expect to see]

**Actual Output**:
[what actually happened]

**Pass/Fail Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Issues Found**:
1. [Issue description]
2. [Root cause if known]

**Fixes Needed**:
1. [Action item 1]
2. [Action item 2]

**Notes**:
[Any observations, context, edge cases discovered]
```

---

**TESTING STATUS**: 📋 READY TO EXECUTE
**Estimated Total Time**: 5 weeks (aggressive), 8 weeks (comfortable)
**Next Action**: User selects test to start with

---

**Report End**
**Created**: 2025-11-10
**Focus**: E2E architecture validation, NOT deployment automation
