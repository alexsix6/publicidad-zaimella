#!/usr/bin/env node

/**
 * Local MCP Server Test Suite
 * Tests MCP functionality without consuming external APIs
 */

import { ContentGenerationMCPServer } from '../server.js';
import { ApiBridge } from '../adapters/api-bridge.js';
import { QdrantConnector } from '../adapters/qdrant-connector.js';
import { NicheManager } from '../tools/niche-manager.js';
import { ContentOrchestrator } from '../tools/content-orchestrator.js';

class MCPLocalTester {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: Date.now()
    };
  }

  async runAllTests() {
    console.log('🧪 Starting MCP Local Test Suite...\n');
    
    try {
      // Component initialization tests
      await this.testComponentInitialization();
      
      // Niche detection tests
      await this.testNicheDetection();
      
      // Scene composition tests
      await this.testSceneComposition();
      
      // Variant generation tests
      await this.testVariantGeneration();
      
      // Cache simulation tests
      await this.testCacheSimulation();
      
      // API Bridge tests (mock mode)
      await this.testApiBridgeMock();
      
      // Complete workflow simulation
      await this.testWorkflowSimulation();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    this.printResults();
  }

  async testComponentInitialization() {
    console.log('🔧 Testing Component Initialization...');
    
    // Test Niche Manager
    await this.runTest('NicheManager initialization', async () => {
      const nicheManager = new NicheManager();
      await nicheManager.initialize();
      return nicheManager.initialized === true;
    });

    // Test API Bridge
    await this.runTest('ApiBridge initialization', async () => {
      const apiBridge = new ApiBridge();
      await apiBridge.initialize();
      return apiBridge.initialized === true;
    });

    // Test Qdrant Connector (graceful degradation)
    await this.runTest('QdrantConnector graceful degradation', async () => {
      const qdrantConnector = new QdrantConnector();
      await qdrantConnector.initialize();
      // Should not throw error even if Qdrant is not available
      return true;
    });

    console.log('✅ Component initialization tests completed\n');
  }

  async testNicheDetection() {
    console.log('🎯 Testing Niche Detection...');

    const nicheManager = new NicheManager();
    await nicheManager.initialize();

    // Test various briefs
    const testCases = [
      {
        brief: 'Create marketing campaign for our digital agency services',
        expected: 'marketing-agency'
      },
      {
        brief: 'Promote our online store with new product launches and sales',
        expected: 'e-commerce'
      },
      {
        brief: 'Showcase luxury apartments and investment properties',
        expected: 'real-estate'
      },
      {
        brief: 'Fitness training program for weight loss and muscle building',
        expected: 'fitness'
      },
      {
        brief: 'New restaurant menu featuring authentic Italian cuisine',
        expected: 'food-beverage'
      },
      {
        brief: 'Car dealership promoting latest vehicle models and service',
        expected: 'auto'
      }
    ];

    for (const testCase of testCases) {
      await this.runTest(`Niche detection: "${testCase.brief.substring(0, 30)}..."`, async () => {
        const detected = await nicheManager.detectNiche(testCase.brief);
        console.log(`   Detected: ${detected}, Expected: ${testCase.expected}`);
        return detected === testCase.expected;
      });
    }

    // Test analysis
    await this.runTest('Brief analysis', async () => {
      const analysis = await nicheManager.analyzeBrief('Create marketing campaign for our agency');
      return analysis.niche && analysis.confidence >= 0 && analysis.recommendedPlatforms.length > 0;
    });

    console.log('✅ Niche detection tests completed\n');
  }

  async testSceneComposition() {
    console.log('🎬 Testing Scene Composition...');

    const { SceneComposer } = await import('../tools/scene-composer.js');
    const sceneComposer = new SceneComposer();
    await sceneComposer.initialize();

    const testConfigs = [
      {
        mode: 'presentation',
        niche: 'marketing-agency',
        style: 'professional modern'
      },
      {
        mode: 'interaction',
        niche: 'e-commerce',
        style: 'lifestyle casual'
      },
      {
        mode: 'demonstration',
        niche: 'fitness',
        style: 'dynamic energetic'
      }
    ];

    for (const config of testConfigs) {
      await this.runTest(`Scene composition: ${config.mode}/${config.niche}`, async () => {
        const scene = await sceneComposer.composeScene(config);
        return scene.prompt && scene.prompt.length > 0 && scene.prompt.length <= 500;
      });
    }

    console.log('✅ Scene composition tests completed\n');
  }

  async testVariantGeneration() {
    console.log('📱 Testing Variant Generation...');

    const { VariantGenerator } = await import('../tools/variant-generator.js');
    const variantGenerator = new VariantGenerator();
    await variantGenerator.initialize();

    const mockContentAssets = {
      images: [
        { type: 'product', publicUrl: 'https://example.com/product.jpg' },
        { type: 'avatar', publicUrl: 'https://example.com/avatar.jpg' }
      ],
      video: { publicUrl: 'https://example.com/video.mp4', duration: '8s' },
      copy: {
        headline: 'Transform Your Business Today',
        description: 'Discover our innovative solutions that drive real results.'
      },
      niche: 'marketing-agency'
    };

    const platforms = ['instagram', 'linkedin', 'tiktok'];

    for (const platform of platforms) {
      await this.runTest(`Variant generation: ${platform}`, async () => {
        const variant = await variantGenerator.generateVariant(platform, mockContentAssets);
        return variant.platform === platform && 
               variant.copy && 
               variant.media && 
               variant.recommendations;
      });
    }

    console.log('✅ Variant generation tests completed\n');
  }

  async testCacheSimulation() {
    console.log('💾 Testing Cache Simulation...');

    const qdrantConnector = new QdrantConnector();
    await qdrantConnector.initialize();

    // Test cache operations (will use mock if Qdrant not available)
    await this.runTest('Cache storage simulation', async () => {
      const stored = await qdrantConnector.storeContent(
        'test query',
        { type: 'test content' },
        { test: true }
      );
      // Should not fail even if Qdrant is not available
      return true;
    });

    await this.runTest('Cache search simulation', async () => {
      const result = await qdrantConnector.searchSimilar('test query');
      // Should return a result structure even if Qdrant is not available
      return result && typeof result.found === 'boolean';
    });

    console.log('✅ Cache simulation tests completed\n');
  }

  async testApiBridgeMock() {
    console.log('🌉 Testing API Bridge (Mock Mode)...');

    const apiBridge = new ApiBridge();
    await apiBridge.initialize();

    // Test cache functionality
    await this.runTest('API Bridge cache', async () => {
      const stats = apiBridge.getCacheStats();
      return stats && typeof stats.hitRate === 'number';
    });

    // Test configuration
    await this.runTest('API Bridge configuration', async () => {
      return apiBridge.baseUrl && apiBridge.cache;
    });

    console.log('✅ API Bridge tests completed\n');
  }

  async testWorkflowSimulation() {
    console.log('🔄 Testing Complete Workflow Simulation...');

    // Simulate the complete workflow without API calls
    await this.runTest('Content Orchestrator initialization', async () => {
      const orchestrator = new ContentOrchestrator();
      
      // Mock session config
      const sessionConfig = {
        brief: 'Create marketing content for our digital agency',
        niche: 'marketing-agency',
        platforms: ['instagram', 'linkedin'],
        voicePreference: 'generic',
        contextGathering: 'hybrid'
      };

      await orchestrator.initialize(sessionConfig);
      return orchestrator.initialized && orchestrator.currentSession;
    });

    // Test individual workflow steps (simulation)
    await this.runTest('Workflow step simulation', async () => {
      const orchestrator = new ContentOrchestrator();
      const sessionConfig = {
        brief: 'Test brief for simulation',
        niche: 'marketing-agency',
        platforms: ['instagram'],
        voicePreference: 'generic',
        contextGathering: 'hybrid'
      };

      await orchestrator.initialize(sessionConfig);
      
      // Simulate context gathering step
      const contextResult = await orchestrator.gatherContext(sessionConfig);
      return contextResult && contextResult.originalBrief === sessionConfig.brief;
    });

    console.log('✅ Workflow simulation tests completed\n');
  }

  async runTest(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      if (result) {
        console.log(`   ✅ ${testName} (${duration}ms)`);
        this.results.passed++;
      } else {
        console.log(`   ❌ ${testName} (${duration}ms) - Test returned false`);
        this.results.failed++;
      }
      
      this.results.tests.push({
        name: testName,
        passed: result,
        duration,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ ${testName} (${duration}ms) - Error: ${error.message}`);
      
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        passed: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  printResults() {
    const totalTime = Date.now() - this.results.startTime;
    const totalTests = this.results.passed + this.results.failed;
    const passRate = (this.results.passed / totalTests * 100).toFixed(1);

    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Total Time: ${totalTime}ms`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error || 'Test failed'}`);
        });
    }

    console.log(`\n${this.results.failed === 0 ? '🎉' : '⚠️'} Test suite completed!`);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPLocalTester();
  tester.runAllTests().catch(error => {
    console.error('Fatal test error:', error);
    process.exit(1);
  });
}

export { MCPLocalTester };




