/**
 * Niche Manager - Industry-specific context detection and management
 * Provides auto-detection of industry niches and optimal context application
 */

import { promises as fs } from 'fs';
import path from 'path';

export class NicheManager {
  constructor() {
    this.niches = new Map();
    this.initialized = false;
    this.nichesDir = path.join(process.cwd(), 'mcp', 'niches');
  }

  async initialize() {
    if (this.initialized) return;

    //console.log('🎯 Initializing Niche Manager...');
    
    try {
      // Ensure niches directory exists
      await fs.mkdir(this.nichesDir, { recursive: true });
      
      // Load or create niche definitions
      await this.loadNicheDefinitions();
      
      this.initialized = true;
      ////console.log(`✅ Niche Manager initialized with ${this.niches.size} niches`);
    } catch (error) {
      //console.error('❌ Failed to initialize Niche Manager:', error);
      throw error;
    }
  }

  async loadNicheDefinitions() {
    const nicheDefinitions = [
      {
        id: 'marketing-agency',
        name: 'Marketing Agency',
        keywords: ['marketing', 'agency', 'brand', 'campaign', 'advertising', 'promotion', 'client', 'strategy'],
        targetAudience: 'Business professionals and decision makers',
        keyMessaging: ['professional excellence', 'proven results', 'strategic thinking', 'creative solutions'],
        visualStyle: 'modern professional, clean lines, corporate colors',
        optimalPlatforms: ['linkedin', 'x-twitter', 'facebook'],
        bestPractices: [
          'Focus on ROI and measurable results',
          'Use professional imagery and clean layouts',
          'Emphasize expertise and case studies',
          'Include clear call-to-actions'
        ],
        trends: [
          'Data-driven marketing approaches',
          'Personalized content strategies',
          'Multi-channel campaign integration'
        ]
      },
      {
        id: 'e-commerce',
        name: 'E-commerce',
        keywords: ['shop', 'buy', 'product', 'sale', 'discount', 'store', 'online', 'retail', 'purchase'],
        targetAudience: 'Online shoppers and consumers',
        keyMessaging: ['quality products', 'competitive prices', 'fast shipping', 'customer satisfaction'],
        visualStyle: 'clean product photography, bright colors, lifestyle contexts',
        optimalPlatforms: ['instagram', 'facebook', 'tiktok'],
        bestPractices: [
          'High-quality product images with multiple angles',
          'Clear pricing and shipping information',
          'Customer reviews and social proof',
          'Easy checkout process promotion'
        ],
        trends: [
          'Social commerce integration',
          'AR/VR product visualization',
          'Sustainable and eco-friendly messaging'
        ]
      },
      {
        id: 'real-estate',
        name: 'Real Estate',
        keywords: ['property', 'house', 'home', 'apartment', 'real estate', 'buy', 'sell', 'rent', 'investment'],
        targetAudience: 'Property buyers, sellers, and investors',
        keyMessaging: ['prime locations', 'investment opportunity', 'dream home', 'professional service'],
        visualStyle: 'architectural photography, warm lighting, lifestyle imagery',
        optimalPlatforms: ['facebook', 'instagram', 'linkedin'],
        bestPractices: [
          'Professional property photography',
          'Virtual tours and 360° views',
          'Local market expertise emphasis',
          'Testimonials from satisfied clients'
        ],
        trends: [
          'Virtual reality property tours',
          'Drone photography for exteriors',
          'Smart home technology highlights'
        ]
      },
      {
        id: 'fitness',
        name: 'Fitness & Health',
        keywords: ['fitness', 'gym', 'workout', 'health', 'training', 'exercise', 'nutrition', 'wellness'],
        targetAudience: 'Health-conscious individuals and fitness enthusiasts',
        keyMessaging: ['transform your body', 'achieve your goals', 'healthy lifestyle', 'expert guidance'],
        visualStyle: 'dynamic action shots, motivational imagery, before/after transformations',
        optimalPlatforms: ['instagram', 'tiktok', 'youtube'],
        bestPractices: [
          'Show real transformations and results',
          'Include workout demonstrations',
          'Emphasize community and support',
          'Use motivational and inspiring language'
        ],
        trends: [
          'Home workout solutions',
          'Wearable technology integration',
          'Mental health and wellness focus'
        ]
      },
      {
        id: 'food-beverage',
        name: 'Food & Beverage',
        keywords: ['food', 'restaurant', 'menu', 'drink', 'recipe', 'cuisine', 'dining', 'chef', 'delicious'],
        targetAudience: 'Food enthusiasts and potential diners',
        keyMessaging: ['fresh ingredients', 'authentic flavors', 'culinary excellence', 'memorable experience'],
        visualStyle: 'appetizing food photography, warm colors, lifestyle dining scenes',
        optimalPlatforms: ['instagram', 'tiktok', 'facebook'],
        bestPractices: [
          'High-quality food photography with proper lighting',
          'Show preparation process and behind-the-scenes',
          'Highlight unique ingredients or techniques',
          'Include customer dining experiences'
        ],
        trends: [
          'Plant-based and sustainable options',
          'Interactive cooking content',
          'Local sourcing and farm-to-table'
        ]
      },
      {
        id: 'auto',
        name: 'Automotive',
        keywords: ['car', 'auto', 'vehicle', 'drive', 'automotive', 'dealer', 'service', 'parts', 'maintenance'],
        targetAudience: 'Car buyers and automotive enthusiasts',
        keyMessaging: ['reliability', 'performance', 'innovation', 'value'],
        visualStyle: 'sleek vehicle photography, dynamic angles, lifestyle driving scenes',
        optimalPlatforms: ['facebook', 'instagram', 'youtube'],
        bestPractices: [
          'Showcase vehicle features and technology',
          'Include performance specifications',
          'Show vehicles in attractive settings',
          'Emphasize safety and reliability'
        ],
        trends: [
          'Electric vehicle adoption',
          '360° vehicle viewing experiences',
          'Autonomous driving features'
        ]
      }
    ];

    // Save each niche definition and load into memory
    for (const niche of nicheDefinitions) {
      const filePath = path.join(this.nichesDir, `${niche.id}.json`);
      
      try {
        // Check if file exists, if not create it
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(filePath, JSON.stringify(niche, null, 2));
        ////console.log(`📝 Created niche definition: ${niche.id}`);
      }
      
      // Load into memory
      this.niches.set(niche.id, niche);
    }
  }

