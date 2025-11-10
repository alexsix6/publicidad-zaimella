# CMF Business Intelligence → Content Generation Workflow

**Phase 3.3 - Correct Architecture Implementation**

---

## WORKFLOW OVERVIEW

```
Alba MCP (Data Source)
    ↓
    alba_customer_intelligence
    ↓
    business_intelligence object
    ↓
Publicidad MCP (Content Generator)
    ↓
    generate_complete_content
    ↓
    Personalized CMF content
```

---

## STEP-BY-STEP EXAMPLE

### Step 1: Fetch CMF Business Intelligence (Alba MCP)

**Tool**: `alba_customer_intelligence`

**Request**:
```json
{
  "limit": 100
}
```

**Expected Response**:
```json
{
  "total_customers": 57774,
  "demographics": {
    "avg_age": 35,
    "gender_distribution": {
      "female_pct": 52.3,
      "male_pct": 47.7
    },
    "avg_order_value": 1250.50
  },
  "top_products": [
    {
      "product_name": "base_extra_regular",
      "total_revenue": 125000,
      "avg_rating": 4.5
    },
    {
      "product_name": "base_extra_micro",
      "total_revenue": 98000,
      "avg_rating": 4.7
    }
  ],
  "seasonal_patterns": [
    {
      "month": "Junio 2025",
      "total_revenue": 450000,
      "order_count": 11112
    }
  ],
  "data_source": "BigQuery",
  "dataset": "CMF_TABLAS_TEMPORALES"
}
```

---

### Step 2: Generate Personalized Content (Publicidad MCP)

**Tool**: `generate_complete_content`

**Request**:
```json
{
  "brief": "Campaña de captación de clientes para productos Credimás de CMF. Público objetivo: adultos jóvenes entre 25-40 años que buscan créditos accesibles para emprendimiento o consumo personal. Mensaje principal: Acceso rápido a crédito con tasas competitivas y proceso 100% digital.",
  "business_intelligence": {
    // ← Paste ENTIRE response from Step 1 here
    "total_customers": 57774,
    "demographics": {...},
    "top_products": [...],
    "seasonal_patterns": [...]
  },
  "target_platform": "instagram",
  "content_type": "carousel"
}
```

**Expected Response**:
```json
{
  "copy": {
    "hook": "¿Necesitas capital para tu negocio? 🚀",
    "main_text": "57,774 emprendedores como tú ya confían en Credimás CMF para impulsar sus proyectos. Con base_extra_regular, accede hasta $125,000 en menos de 48 horas. Proceso 100% digital, sin filas, sin complicaciones.",
    "cta": "👉 Solicita tu crédito ahora",
    "hashtags": "#CréditoRápido #CMF #Credimás #Emprendimiento"
  },
  "images": [
    {
      "url": "https://...",
      "description": "Profesional joven trabajando en computadora portátil"
    }
  ],
  "personalization": {
    "used_real_data": true,
    "customer_count": 57774,
    "top_product": "base_extra_regular",
    "avg_revenue": "$125,000",
    "target_demographic": "Adultos 25-40 años"
  }
}
```

---

## ALTERNATIVE WORKFLOWS

### Workflow 2: Custom SQL Query → Content Generation

**Use Case**: Need specific data not provided by `alba_customer_intelligence`

**Step 1**: Custom BigQuery query with Alba
```json
{
  "tool": "alba_intelligent_query",
  "params": {
    "query": "SELECT MOVDSC as product, COUNT(*) as transactions, SUM(MOVMNT) as revenue FROM `chz-bi-dwh-prod.CMF.VOLCAN_TCMOV` WHERE MOVFEC >= 20250601 GROUP BY MOVDSC ORDER BY revenue DESC LIMIT 5"
  }
}
```

**Step 2**: Transform query results to `business_intelligence` format
```javascript
const customBizIntel = {
  top_products: queryResults.map(row => ({
    product_name: row.product,
    total_revenue: row.revenue,
    transaction_count: row.transactions
  })),
  data_source: "BigQuery Custom Query",
  dataset: "CMF.VOLCAN_TCMOV"
};
```

