/**
 * Image Compositor Test Suite
 *
 * Tests all 3 layouts with generated test images:
 * - side-by-side
 * - avatar-holding
 * - overlay
 *
 * Run: node mcp/tests/test-image-compositor.js
 */

import { composeImages, getRecommendedLayout } from '../../lib/image-compositor.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test output directory
const TEST_OUTPUT_DIR = path.join(__dirname, '../../public/test-compositions');

/**
 * Generate test product image (blue rectangle with "PRODUCT" text)
 */
async function generateTestProductImage() {
  const width = 800;
  const height = 800;

  const svgImage = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#2563eb"/>
      <text x="50%" y="50%" font-family="Arial" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">
        PRODUCT
      </text>
    </svg>
  `;

  return await sharp(Buffer.from(svgImage))
    .png()
    .toBuffer();
}

/**
 * Generate test avatar image (orange circle with "AVATAR" text)
 */
async function generateTestAvatarImage() {
  const width = 800;
  const height = 800;

  const svgImage = `
    <svg width="${width}" height="${height}">
      <circle cx="${width/2}" cy="${height/2}" r="${width/2.5}" fill="#f97316"/>
      <text x="50%" y="50%" font-family="Arial" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">
        AVATAR
      </text>
    </svg>
  `;

  return await sharp(Buffer.from(svgImage))
    .png()
    .toBuffer();
}

/**
 * Test a single layout
 */
async function testLayout(layoutName, productBuffer, avatarBuffer) {
  console.log(`\n[TEST] Testing layout: ${layoutName}`);

  try {
    // Compose images directly with buffers (no URL download needed)
    const startTime = Date.now();
    const composedBuffer = await composeImages(productBuffer, avatarBuffer, {
      layout: layoutName,
      width: 1920,
      height: 1080,
      aspectRatio: '16:9'
    });
    const duration = Date.now() - startTime;

    // Validate output
    if (!Buffer.isBuffer(composedBuffer)) {
      throw new Error('Output is not a buffer');
    }

    if (composedBuffer.length === 0) {
      throw new Error('Output buffer is empty');
    }

    // Save composed image
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
    const outputPath = path.join(TEST_OUTPUT_DIR, `test-${layoutName}.jpg`);
    await fs.writeFile(outputPath, composedBuffer);

    // Get image metadata
    const metadata = await sharp(composedBuffer).metadata();

    console.log(`  [INFO] Composition successful`);
    console.log(`  [INFO] Duration: ${duration}ms`);
    console.log(`  [INFO] Output size: ${composedBuffer.length} bytes`);
    console.log(`  [INFO] Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`  [INFO] Format: ${metadata.format}`);
    console.log(`  [INFO] Saved to: ${outputPath}`);

    return {
      success: true,
      layout: layoutName,
      duration,
      size: composedBuffer.length,
      dimensions: `${metadata.width}x${metadata.height}`,
      path: outputPath
    };

  } catch (error) {
    console.error(`  [ERROR] Layout ${layoutName} failed: ${error.message}`);
    return {
      success: false,
      layout: layoutName,
      error: error.message
    };
  }
}

/**
 * Test getRecommendedLayout helper
 */
function testLayoutRecommendations() {
  console.log(`\n[TEST] Testing layout recommendations`);

  const tests = [
    { niche: 'e-commerce fashion', expected: 'side-by-side' },
    { niche: 'consulting services', expected: 'avatar-holding' },
    { niche: 'digital education', expected: 'overlay' },
    { niche: 'fitness coaching', expected: 'avatar-holding' },
    { niche: 'retail electronics', expected: 'side-by-side' },
    { niche: 'online courses', expected: 'overlay' }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const result = getRecommendedLayout({ niche: test.niche });
    if (result === test.expected) {
      console.log(`  [PASS] ${test.niche} → ${result}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${test.niche} → Expected: ${test.expected}, Got: ${result}`);
      failed++;
    }
  });

  console.log(`\n  [INFO] Layout recommendations: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(80));
  console.log('IMAGE COMPOSITOR TEST SUITE');
  console.log('='.repeat(80));

  try {
    // Generate test images
    console.log('\n[SETUP] Generating test images...');
    const productBuffer = await generateTestProductImage();
    const avatarBuffer = await generateTestAvatarImage();
    console.log('  [INFO] Test images generated');

    // Test all layouts
    const layouts = ['side-by-side', 'avatar-holding', 'overlay'];
    const results = [];

    for (const layout of layouts) {
      const result = await testLayout(layout, productBuffer, avatarBuffer);
      results.push(result);
    }

    // Test layout recommendations
    const recommendationsResult = testLayoutRecommendations();

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\nLayout Composition Tests: ${successful}/${layouts.length} passed`);
    results.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.layout}: ${result.duration}ms, ${(result.size / 1024).toFixed(2)}KB`);
      } else {
        console.log(`  ❌ ${result.layout}: ${result.error}`);
      }
    });

    console.log(`\nLayout Recommendations Tests: ${recommendationsResult.passed}/${recommendationsResult.passed + recommendationsResult.failed} passed`);

    if (failed === 0 && recommendationsResult.failed === 0) {
      console.log(`\n✅ ALL TESTS PASSED`);
      console.log(`\nTest output directory: ${TEST_OUTPUT_DIR}`);
      console.log(`Review generated images: test-side-by-side.jpg, test-avatar-holding.jpg, test-overlay.jpg`);
      return 0;
    } else {
      console.log(`\n❌ SOME TESTS FAILED`);
      return 1;
    }

  } catch (error) {
    console.error(`\n[ERROR] Test suite failed: ${error.message}`);
    console.error(error.stack);
    return 1;
  }
}

// Run tests
runTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