  /**
   * Auto-detect niche from brief content (ENHANCED - Phase 2: Generic Detection)
   * Now supports ANY industry, not limited to 6 predefined niches
   */
  async detectNiche(brief) {
    // STEP 1: Try known niches first (for optimization with existing definitions)
    const briefLower = brief.toLowerCase();
    const nicheScores = new Map();

    for (const [nicheId, niche] of this.niches) {
      let score = 0;

      for (const keyword of niche.keywords) {
        if (briefLower.includes(keyword)) {
          score += 1;
        }
      }

      // Normalize score by number of keywords
      const normalizedScore = score / niche.keywords.length;
      nicheScores.set(nicheId, normalizedScore);
    }

    // Find the highest scoring known niche
    let bestKnownNiche = null;
    let bestKnownScore = 0;

    for (const [nicheId, score] of nicheScores) {
      if (score > bestKnownScore) {
        bestKnownNiche = nicheId;
        bestKnownScore = score;
      }
    }

    // If we found a good match in known niches (>40% confidence), use it
    if (bestKnownScore > 0.4) {
      console.log(`🎯 Auto-detected KNOWN niche: ${bestKnownNiche} (confidence: ${(bestKnownScore * 100).toFixed(1)}%)`);
      return bestKnownNiche;
    }

    // STEP 2: Generic extraction for unknown industries
    // Extract industry semantically (similar to skills detection)
    const extractedNiche = await this.extractIndustryFromBrief(brief);

    console.log(`🎯 Auto-detected GENERIC niche: ${extractedNiche} (semantic extraction)`);

    return extractedNiche;
  }

