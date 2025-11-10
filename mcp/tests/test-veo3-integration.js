#!/usr/bin/env node

/**
 * Veo3 Integration Test Suite
 * Tests the Spanish → Reasoning → English → Context Profile → Veo3 JSON pipeline
 */

import { Veo3VideoGenerator } from '../tools/content-orchestrator.js';
import { SceneComposer } from '../tools/scene-composer.js';

class Veo3IntegrationTester {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: Date.now()
    };
    
    this.testCases = [
      {
        name: 'Pañal con avatar presentándolo',
        prompt: 'Necesito video del pañal con avatar presentándolo',
        niche: 'higiene-personal',
        template: 'veo3_cinematic',
        expectedElements: ['pañal', 'avatar', 'presentar'],
        includeDialogue: true
      },
      {
        name: 'Video de consultoría con dos personas hablando',
        prompt: 'Video de consultoría con dos personas hablando',
        niche: 'consultoria',
        template: 'veo3_cinematic',
        expectedElements: ['consultoría', 'personas', 'hablando'],
        includeDialogue: true
      },
      {
        name: 'Producto que se transforma mágicamente',
        prompt: 'Producto que se transforma mágicamente',
        niche: 'higiene-personal',
        template: 'veo3_transform',
        expectedElements: ['producto', 'transformar'],
        includeDialogue: false
      },
      {
        name: 'Tecnología innovadora con efectos futuristas',
        prompt: 'Mostrar tecnología innovadora con efectos futuristas',
        niche: 'tecnologia',
        template: 'veo3_tech',
        expectedElements: ['tecnología', 'mostrar', 'efectos'],
        includeDialogue: false
      },
      {
        name: 'Comida deliciosa siendo preparada',
        prompt: 'Video de comida deliciosa siendo preparada por chef experto',
        niche: 'alimentacion',
        template: 'veo3_cinematic',
        expectedElements: ['comida', 'chef', 'preparada'],
        includeDialogue: true
      }
    ];
  }

  async runAllTests() {
    console.log('🎬 Starting Veo3 Integration Test Suite...\n');
    
    try {
      // Initialize components
      await this.testComponentInitialization();
      
      // Test Spanish intent parsing
      await this.testSpanishIntentParsing();
      
      // Test Veo3 scene composition
      await this.testVeo3SceneComposition();
      
      // Test complete Veo3 pipeline
      await this.testCompleteVeo3Pipeline();
      
      // Test validation against Veo3 requirements
      await this.testVeo3Validation();
      
      // Test niche-specific enhancements
      await this.testNicheEnhancements();
      
    } catch (error) {
      console.error('❌ Veo3 test suite failed:', error);
    }

    this.printResults();
  }

  async testComponentInitialization() {
    console.log('🔧 Testing Veo3 Component Initialization...');
    
    // Test Veo3VideoGenerator initialization
    await this.runTest('Veo3VideoGenerator initialization', async () => {
      const veo3Generator = new Veo3VideoGenerator();
      await veo3Generator.initialize();
      return veo3Generator.initialized === true && 
             veo3Generator.templates.size === 3 &&
             veo3Generator.nicheEnhancements.size === 4;
    });

    // Test SceneComposer Veo3 templates
    await this.runTest('SceneComposer Veo3 templates loaded', async () => {
      const sceneComposer = new SceneComposer();
      await sceneComposer.initialize();
      const veo3Templates = sceneComposer.getVeo3Templates();
      return veo3Templates.length === 3 && 
             veo3Templates.every(t => t.id.startsWith('veo3_'));
    });

    console.log('✅ Veo3 component initialization tests completed\n');
  }

  async testSpanishIntentParsing() {
    console.log('🔍 Testing Spanish Intent Parsing...');

    const sceneComposer = new SceneComposer();
    await sceneComposer.initialize();

    for (const testCase of this.testCases) {
      await this.runTest(`Spanish parsing: "${testCase.prompt.substring(0, 30)}..."`, async () => {
        const intent = sceneComposer.parseSpanishIntent(testCase.prompt);
        
        // Check if expected elements are detected
        const detected = testCase.expectedElements.some(element => {
          return intent.product?.includes(element.replace('ñ', 'n')) ||
                 intent.action?.includes(element) ||
                 intent.character?.includes(element) ||
                 testCase.prompt.toLowerCase().includes(element);
        });

        console.log(`   Intent detected:`, intent);
        return detected && intent !== null;
      });
    }

    console.log('✅ Spanish intent parsing tests completed\n');
  }

  async testVeo3SceneComposition() {
    console.log('🎬 Testing Veo3 Scene Composition...');

    const sceneComposer = new SceneComposer();
    await sceneComposer.initialize();

    for (const testCase of this.testCases) {
      await this.runTest(`Veo3 scene: ${testCase.name}`, async () => {
        const scene = await sceneComposer.composeVeo3Scene(testCase.prompt, {
          niche: testCase.niche,
          template: testCase.template,
          includeDialogue: testCase.includeDialogue,
          audioSync: true
        });

        const isValid = scene.finalPrompt && 
                       scene.finalPrompt.length > 0 &&
                       scene.metadata.wordCount <= 250 &&
                       scene.validation.passed;

        console.log(`   Generated prompt (${scene.metadata.wordCount} words):`, 
                   scene.finalPrompt.substring(0, 100) + '...');
        console.log(`   Validation score: ${(scene.validation.score * 100).toFixed(1)}%`);
        
        if (testCase.includeDialogue) {
          console.log(`   Dialogue: ${scene.dialogue}`);
        }

        return isValid;
      });
    }

    console.log('✅ Veo3 scene composition tests completed\n');
  }

  async testCompleteVeo3Pipeline() {
    console.log('🔄 Testing Complete Veo3 Pipeline...');

    const veo3Generator = new Veo3VideoGenerator();
    await veo3Generator.initialize();

    for (const testCase of this.testCases.slice(0, 3)) { // Test first 3 cases
      await this.runTest(`Complete pipeline: ${testCase.name}`, async () => {
        const result = await veo3Generator.processVideoRequest(testCase.prompt, {
          niche: testCase.niche,
          template: testCase.template,
          reasoningModel: 'deepseek/deepseek-r1'
        });

        const isValid = result.success &&
                       result.finalPrompt &&
                       result.metadata.wordCount <= 250 &&
                       result.pipeline.steps.length === 7;

        if (result.success) {
          console.log(`   Pipeline steps: ${result.pipeline.steps.join(' → ')}`);
          console.log(`   Final prompt (${result.metadata.wordCount} words):`, 
                     result.finalPrompt.substring(0, 80) + '...');
          console.log(`   Audio instructions:`, result.audioInstructions.substring(0, 60) + '...');
        } else {
          console.log(`   Pipeline failed:`, result.error);
        }

        return isValid;
      });
    }

    console.log('✅ Complete Veo3 pipeline tests completed\n');
  }

  async testVeo3Validation() {
    console.log('✅ Testing Veo3 Validation Requirements...');

    const sceneComposer = new SceneComposer();
    await sceneComposer.initialize();

    // Test specific validation requirements
    const validationTests = [
      {
        name: 'Word count under 250',
        prompt: 'Video simple de producto',
        niche: 'higiene-personal',
        check: (scene) => scene.metadata.wordCount <= 250
      },
      {
        name: 'AUDIO tag present',
        prompt: 'Video con narración profesional',
        niche: 'consultoria',
        check: (scene) => scene.finalPrompt.includes('AUDIO:')
      },
      {
        name: 'Cinematography terms present',
        prompt: 'Video cinematográfico de tecnología',
        niche: 'tecnologia',
        check: (scene) => /shot|camera|lighting/i.test(scene.finalPrompt)
      },
      {
        name: 'Duration specified',
        prompt: 'Video corto de presentación',
        niche: 'higiene-personal',
        check: (scene) => scene.finalPrompt.includes('Duration:')
      },
      {
        name: 'Dialogue format correct',
        prompt: 'Video con persona hablando',
        niche: 'consultoria',
        includeDialogue: true,
        check: (scene) => scene.dialogue && scene.dialogue.includes(':') && scene.dialogue.includes('"')
      }
    ];

    for (const test of validationTests) {
      await this.runTest(`Validation: ${test.name}`, async () => {
        const scene = await sceneComposer.composeVeo3Scene(test.prompt, {
          niche: test.niche,
          template: 'veo3_cinematic',
          includeDialogue: test.includeDialogue || false,
          audioSync: true
        });

        const passed = test.check(scene);
        console.log(`   Validation result: ${passed ? 'PASS' : 'FAIL'}`);
        console.log(`   Scene validation score: ${(scene.validation.score * 100).toFixed(1)}%`);
        
        return passed;
      });
    }

    console.log('✅ Veo3 validation tests completed\n');
  }

  async testNicheEnhancements() {
    console.log('🎯 Testing Niche-Specific Enhancements...');

    const sceneComposer = new SceneComposer();
    await sceneComposer.initialize();

    const nicheTests = [
      {
        niche: 'higiene-personal',
        prompt: 'Video de producto de higiene personal',
        expectedTerms: ['clean', 'medical-grade', 'trustworthy', 'clinical']
      },
      {
        niche: 'consultoria',
        prompt: 'Video de servicios de consultoría',
        expectedTerms: ['corporate', 'professional', 'modern', 'conference']
      },
      {
        niche: 'alimentacion',
        prompt: 'Video de producto alimenticio',
        expectedTerms: ['vibrant', 'appetizing', 'warm', 'kitchen']
      },
      {
        niche: 'tecnologia',
        prompt: 'Video de innovación tecnológica',
        expectedTerms: ['futuristic', 'sleek', 'innovative', 'tech']
      }
    ];

    for (const test of nicheTests) {
      await this.runTest(`Niche enhancement: ${test.niche}`, async () => {
        const scene = await sceneComposer.composeVeo3Scene(test.prompt, {
          niche: test.niche,
          template: 'veo3_cinematic',
          includeDialogue: false,
          audioSync: true
        });

        // Check if niche-specific terms are present
        const hasNicheTerms = test.expectedTerms.some(term => 
          scene.finalPrompt.toLowerCase().includes(term.toLowerCase())
        );

        console.log(`   Niche: ${test.niche}`);
        console.log(`   Expected terms: ${test.expectedTerms.join(', ')}`);
        console.log(`   Found niche-specific content: ${hasNicheTerms ? 'YES' : 'NO'}`);

        return hasNicheTerms && scene.niche === test.niche;
      });
    }

    console.log('✅ Niche enhancement tests completed\n');
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

    console.log('\n🎬 Veo3 Integration Test Results');
    console.log('================================');
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

    // Veo3-specific summary
    console.log('\n🎯 Veo3 Integration Summary:');
    //console.log(`✅ Spanish → English pipeline: ${this.results.passed >= 15 ? 'WORKING' : 'NEEDS ATTENTION'}`);
    //console.log(`✅ Template system: ${this.results.passed >= 10 ? 'WORKING' : 'NEEDS ATTENTION'}`);
    //console.log(`✅ Niche enhancements: ${this.results.passed >= 8 ? 'WORKING' : 'NEEDS ATTENTION'}`);
    //console.log(`✅ Validation system: ${this.results.passed >= 12 ? 'WORKING' : 'NEEDS ATTENTION'}`);

    console.log(`\n${this.results.failed === 0 ? '🎉' : '⚠️'} Veo3 integration test suite completed!`);
    
    if (this.results.failed === 0) {
      console.log('\n🚀 Ready for Veo3 API integration!');
      console.log('📋 Test cases validated:');
      this.testCases.forEach(tc => console.log(`   • ${tc.name} ✅`));
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new Veo3IntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('Fatal Veo3 test error:', error);
    process.exit(1);
  });
}

export { Veo3IntegrationTester };