**Step 3**: Generate content with custom data
```json
{
  "tool": "generate_complete_content",
  "params": {
    "brief": "...",
    "business_intelligence": customBizIntel,
    "target_platform": "facebook"
  }
}
```

---

### Workflow 3: Explore BigQuery Schema → Query → Content

**Use Case**: Don't know what tables/fields are available

**Step 1**: Explore schema
```json
{
  "tool": "alba_explore_bigquery",
  "params": {
    "dataset": "CMF_TABLAS_TEMPORALES"
  }
}
```

**Step 2**: Use discovered tables in custom query
```json
{
  "tool": "alba_intelligent_query",
  "params": {
    "query": "SELECT * FROM `chz-bi-dwh-prod.CMF_TABLAS_TEMPORALES.KG_CMF_BASE_CLIENTES_NEURA` LIMIT 10"
  }
}
```

**Step 3**: Generate content (same as Workflow 2)

---

## VALIDATION & TESTING

### Test 1: Verify Alba Access to CMF Data

```bash
# In Claude Desktop:
"Por favor usa alba_customer_intelligence con limit 5"
```

**Expected**: Returns 5 customer records from CMF

**If fails**:
- Verify Alba MCP connected (green icon)
- Check Alba API running: http://localhost:8081
- Verify credentials: `/mnt/d/Users/aseis/AppData/Roaming/gcloud/application_default_credentials.json`

---

### Test 2: Verify Content Generation with Business Intelligence

```bash
# In Claude Desktop:
"Genera contenido para Instagram sobre Credimás usando los datos CMF que acabas de obtener"
```

**Expected**: Content with personalized data from CMF (57,774 customers, etc.)

**If fails**:
- Check `business_intelligence` parameter passed correctly
- Verify `generate_complete_content` tool available
- Check Publicidad MCP connected

---

### Test 3: Verify Backward Compatibility (Non-CMF Projects)

```bash
# In Claude Desktop:
"Genera contenido genérico para TikTok sobre moda sin datos específicos"
```

**Expected**: Content generated WITHOUT business intelligence (graceful degradation)

**If fails**: `generate_complete_content` should work even without `business_intelligence` parameter

---

## TROUBLESHOOTING

### Issue: "Alba MCP not connected"

**Solution**:
1. Check Claude Desktop MCP status
2. Restart Claude Desktop
3. Verify Alba API running: `curl http://localhost:8081/health`

---

### Issue: "No data returned from alba_customer_intelligence"

**Solution**:
1. Verify GCP credentials: `gcloud auth application-default login`
2. Check BigQuery dataset exists: `CMF_TABLAS_TEMPORALES`
3. Verify permissions on dataset

---

### Issue: "Content generated but NOT personalized with CMF data"

**Solution**:
1. Verify `business_intelligence` parameter passed correctly in Step 2
2. Check `business_intelligence` object structure matches expected format
3. Verify `has_real_data: true` in alba response

---

## BENEFITS OF THIS ARCHITECTURE

✅ **Separation of Concerns**: Alba = Data, Publicidad = Content
✅ **NO Configuration Duplication**: CMF credentials only in Alba MCP
✅ **Flexibility**: Can use Alba for OTHER purposes (not just content generation)
✅ **Maintainability**: Easier to debug (data issues = Alba, content issues = Publicidad)
✅ **Reusability**: Can add NEW clients by creating new data source MCPs

---

## NEXT STEPS

1. ✅ **Test Alba MCP access to CMF data** (Test 1)
2. ⏳ **Generate first personalized content** (Test 2)
3. ⏳ **Validate backward compatibility** (Test 3)
4. ⏳ **Document real-world use cases** (this file)
5. ⏳ **Create skill for CMF content generation** (optional)

---

**Status**: Phase 3.3 ARCHITECTURE APPROVED ✅
**Documentation**: Complete
**Next**: Execute validation tests