  /**
   * Extract industry from brief using semantic understanding (NUEVO - Phase 2)
   * Similar to skills trigger detection - understands intention, not keywords
   */
  async extractIndustryFromBrief(brief) {
    // Common industry indicators (semantic patterns, NOT exhaustive list)
    const industryPatterns = [
      // Healthcare/Medical
      { pattern: /\b(health|medical|hospital|clinic|doctor|patient|healthcare|pharmaceutical|wellness center)\b/i, industry: 'healthcare' },
      // Education
      { pattern: /\b(school|university|education|learning|course|training|academic|student|teacher)\b/i, industry: 'education' },
      // Technology
      { pattern: /\b(software|tech|app|platform|digital|SaaS|AI|cloud|startup)\b/i, industry: 'technology' },
      // Finance
      { pattern: /\b(bank|finance|investment|loan|insurance|credit|fintech|trading)\b/i, industry: 'finance' },
      // Legal
      { pattern: /\b(law|legal|attorney|lawyer|court|litigation|paralegal)\b/i, industry: 'legal' },
      // Hospitality/Travel
      { pattern: /\b(hotel|travel|tourism|resort|vacation|booking|hospitality)\b/i, industry: 'hospitality' },
      // Construction
      { pattern: /\b(construction|contractor|building|renovation|architect|engineering)\b/i, industry: 'construction' },
      // Retail (general)
      { pattern: /\b(retail|shopping|merchandise|boutique|store front)\b/i, industry: 'retail' },
      // Professional Services
      { pattern: /\b(consulting|consultant|professional services|advisory)\b/i, industry: 'professional-services' },
      // Non-profit
      { pattern: /\b(nonprofit|charity|foundation|donation|volunteer|NGO)\b/i, industry: 'non-profit' },
      // Entertainment
      { pattern: /\b(entertainment|event|concert|festival|performance|venue)\b/i, industry: 'entertainment' }
    ];

    // Try to match against semantic patterns
    for (const { pattern, industry } of industryPatterns) {
      if (pattern.test(brief)) {
        return industry;
      }
    }

    // Fallback: Try to extract dominant noun/theme
    // Look for capitalized terms or repeated concepts
    const words = brief.match(/\b[A-Z][a-z]+\b/g) || [];
    if (words.length > 0) {
      // Use first capitalized word as industry hint
      const hint = words[0].toLowerCase();
      console.log(`  ℹ️  Using extracted term as niche: ${hint}`);
      return hint;
    }

    // Final fallback: generic (NOT marketing-agency - neutral default)
    console.log(`  ⚠️  Could not determine specific niche, using 'generic'`);
    return 'generic';
  }

  /**
   * ✅ PHASE 2 - FRAMEWORK SEEDS DETECTION
   * Detect Todd Brown 5 hook types opportunities in brief
   */
  detectHookOpportunities(brief) {
    const briefLower = brief.toLowerCase();

    // Mechanism hook: unique ingredients, process, technology, system
    const mechanismPatterns = /\b(formula|ingredient|system|process|technology|method|technique|patented|proprietary|unique|secret|exclusive|with|contains|includes)\b/i;
    let mechanismHint = null;
    if (mechanismPatterns.test(brief)) {
      // Extract mechanism phrase (words around mechanism keyword)
      const match = brief.match(/\b([\w\s]+(?:formula|ingredient|system|process|technology|method)[\w\s]*)/i);
      mechanismHint = match ? match[1].trim() : null;
    }

    // Proof hook: testimonials, reviews, results, studies, customers
    const proofPatterns = /\b(testimonial|review|rating|customer|client|study|research|proven|verified|certified|award|endorsed)\b/i;
    const proofHint = proofPatterns.test(brief) ? "Evidence/social proof mentioned" : null;

    // Big promise hook: specific outcomes, timeframes, guarantees
    const promisePatterns = /\b(reduce|increase|improve|achieve|guarantee|results? in|within|by|up to|\d+%|\d+ (days?|weeks?|months?))\b/i;
    let promiseHint = null;
    if (promisePatterns.test(brief)) {
      // Extract promise phrase
      const match = brief.match(/\b(reduce|increase|improve|achieve)[\w\s]+(in|within)?\s*\d+\s*(days?|weeks?|months?)/i);
      promiseHint = match ? match[0].trim() : "Specific outcome promised";
    }

    // Enemy hook: problem, pain, obstacle, avoid
    const enemyPatterns = /\b(problem|pain|issue|struggle|difficult|avoid|prevent|eliminate|stop|without)\b/i;
    let enemyHint = null;
    if (enemyPatterns.test(brief)) {
      const match = brief.match(/\b(problem|pain|issue|struggle|difficult|avoid|prevent|eliminate|stop)[\w\s]*/i);
      enemyHint = match ? match[1].trim() : "Problem/obstacle identified";
    }

    // Curiosity hook: secret, discover, revealed, surprising, little-known
    const curiosityPatterns = /\b(secret|discover|reveal|surprising|unknown|little-known|hidden|insider|exclusive access)\b/i;
    const curiosityHint = curiosityPatterns.test(brief) ? "Curiosity/intrigue element" : null;

    return {
      mechanism: mechanismHint,
      proof: proofHint,
      big_promise: promiseHint,
      enemy: enemyHint,
      curiosity: curiosityHint
    };
  }

