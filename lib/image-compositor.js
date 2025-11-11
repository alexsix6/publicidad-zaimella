/**
 * Image Compositor - Combines product + avatar images for video generation
 *
 * Supports 3 professional layouts:
 * 1. side-by-side: Product left, avatar right (default)
 * 2. avatar-holding: Avatar presenting product (centered composition)
 * 3. overlay: Product foreground, avatar background
 *
 * @module image-compositor
 */

import sharp from 'sharp';
import axios from 'axios';
import { Readable } from 'stream';

/**
 * Normalize URL - adds http:// protocol if missing
 */
function normalizeUrl(url) {
  // If URL starts with localhost: without protocol, add http://
  if (url.startsWith('localhost:')) {
    return `http://${url}`;
  }
  // If URL is missing protocol entirely (no http:// or https://)
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
    // Check if it looks like a localhost URL
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return `http://${url}`;
    }
  }
  return url;
}

/**
 * Download image from URL as buffer
 */
async function downloadImage(url) {
  try {
    // Normalize URL to ensure protocol is present
    const normalizedUrl = normalizeUrl(url);

    const response = await axios({
      url: normalizedUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'StrategicContentOrchestrator/2.0'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to download image from ${url}: ${error.message}`);
  }
}

/**
 * Compose images using side-by-side layout
 * Product left (60% width), Avatar right (40% width)
 */
async function composeSideBySide(productBuffer, avatarBuffer, options = {}) {
  const {
    width = 1920,
    height = 1080,
    backgroundColor = { r: 255, g: 255, b: 255 }
  } = options;

  // Product takes 60% width, Avatar takes 40%
  const productWidth = Math.floor(width * 0.6);
  const avatarWidth = Math.floor(width * 0.4);

  // Resize images maintaining aspect ratio
  const productResized = await sharp(productBuffer)
    .resize(productWidth, height, {
      fit: 'contain',
      background: backgroundColor
    })
    .toBuffer();

  const avatarResized = await sharp(avatarBuffer)
    .resize(avatarWidth, height, {
      fit: 'contain',
      background: backgroundColor
    })
    .toBuffer();

  // Composite side by side
  const composite = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: backgroundColor
    }
  })
    .composite([
      { input: productResized, left: 0, top: 0 },
      { input: avatarResized, left: productWidth, top: 0 }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  return composite;
}

/**
 * Compose images using avatar-holding layout
 * Avatar centered, product positioned as if being held/presented
 */
async function composeAvatarHolding(productBuffer, avatarBuffer, options = {}) {
  const {
    width = 1920,
    height = 1080,
    backgroundColor = { r: 255, g: 255, b: 255 }
  } = options;

  // Avatar takes center stage (70% width)
  const avatarWidth = Math.floor(width * 0.7);
  const avatarResized = await sharp(avatarBuffer)
    .resize(avatarWidth, height, {
      fit: 'contain',
      background: backgroundColor
    })
    .toBuffer();

  // Product smaller (30% width), positioned in front
  const productWidth = Math.floor(width * 0.3);
  const productHeight = Math.floor(height * 0.4);
  const productResized = await sharp(productBuffer)
    .resize(productWidth, productHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png() // Use PNG for transparency
    .toBuffer();

  // Position product in lower-center area (as if being held)
  const productLeft = Math.floor((width - productWidth) / 2);
  const productTop = Math.floor(height * 0.55);

  // Composite
  const composite = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: backgroundColor
    }
  })
    .composite([
      { input: avatarResized, left: Math.floor((width - avatarWidth) / 2), top: 0 },
      { input: productResized, left: productLeft, top: productTop }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  return composite;
}

/**
 * Compose images using overlay layout
 * Product foreground (large), Avatar background (blurred, subtle)
 */
async function composeOverlay(productBuffer, avatarBuffer, options = {}) {
  const {
    width = 1920,
    height = 1080,
    backgroundColor = { r: 255, g: 255, b: 255 }
  } = options;

  // Avatar background (full size, blurred, low opacity)
  const avatarBackground = await sharp(avatarBuffer)
    .resize(width, height, {
      fit: 'cover'
    })
    .blur(10) // Blur background
    .modulate({ brightness: 0.7 }) // Darken slightly
    .toBuffer();

  // Product foreground (70% width, centered)
  const productWidth = Math.floor(width * 0.7);
  const productHeight = Math.floor(height * 0.7);
  const productResized = await sharp(productBuffer)
    .resize(productWidth, productHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png() // Use PNG for transparency
    .toBuffer();

  // Center product
  const productLeft = Math.floor((width - productWidth) / 2);
  const productTop = Math.floor((height - productHeight) / 2);

  // Composite
  const composite = await sharp(avatarBackground)
    .composite([
      { input: productResized, left: productLeft, top: productTop }
    ])
    .jpeg({ quality: 95 })
    .toBuffer();

  return composite;
}

/**
 * Main composition function - routes to specific layout
 *
 * @param {string|Buffer} productImageUrl - URL or Buffer of product image
 * @param {string|Buffer} avatarImageUrl - URL or Buffer of avatar image
 * @param {Object} options - Composition options
 * @param {string} options.layout - Layout type: 'side-by-side', 'avatar-holding', 'overlay'
 * @param {number} options.width - Output width (default: 1920)
 * @param {number} options.height - Output height (default: 1080)
 * @param {Object} options.aspectRatio - Target aspect ratio (e.g., '16:9', '9:16', '1:1')
 * @returns {Promise<Buffer>} - Composed image buffer
 */
export async function composeImages(productImageUrl, avatarImageUrl, options = {}) {
  try {
    console.log(`\n[INFO] Image Compositor: Starting composition...`);
    console.log(`   Product: ${Buffer.isBuffer(productImageUrl) ? 'Buffer' : productImageUrl}`);
    console.log(`   Avatar: ${Buffer.isBuffer(avatarImageUrl) ? 'Buffer' : avatarImageUrl}`);
    console.log(`   Layout: ${options.layout || 'side-by-side'}`);

    // Download or use images (support both URLs and Buffers)
    console.log(`   [INFO] Loading images...`);
    const [productBuffer, avatarBuffer] = await Promise.all([
      Buffer.isBuffer(productImageUrl) ? productImageUrl : downloadImage(productImageUrl),
      Buffer.isBuffer(avatarImageUrl) ? avatarImageUrl : downloadImage(avatarImageUrl)
    ]);
    console.log(`   [INFO] Images loaded`);

    // Parse aspect ratio to dimensions
    let width = options.width || 1920;
    let height = options.height || 1080;

    if (options.aspectRatio) {
      const dimensionsMap = {
        '16:9': { width: 1920, height: 1080 },
        '9:16': { width: 1080, height: 1920 },
        '1:1': { width: 1080, height: 1080 },
        '4:5': { width: 1080, height: 1350 },
        '4:3': { width: 1920, height: 1440 }
      };

      if (dimensionsMap[options.aspectRatio]) {
        ({ width, height } = dimensionsMap[options.aspectRatio]);
        console.log(`   [INFO] Aspect ratio ${options.aspectRatio}: ${width}x${height}`);
      }
    }

    // Select composition layout
    const layout = options.layout || 'side-by-side';
    let composedBuffer;

    console.log(`   [INFO] Composing with '${layout}' layout...`);

    switch (layout) {
      case 'avatar-holding':
        composedBuffer = await composeAvatarHolding(productBuffer, avatarBuffer, {
          width,
          height,
          backgroundColor: options.backgroundColor
        });
        break;

      case 'overlay':
        composedBuffer = await composeOverlay(productBuffer, avatarBuffer, {
          width,
          height,
          backgroundColor: options.backgroundColor
        });
        break;

      case 'side-by-side':
      default:
        composedBuffer = await composeSideBySide(productBuffer, avatarBuffer, {
          width,
          height,
          backgroundColor: options.backgroundColor
        });
        break;
    }

    console.log(`   [INFO] Composition complete: ${composedBuffer.length} bytes`);

    return composedBuffer;

  } catch (error) {
    console.error(`\n[ERROR] Image Compositor Error: ${error.message}`);
    throw new Error(`Image composition failed: ${error.message}`);
  }
}

/**
 * Helper: Get layout recommendations based on niche/context
 */
export function getRecommendedLayout(nicheContext) {
  // E-commerce products: side-by-side shows product clearly
  if (nicheContext?.niche?.includes('e-commerce') || nicheContext?.niche?.includes('retail')) {
    return 'side-by-side';
  }

  // Services, consulting: avatar-holding for personal touch
  if (nicheContext?.niche?.includes('consulting') || nicheContext?.niche?.includes('coaching')) {
    return 'avatar-holding';
  }

  // Digital products, courses: overlay for modern look
  if (nicheContext?.niche?.includes('digital') || nicheContext?.niche?.includes('education') || nicheContext?.niche?.includes('courses')) {
    return 'overlay';
  }

  // Default: side-by-side (safest, most versatile)
  return 'side-by-side';
}

export default {
  composeImages,
  getRecommendedLayout
};
