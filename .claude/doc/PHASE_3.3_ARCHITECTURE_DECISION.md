# Phase 3.3 - CMF Integration Architecture Decision

**Date**: 2025-11-09
**Status**: ✅ APPROVED
**Decision**: Use Alba MCP directly instead of duplicating BigQuery access

---

## PROBLEM STATEMENT

### Initial Approach (REJECTED)
Created `get_client_business_intelligence` tool in `publicidad_zaimella_content` MCP to fetch CMF data from BigQuery.

### Issues Encountered
1. **Environment Variable Problem**: `BIGQUERY_CLIENT_SCHEMA=CMF` not reaching Node.js process
   - Root cause: `source .env.local` overwrites env vars from `claude_desktop_config.json`
   - Symptom: Always returns "Schema: default" with 0 data

2. **Configuration Duplication**: Would need to duplicate CMF credentials in 2 MCPs:
   - Alba MCP (already has `chz-bi-dwh-prod` + `CMF_TABLAS_TEMPORALES`)
   - Publicidad MCP (would need same credentials)

3. **Architectural Smell**: Violates single responsibility principle
   - Alba MCP = CMF data source (business intelligence)
   - Publicidad MCP = Content generation (copy, video, images)

---

## SOLUTION: USE ALBA MCP DIRECTLY ✅

### Architecture Decision

**Principle**: Separation of Concerns
**Pattern**: Data Source + Consumer Pattern

```
┌─────────────────────────────────┐
│      Alba MCP (Data Source)      │
│  • chz-bi-dwh-prod credentials   │
│  • CMF_TABLAS_TEMPORALES access  │
│  • 57,774 customer records       │
│  • 13 business intelligence tools│
└─────────────┬───────────────────┘
              │
              │ business_intelligence object
              ↓
┌─────────────────────────────────┐
│  Publicidad MCP (Content Gen)    │
│  • Receives data as parameter    │
│  • Generates personalized content│
│  • NO direct BigQuery access     │
└─────────────────────────────────┘
```

### Alba Tools Available

**For Business Intelligence**:
1. ✅ `alba_customer_intelligence` - **RECOMMENDED**
   - Returns: demographics, products, seasonal patterns
   - Parameters: `{ limit: 100 }`
   - Output: Structured business intelligence object

2. ✅ `alba_intelligent_query` - For custom SQL queries
   - Parameters: `{ query: "SELECT ..." }`
   - Use when need specific data not covered by alba_customer_intelligence

3. ✅ `alba_explore_bigquery` - For schema exploration
   - Parameters: `{ dataset: "CMF_TABLAS_TEMPORALES" }`
   - Use for discovering available tables/fields

### Correct Workflow

```javascript
// STEP 1: Fetch CMF business intelligence (Alba MCP)
const cmfData = await alba_customer_intelligence({
  limit: 100  // Top 100 customers
});

// Response structure:
// {
//   total_customers: 57774,
//   demographics: { avg_age: 35, gender_distribution: {...} },
//   top_products: [...],
//   seasonal_patterns: [...],
//   proven_phrases: [...]  (if available)
// }

// STEP 2: Generate content with CMF data (Publicidad MCP)
const content = await generate_complete_content({
  brief: "Campaña productos financieros para clientes CMF",
  business_intelligence: cmfData,  // ← Inject CMF data here
  target_platform: "instagram",
  content_type: "carousel"
});

// STEP 3: Content generated with REAL CMF personalization ✅
// - Demographics from 57,774 real customers
// - Top selling products from AA_CMF_OFERTAS_EXTRA_JUNIO2025
// - Seasonal patterns from VOLCAN_TCMOV
```

---

## BENEFITS ✅

### 1. NO Configuration Changes to Other Projects
- Alba MCP already configured for CMF (no changes needed)
- Publicidad MCP remains generic (works for ANY client data)
- Other MCPs unaffected

### 2. Aligned to Architecture Principles
- **Single Responsibility**: Each MCP does ONE thing well
- **Separation of Concerns**: Data access ≠ Content generation
- **Dependency Inversion**: Publicidad depends on interface (business_intelligence param), not implementation (BigQuery)

### 3. Flexibility & Reusability
- Alba tools can be used for OTHER CMF purposes (not just content generation)
- Publicidad can receive data from ANY source (BigQuery, CSV, API, etc.)
- Easy to add NEW clients: Just create new data source MCP

### 4. Maintainability
- CMF credentials centralized in ONE place (Alba MCP)
- Easier to troubleshoot: Data issues = Alba, Content issues = Publicidad
- Clear boundaries

---

## CHANGES MADE

### ✅ Kept (No Changes)
- `publicidad_zaimella_content` MCP server-silent.js
- `generate_complete_content` tool (already accepts `business_intelligence` parameter)
- Alba MCP configuration (already perfect)

### ❌ Removed
- `get_client_business_intelligence` tool from server-silent.js (unnecessary duplication)
- `BIGQUERY_CLIENT_SCHEMA` from claude_desktop_config.json (not needed)

### 📝 Documented
- Architecture decision (this file)
- Correct workflow (above)
- Tool usage examples

---

## VALIDATION

### Test Plan

**Test 1**: Fetch CMF business intelligence with Alba
```bash
alba_customer_intelligence({ limit: 5 })
```
**Expected**: Returns 5 customer records from CMF_TABLAS_TEMPORALES

**Test 2**: Generate content with CMF data
```bash
generate_complete_content({
  brief: "Campaña Credimás CMF",
  business_intelligence: <result from Test 1>,
  target_platform: "instagram"
})
```
**Expected**: Content personalized with REAL CMF demographics

**Test 3**: Verify no impact on other projects
```bash
# Use publicidad tools for non-CMF projects
generate_complete_content({
  brief: "Campaña genérica sin business data",
  target_platform: "tiktok"
})
```
**Expected**: Works WITHOUT business_intelligence parameter (graceful degradation)

---

## ROLLBACK PLAN

If Alba approach doesn't work:

**Option A**: Add `BIGQUERY_CLIENT_SCHEMA=CMF` to `.env.local`
- Pro: Simple fix
- Con: Duplicates configuration

**Option B**: Modify claude_desktop_config.json command
```json
"command": "bash",
"args": ["-c", "export BIGQUERY_CLIENT_SCHEMA=CMF && cd /mnt/d/Dev/publicidad-zaimella/mcp && node server-silent.js"]
```
- Pro: No file changes
- Con: Harder to maintain

**Recommendation**: Stick with Alba approach ✅ (most architectural sound)

---

## DECISION RATIONALE

**WHY Alba is correct**:
1. ✅ Alba ALREADY has CMF access (57,774 records confirmed)
2. ✅ NO configuration changes needed
3. ✅ Follows separation of concerns
4. ✅ Reusable for other CMF purposes
5. ✅ Easier to maintain (credentials in 1 place)

**WHY duplicating BigQuery access was wrong**:
1. ❌ Violates DRY principle (Don't Repeat Yourself)
2. ❌ Creates maintenance burden (2 places to update credentials)
3. ❌ Couples Publicidad MCP to CMF (reduces flexibility)
4. ❌ Env var issues hard to debug (source .env.local overwrites)

---

## CONCLUSION

**STATUS**: ✅ ARCHITECTURE DECISION APPROVED

**IMPLEMENTATION**: Use Alba MCP tools directly
**VALIDATION**: Pending test execution
**DOCUMENTATION**: Complete

**Next Steps**:
1. Execute Test Plan (above)
2. Update context_agent with decision
3. Create examples in documentation
4. Close Phase 3.3 as COMPLETE