  /**
   * ✅ PHASE 2 - Extract pain points and dream outcome from brief
   */
  extractPainPoints(brief) {
    const painPoints = [];
    let dreamOutcome = null;

    // Pain point indicators
    const painPatterns = [
      /\b(problem|issue|struggle|difficult|challenge|pain|frustrat\w+|worry|concern|afraid|fear)\b/gi,
      /\b(avoid|prevent|stop|eliminate|reduce)\s+([\w\s]+)/gi
    ];

    for (const pattern of painPatterns) {
      const matches = brief.matchAll(pattern);
      for (const match of matches) {
        const context = brief.substring(Math.max(0, match.index - 20), Math.min(brief.length, match.index + 50));
        painPoints.push(context.trim());
      }
    }

    // Dream outcome indicators (positive outcomes)
    const outcomePatterns = [
      /\b(achieve|reach|get|obtain|transform|improve|increase|enhance|boost)\s+([\w\s]+)/i,
      /\b(goal|dream|desire|aspiration|want|need|wish)\s+to\s+([\w\s]+)/i
    ];

    for (const pattern of outcomePatterns) {
      const match = brief.match(pattern);
      if (match) {
        dreamOutcome = match[0].trim();
        break; // Take first dream outcome found
      }
    }

    // Fallback: extract from promise language
    if (!dreamOutcome) {
      const promiseMatch = brief.match(/\b(reduce|increase|improve|achieve|transform)[\w\s]+(results?|outcomes?|benefits?)/i);
      if (promiseMatch) {
        dreamOutcome = promiseMatch[0].trim();
      }
    }

    return {
      pain_points: painPoints.slice(0, 3), // Top 3 pain points
      dream_outcome: dreamOutcome
    };
  }

  /**
   * ✅ PHASE 2 - Detect market sophistication level (Todd Brown Stage 1-5)
   */
  detectSophisticationLevel(brief) {
    const briefLower = brief.toLowerCase();

    // Stage 5: Identity/experience-based (highest sophistication)
    if (/\b(identity|lifestyle|who you are|belong|community|movement|revolution)\b/i.test(brief)) {
      return { level: "Stage 5", description: "Identity/experience-based positioning" };
    }

    // Stage 4: Enhanced mechanism
    if (/\b(improved|enhanced|advanced|new version|upgraded|better|optimized|2\.0|next generation)\b/i.test(brief)) {
      return { level: "Stage 4", description: "Enhanced mechanism positioning" };
    }

    // Stage 3: Unique mechanism
    if (/\b(unique|proprietary|patented|exclusive|secret|formula|system|process|technology|method)\b/i.test(brief)) {
      return { level: "Stage 3", description: "Unique mechanism positioning" };
    }

    // Stage 2: Elaborated claim
    if (/\b(because|due to|thanks to|powered by|with|using|contains|includes)\b/i.test(brief)) {
      return { level: "Stage 2", description: "Elaborated claim with reasoning" };
    }

    // Stage 1: Direct claim (lowest sophistication)
    return { level: "Stage 1", description: "Direct claim without elaboration" };
  }

  /**
   * ✅ PHASE 2 - Extract value indicators (price, guarantees, bonuses, urgency)
   */
  extractValueIndicators(brief) {
    const indicators = {
      price_mentioned: false,
      price_value: null,
      currency: null,
      bonus_detected: null,
      urgency_detected: false,
      guarantee_detected: false
    };

    // Price detection
    const pricePatterns = [
      /\$(\d+(?:\.\d{2})?)/,   // $49.99
      /€(\d+(?:\.\d{2})?)/,    // €49.99
      /(\d+(?:\.\d{2})?)\s*(USD|EUR|GBP|MXN|ARS|CLP)/i  // 49.99 USD
    ];

    for (const pattern of pricePatterns) {
      const match = brief.match(pattern);
      if (match) {
        indicators.price_mentioned = true;
        indicators.price_value = parseFloat(match[1]);
        indicators.currency = match[2] || 'USD'; // Default to USD if $ symbol
        break;
      }
    }

    // Bonus detection
    const bonusPatterns = /\b(bonus|free|gift|complimentary|included|plus|extra|additional|envío gratis|shipping free)\b/i;
    const bonusMatch = brief.match(bonusPatterns);
    if (bonusMatch) {
      // Extract bonus context
      const bonusContext = brief.substring(Math.max(0, bonusMatch.index - 10), Math.min(brief.length, bonusMatch.index + 40));
      indicators.bonus_detected = bonusContext.trim();
    }

    // Urgency detection
    const urgencyPatterns = /\b(limited|exclusive|only|hurry|now|today|expires|deadline|last chance|while supplies last|act fast)\b/i;
    indicators.urgency_detected = urgencyPatterns.test(brief);

    // Guarantee detection
    const guaranteePatterns = /\b(guarantee|warranty|refund|money.?back|satisfaction|risk.?free|trial)\b/i;
    indicators.guarantee_detected = guaranteePatterns.test(brief);

    return indicators;
  }

  /**
   * ✅ PHASE 2 - Extract demographics (age, gender) from brief
   */
  extractDemographics(brief) {
    const demographics = {
      gender: null,
      age_range: null
    };

    // Gender detection
    const genderPatterns = [
      { pattern: /\b(women|female|ladies|mujeres|femenino)\b/i, gender: 'mujeres' },
      { pattern: /\b(men|male|hombres|masculino|guys)\b/i, gender: 'hombres' },
      { pattern: /\b(unisex|everyone|all|todos|ambos|any gender)\b/i, gender: 'todos' }
    ];

    for (const { pattern, gender } of genderPatterns) {
      if (pattern.test(brief)) {
        demographics.gender = gender;
        break;
      }
    }

    // Age range detection
    const agePatterns = [
      { pattern: /\b(\d{2})-(\d{2})\s*(years?|años?)\b/i, extract: (m) => m[0] },
      { pattern: /\b(18-24|25-34|35-44|45-54|55-64|65\+)\b/i, extract: (m) => m[0] },
      { pattern: /\b(teens?|teenager|adolescente)\b/i, age: '13-19' },
      { pattern: /\b(young adults?|jóvenes)\b/i, age: '18-30' },
      { pattern: /\b(adults?|adultos)\b/i, age: '25-55' },
      { pattern: /\b(seniors?|elderly|mayores)\b/i, age: '60+' }
    ];

    for (const { pattern, extract, age } of agePatterns) {
      const match = brief.match(pattern);
      if (match) {
        demographics.age_range = extract ? extract(match) : age;
        break;
      }
    }

    return demographics;
  }

  /**
   * ✅ PHASE 3 - MVP BIGQUERY DATA INTEGRATION
   * Fetch real client business data from BigQuery to enrich content generation
   * @param {string} clientId - Client identifier in BigQuery
   * @param {string} dataset - BigQuery dataset name (default: 'client_analytics')
   * @returns {Promise<Object>} business_intelligence object with real client data
   */
  async fetchClientBusinessData(clientId, dataset = 'client_analytics') {
    try {
      console.log(`📊 Fetching business intelligence for client: ${clientId} from BigQuery...`);

      // Query 1: Top selling products (last 6 months)
      const topProductsQuery = `
        SELECT
          product_name,
          SUM(units_sold) as total_units_sold,
          SUM(revenue) as total_revenue,
          ROUND(AVG(customer_rating), 1) as avg_rating
        FROM \`${dataset}.sales\`
        WHERE client_id = '${clientId}'
          AND order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY product_name
        ORDER BY total_revenue DESC
        LIMIT 5
      `;

      // Query 2: Real customer demographics
      const demographicsQuery = `
        SELECT
          ROUND(AVG(customer_age), 0) as avg_age,
          ROUND(COUNT(CASE WHEN gender='F' THEN 1 END)*100.0/COUNT(*), 1) as female_pct,
          ROUND(COUNT(CASE WHEN gender='M' THEN 1 END)*100.0/COUNT(*), 1) as male_pct,
          ROUND(AVG(order_value), 2) as avg_order_value,
          COUNT(DISTINCT customer_id) as total_customers
        FROM \`${dataset}.customers\`
        WHERE client_id = '${clientId}'
      `;

      // Query 3: Best performing ad copy phrases (highest conversion)
      const bestPhrasesQuery = `
        SELECT
          ad_copy_phrase,
          ROUND(conversion_rate * 100, 2) as conversion_rate_pct,
          impressions,
          clicks,
          conversions
        FROM \`${dataset}.campaign_performance\`
        WHERE client_id = '${clientId}'
          AND campaign_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
        ORDER BY conversion_rate DESC
        LIMIT 5
      `;

      // Query 4: Seasonal sales patterns (identify peak months)
      const seasonalQuery = `
        SELECT
          FORMAT_DATE('%Y-%m', order_date) as month,
          COUNT(*) as order_count,
          ROUND(SUM(revenue), 2) as total_revenue
        FROM \`${dataset}.sales\`
        WHERE client_id = '${clientId}'
          AND order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY total_revenue DESC
        LIMIT 3
      `;

      // Execute all 4 queries in parallel using MCP BigQuery
      const [topProducts, demographics, bestPhrases, seasonal] = await Promise.all([
        this.executeBigQuerySafe(topProductsQuery, 'top_products'),
        this.executeBigQuerySafe(demographicsQuery, 'demographics'),
        this.executeBigQuerySafe(bestPhrasesQuery, 'best_phrases'),
        this.executeBigQuerySafe(seasonalQuery, 'seasonal_patterns')
      ]);

      // Structure business intelligence
      const businessIntelligence = {
        client_id: clientId,
        top_selling_products: topProducts || [],
        real_customer_demographics: demographics || null,
        proven_copy_phrases: bestPhrases || [],
        seasonal_patterns: seasonal || [],
        data_source: 'BigQuery',
        dataset: dataset,
        fetched_at: new Date().toISOString(),
        has_real_data: !!(topProducts?.length || demographics || bestPhrases?.length)
      };

      console.log(`✅ Business intelligence fetched successfully for ${clientId}`);
      console.log(`   - Top products: ${topProducts?.length || 0}`);
      console.log(`   - Demographics: ${demographics ? 'Available' : 'Not found'}`);
      console.log(`   - Proven phrases: ${bestPhrases?.length || 0}`);
      console.log(`   - Seasonal patterns: ${seasonal?.length || 0}`);

      return businessIntelligence;

    } catch (error) {
      // ✅ GRACEFUL DEGRADATION: If BigQuery fails, return null (Tool #2 continues without business data)
      console.warn(`⚠️  BigQuery data fetch failed for client ${clientId}:`, error.message);
      console.warn(`   Continuing with Phase 2 functionality (framework_seeds only)`);

      return null;
    }
  }

  /**
   * Helper method to execute BigQuery queries safely with error handling
   * @param {string} query - SQL query to execute
   * @param {string} queryType - Query identifier for logging
   * @returns {Promise<Array|null>} Query results or null on error
   */
  async executeBigQuerySafe(query, queryType) {
    try {
      // Call MCP BigQuery Intelligence tool
      const result = await mcp__bigquery_intelligence__query({
        sql: query,
        maximumBytesBilled: '10000000' // 10 MB limit per query (safety)
      });

      // Extract rows from result
      if (result && result.data && result.data.rows) {
        return result.data.rows;
      }

      console.warn(`   ⚠️  No data returned for ${queryType}`);
      return null;

    } catch (error) {
      console.warn(`   ⚠️  Query failed for ${queryType}:`, error.message);
      return null;
    }
  }

  /**
   * Analyze brief and provide recommendations (✅ ENHANCED - Phase 2 + Phase 3 with BigQuery)
   * @param {string} brief - Content brief to analyze
   * @param {string} clientId - Optional client ID for BigQuery data enrichment
   * @param {string} dataset - Optional BigQuery dataset (default: 'client_analytics')
   */
  async analyzeBrief(brief, clientId = null, dataset = 'client_analytics') {
    const detectedNiche = await this.detectNiche(brief);
    const nicheData = this.niches.get(detectedNiche);

    // ✅ PHASE 2: Generate framework seeds (before niche-specific processing)
    const hookOpportunities = this.detectHookOpportunities(brief);
    const painPointsData = this.extractPainPoints(brief);
    const sophisticationData = this.detectSophisticationLevel(brief);
    const valueIndicators = this.extractValueIndicators(brief);
    const demographics = this.extractDemographics(brief);

    // ✅ PHASE 3: Fetch business intelligence from BigQuery (if clientId provided)
    let businessIntelligence = null;
    if (clientId) {
      businessIntelligence = await this.fetchClientBusinessData(clientId, dataset);
    }

    // GRACEFUL FALLBACK: Handle generic niches without throwing error
    if (!nicheData) {
      console.log(`  ℹ️  No definition for niche '${detectedNiche}', generating generic analysis`);

      // Generic confidence (moderate since we did semantic extraction)
      const confidence = 0.6;

      // Generic video approach
      const videoApproach = 'Professional presentation highlighting key value proposition';

      // Generic insights based on best practices
      return {
        niche: detectedNiche,
        confidence,
        recommendedPlatforms: ['instagram', 'facebook', 'linkedin'], // Multi-platform default
        suggestedStyle: 'professional, clean, modern',
        videoApproach,
        insights: [
          `Target audience: General audience interested in ${detectedNiche}`,
          `Key messaging should focus on: Value proposition and quality`,
          `Visual style: Use high-quality professional imagery`,
          `Tone: Conversational yet authoritative`
        ],
        isGeneric: true, // Flag to indicate fallback mode

        // ✅ PHASE 2 + PHASE 3: Framework seeds + Business Intelligence
        framework_seeds: {
          hook_opportunities: hookOpportunities,
          pain_points: painPointsData.pain_points,
          dream_outcome: painPointsData.dream_outcome,
          sophistication_level: sophisticationData.level,
          sophistication_description: sophisticationData.description,
          value_indicators: valueIndicators,
          target_demographics: demographics,
          // ✅ PHASE 3: Real client business data from BigQuery
          business_intelligence: businessIntelligence
        }
      };
    }

    // Calculate confidence based on keyword matches
    const briefLower = brief.toLowerCase();
    let matches = 0;
    for (const keyword of nicheData.keywords) {
      if (briefLower.includes(keyword)) {
        matches++;
      }
    }
    const confidence = matches / nicheData.keywords.length;

    // Determine video approach based on niche
    const videoApproaches = {
      'marketing-agency': 'Professional presentation with data visualization',
      'e-commerce': 'Product showcase with lifestyle context',
      'real-estate': 'Property tour with ambient narration',
      'fitness': 'Dynamic workout demonstration',
      'food-beverage': 'Appetizing close-ups with preparation process',
      'auto': 'Vehicle showcase with performance highlights'
    };

    return {
      niche: detectedNiche,
      confidence,
      recommendedPlatforms: nicheData.optimalPlatforms,
      suggestedStyle: nicheData.visualStyle,
      videoApproach: videoApproaches[detectedNiche] || 'General presentation style',
      insights: [
        `Target audience: ${nicheData.targetAudience}`,
        `Key messaging should focus on: ${nicheData.keyMessaging.slice(0, 2).join(' and ')}`,
        `Visual style should be: ${nicheData.visualStyle}`,
        `Best performing platforms: ${nicheData.optimalPlatforms.join(', ')}`
      ],

      // ✅ PHASE 2 + PHASE 3: Framework seeds + Business Intelligence
      framework_seeds: {
        hook_opportunities: hookOpportunities,
        pain_points: painPointsData.pain_points,
        dream_outcome: painPointsData.dream_outcome,
        sophistication_level: sophisticationData.level,
        sophistication_description: sophisticationData.description,
        value_indicators: valueIndicators,
        target_demographics: demographics,
        // ✅ PHASE 3: Real client business data from BigQuery
        business_intelligence: businessIntelligence
      }
    };
  }

  /**
   * ✅ PHASE 2 - Generate default framework metadata for unknown/generic niches
   */
  generateDefaultFrameworkMetadata(nicheId) {
    return {
      avatar_profile_seeds: {
        typical_demographics: {
          age_range: "25-55",
          gender_distribution: "50% female, 50% male",
          income_range: "$30K-$80K annually",
          occupation_clusters: ["professionals", "business owners", "consumers"]
        },
        typical_psychographics: {
          core_values: ["quality", "value", "reliability"],
          lifestyle: "modern, digital-first",
          aspirations: ["improvement", "success", "satisfaction"],
          fears: ["wasted money", "poor quality", "bad service"]
        },
        common_pain_points: [
          "Hard to find reliable solutions",
          "Too many options to choose from",
          "Unsure about quality"
        ],
        typical_dream_outcomes: [
          "Find the right solution",
          "Get value for money",
          "Achieve desired results"
        ]
      },
      mechanism_patterns: {
        effective_mechanisms: ["Quality guarantee", "Expert service", "Proven results"],
        proof_types: {
          most_effective: "testimonials",
          ranking: ["testimonials", "reviews", "case studies"]
        },
        credibility_elements: ["certifications", "awards", "expertise"]
      },
      offer_positioning_patterns: {
        typical_price_ranges: {
          budget: "$10-$50",
          mid_range: "$50-$200",
          premium: "$200+"
        },
        guarantee_structures: ["satisfaction guaranteed", "money-back"],
        common_bonuses: ["free consultation", "bonus materials"],
        urgency_tactics: ["limited time offer", "special discount"]
      },
      hook_preferences: {
        effectiveness_ranking: [
          { type: "mechanism", effectiveness: 75, note: "Focus on unique approach" },
          { type: "proof", effectiveness: 80, note: "Social proof is universal" },
          { type: "big_promise", effectiveness: 70, note: "Specific outcomes" },
          { type: "enemy", effectiveness: 65, note: "Problem awareness" },
          { type: "curiosity", effectiveness: 60, note: "Generate interest" }
        ],
        typical_sophistication: "Stage 2-3",
        effective_angles: [
          "Value angle: Get more for less",
          "Quality angle: Premium quality",
          "Results angle: Achieve your goals"
        ]
      }
    };
  }

  /**
   * Get detailed insights for a specific niche (✅ ENHANCED - Phase 2 with framework_metadata)
   * Now supports ANY industry - creates generic insights if niche definition doesn't exist
   */
  async getNicheInsights(nicheId) {
    const niche = this.niches.get(nicheId);

    // If niche definition exists, use it
    if (niche) {
      return {
        id: niche.id,
        name: niche.name,
        targetAudience: niche.targetAudience,
        keyMessaging: niche.keyMessaging,
        visualStyle: niche.visualStyle,
        optimalPlatforms: niche.optimalPlatforms,
        bestPractices: niche.bestPractices,
        trends: niche.trends,
        keywords: niche.keywords,

        // ✅ PHASE 2: Framework metadata (use niche-specific if exists, else default)
        framework_metadata: niche.framework_metadata || this.generateDefaultFrameworkMetadata(nicheId)
      };
    }

    // GRACEFUL FALLBACK: Create generic insights for unknown niche
    console.log(`  ℹ️  No definition for niche '${nicheId}', generating generic insights`);

    // Capitalize niche name for display
    const displayName = nicheId.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return {
      id: nicheId,
      name: displayName,
      targetAudience: 'General audience',
      keyMessaging: [
        'Value proposition',
        'Quality and reliability',
        'Customer satisfaction',
        'Innovation and results'
      ],
      visualStyle: 'professional, clean, modern',
      optimalPlatforms: ['instagram', 'facebook', 'linkedin'], // Default multi-platform
      bestPractices: [
        'Use high-quality imagery',
        'Craft clear and compelling messaging',
        'Include strong call-to-actions',
        'Highlight unique value proposition'
      ],
      trends: [
        'Digital-first approaches',
        'Personalized experiences',
        'Social proof and testimonials'
      ],
      keywords: [nicheId, 'professional', 'quality', 'service'],
      isGeneric: true, // Flag to indicate this is a generated fallback

      // ✅ PHASE 2: Framework metadata (use default for unknown niches)
      framework_metadata: this.generateDefaultFrameworkMetadata(nicheId)
    };
  }

  /**
   * Get optimal context profile for a niche
   */
  async getOptimalContextProfile(nicheId) {
    // This would integrate with existing context profiles system
    // For now, return a mock structure
    const niche = this.niches.get(nicheId);
    
    if (!niche) {
      return null;
    }

    return {
      id: `${nicheId}_optimal_profile`,
      name: `${niche.name} Optimal Profile`,
      context: {
        user_preferences: {
          style: niche.visualStyle,
          target_audience: niche.targetAudience
        },
        project_context: {
          niche: nicheId,
          key_messaging: niche.keyMessaging
        },
        technical_preferences: {
          platforms: niche.optimalPlatforms,
          quality: 'ultra-high'
        }
      }
    };
  }

  /**
   * Learn from successful content generation
   */
  async updateNicheFromSuccess(nicheId, brief, results, feedback) {
    const niche = this.niches.get(nicheId);
    
    if (!niche) {
      //console.warn(`Cannot update unknown niche: ${nicheId}`);
      return;
    }

    // Extract new keywords from successful brief
    const briefWords = brief.toLowerCase().split(/\s+/);
    const newKeywords = briefWords.filter(word => 
      word.length > 3 && 
      !niche.keywords.includes(word) &&
      /^[a-z]+$/.test(word) // Only alphabetic words
    );

    if (newKeywords.length > 0) {
      niche.keywords.push(...newKeywords.slice(0, 3)); // Add up to 3 new keywords
      
      // Save updated niche
      const filePath = path.join(this.nichesDir, `${nicheId}.json`);
      await fs.writeFile(filePath, JSON.stringify(niche, null, 2));
      
      //console.log(`📈 Updated niche ${nicheId} with new keywords: ${newKeywords.join(', ')}`);
    }
  }

  /**
   * Get all available niches
   */
  getAllNiches() {
    return Array.from(this.niches.values()).map(niche => ({
      id: niche.id,
      name: niche.name,
      targetAudience: niche.targetAudience,
      optimalPlatforms: niche.optimalPlatforms
    }));
  }

  /**
   * Get niche statistics
   */
  getNicheStats() {
    const stats = {};
    
    for (const [nicheId, niche] of this.niches) {
      stats[nicheId] = {
        keywordsCount: niche.keywords.length,
        platformsCount: niche.optimalPlatforms.length,
        messagingPoints: niche.keyMessaging.length,
        bestPracticesCount: niche.bestPractices.length
      };
    }

    return {
      totalNiches: this.niches.size,
      niches: stats
    };
  }
}


