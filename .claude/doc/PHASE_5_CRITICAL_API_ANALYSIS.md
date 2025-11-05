# 🚨 Phase 5: CRITICAL API Analysis - Imágenes y Videos

**Date**: 2025-11-04
**Status**: ⚠️ CRITICAL ISSUES IDENTIFIED
**Priority**: 🔴 P0 - MUST FIX

---

## 🔍 Análisis Completo de Implementación Actual

### 📸 IMÁGENES: Estado Actual

**API Usada**: Replicate API (NO FAL)

**Modelos FLUX Disponibles**:
```javascript
// lib/replicate-client.js líneas 108-119
{
  "pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",     // ⭐ GENERACIÓN PREMIUM
  "kontext-max": "black-forest-labs/flux-kontext-max",      // 🎯 EDICIÓN PREMIUM
  "kontext-pro": "black-forest-labs/flux-kontext-pro",      // 🎯 EDICIÓN AVANZADA
  "alexseis": "alexsix6/alexsei-kontext:...",              // 🎨 CUSTOM
  "base": "black-forest-labs/flux-kontext-max"             // ✏️ DEFAULT
}
```

**❌ Problemas Identificados**:

1. **NO tiene Flux Nano Banana**
   - Usuario requiere: Flux Nano Banana (producción, alta calidad, aspect ratio)
   - Actual: FLUX 1.1 Pro Ultra / Kontext Max (modelos anteriores)
   - Estado: **DESACTUALIZADO**

2. **API incorrecta para Nano Banana**
   - Usuario requiere: FAL API para Nano Banana
   - Actual: Replicate API
   - Estado: **INCOMPATIBLE** (Nano Banana solo en FAL)

3. **Aspect Ratio limitado**
   - Replicate soporta: ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "9:21"]
   - Nano Banana soporta: Ratios personalizados flexibles
   - Estado: **LIMITADO**

---

### 🎥 VIDEOS: Estado Actual

**API Usada**: FAL API ✅ (CORRECTO)

**Modelos Disponibles**:
```javascript
// lib/veo-client.js línea 42
{
  "veo3-fast": true,     // ✅ Implementado ($0.40/seg)
  "veo3-standard": true  // ✅ Implementado ($0.75/seg)
}
```

**❌ Problemas Identificados**:

1. **Solo Veo3**
   - Usuario requiere: Veo3 + Minimax + Kling (opciones múltiples)
   - Actual: Solo Veo3 (un modelo)
   - Estado: **LIMITADO**

2. **NO hay selector de modelo**
   - Usuario requiere: Poder elegir modelo de video
   - Actual: Hardcodeado `model_version = veo3-fast/standard`
   - Estado: **NO CONFIGURABLE**

3. **Minimax y Kling NO implementados**
   - Minimax: NOT FOUND
   - Kling: NOT FOUND
   - Estado: **FALTANTE**

---

### 🖼️ COMPOSICIÓN DE VIDEO: Estado Actual

**Problema CRÍTICO 🔴**: **Composición de imágenes NO implementada**

**Código Actual**:
```javascript
// mcp/tools/content-orchestrator.js:424-452
async generateVideoContent(productImage, avatarImage, nicheContext) {
  const sceneConfig = {
    mode: 'presentation',
    productImage: productImage.publicUrl,  // ✅ Pasa URL
    avatarImage: avatarImage.publicUrl,    // ✅ Pasa URL
    niche: nicheContext.niche
  };

  const videoScene = await this.sceneComposer.composeScene(sceneConfig);

  const videoOptions = {
    imageUrl: productImage.replicateUrl || productImage.publicUrl,  // ❌ SOLO PRODUCTO
    videoStyle: 'cinematic',
    aspectRatio: '16:9',
    duration: '8s'
  };

  return await this.apiBridge.generateVideo(videoScene.prompt, videoOptions);
}
```

**Problema**:
- Línea 431: `avatarImage` pasa a sceneConfig
- Línea 439: `imageUrl` solo usa `productImage` ❌
- **Avatar NO se usa en video composition**
- Solo se menciona avatar en el PROMPT de texto, NO en la imagen base

**Estado**: **NO FUNCIONA** - Video solo muestra producto, NO producto + avatar

---

## 🎯 Recomendaciones Técnicas - Soluciones

### 1. 🔧 IMÁGENES: Migrar a Flux Nano Banana via FAL API

**Recomendación**: **Agregar FAL API para imágenes + Mantener Replicate como fallback**

**Razones**:
1. ✅ Flux Nano Banana solo disponible en FAL API
2. ✅ Alta calidad confirmada por usuario
3. ✅ Aspect ratio flexible
4. ✅ Create + Edit capabilities
5. ✅ Producción ready

**Implementación**:

```javascript
// NEW: lib/fal-image-client.js
import { fal } from "@fal-ai/client";

export async function generateImageWithNanoBanana(
  prompt,
  aspectRatio = "1:1",
  inputImage = null,
  contextProfileId = null
) {
  // Configure FAL
  fal.config({
    credentials: process.env.FAL_KEY
  });

  // Detect Digital Twin mode for quality settings
  const isDigitalTwin = contextProfileId ?
    await detectDigitalTwinMode(contextProfileId) : false;

  const requestBody = {
    prompt: prompt,
    image_size: {
      width: calculateWidth(aspectRatio, isDigitalTwin),
      height: calculateHeight(aspectRatio, isDigitalTwin)
    },
    num_inference_steps: isDigitalTwin ? 50 : 30,  // 🎯 Digital Twin = ultra quality
    guidance_scale: isDigitalTwin ? 9.0 : 7.5,
    num_images: 1,
    enable_safety_checker: true,
    output_format: "png"
  };

  // If editing mode (inputImage provided)
  if (inputImage) {
    requestBody.image_url = inputImage;
    requestBody.strength = 0.8;  // How much to transform (0-1)
  }

  try {
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: requestBody,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`⏳ Nano Banana generating... ${update.logs}`);
        }
      }
    });

    return {
      success: true,
      imageUrl: result.images[0].url,
      width: result.images[0].width,
      height: result.images[0].height,
      model: "flux-nano-banana",
      seed: result.seed,
      isDigitalTwin: isDigitalTwin
    };

  } catch (error) {
    console.error('❌ Nano Banana generation failed:', error);
    throw error;
  }
}

function calculateWidth(aspectRatio, isDigitalTwin) {
  const baseWidth = isDigitalTwin ? 1536 : 1024;  // Higher res for Digital Twin

  const ratios = {
    "1:1": baseWidth,
    "16:9": baseWidth,
    "9:16": baseWidth * (9/16),
    "4:5": baseWidth * (4/5),
    "21:9": baseWidth
  };

  return ratios[aspectRatio] || baseWidth;
}

function calculateHeight(aspectRatio, isDigitalTwin) {
  const baseHeight = isDigitalTwin ? 1536 : 1024;

  const ratios = {
    "1:1": baseHeight,
    "16:9": baseHeight * (9/16),
    "9:16": baseHeight,
    "4:5": baseHeight,
    "21:9": baseHeight * (9/21)
  };

  return ratios[aspectRatio] || baseHeight;
}
```

**Integración en API**:

```javascript
// api/generate-image.js
import { generateImageWithNanoBanana } from '../lib/fal-image-client.js';
import { generateImageWithFlux } from '../lib/replicate-client.js';  // Fallback

export default async function handler(req, res) {
  const {
    prompt,
    model = 'nano-banana',  // 🆕 DEFAULT: Nano Banana
    aspectRatio = '1:1',
    inputImage = null,
    contextProfileId = null
  } = req.body;

  try {
    // PRIMARY: Try Nano Banana via FAL
    if (model === 'nano-banana' || model === 'flux-nano' || model === 'default') {
      const result = await generateImageWithNanoBanana(
        prompt,
        aspectRatio,
        inputImage,
        contextProfileId
      );
      return res.status(200).json(result);
    }

    // FALLBACK: Use Replicate for other models
    const result = await generateImageWithFlux(
      prompt,
      inputImage,
      model,
      aspectRatio,
      'png',
      contextProfileId
    );

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Image generation failed:', error);

    // Try fallback to Replicate if FAL fails
    if (model === 'nano-banana') {
      console.log('⚠️ Falling back to Replicate FLUX Pro Ultra...');
      const fallbackResult = await generateImageWithFlux(
        prompt,
        inputImage,
        'pro-ultra',
        aspectRatio,
        'png',
        contextProfileId
      );
      return res.status(200).json(fallbackResult);
    }

    throw error;
  }
}
```

**Ventajas**:
- ✅ Nano Banana como default (alta calidad)
- ✅ Replicate como fallback (resiliencia)
- ✅ Digital Twin auto-ajusta parámetros
- ✅ Aspect ratios flexibles
- ✅ Create + Edit modes

---

### 2. 🎬 VIDEOS: Agregar Minimax y Kling

**Recomendación**: **Sistema de selección de modelo configurable**

**Implementación**:

```javascript
// NEW: lib/video-models.js
import { fal } from "@fal-ai/client";

export class VideoModelManager {
  constructor() {
    this.models = {
      'veo3-fast': {
        endpoint: 'fal-ai/veo3',
        costPerSecond: 0.40,
        maxDuration: 10,
        features: ['audio', 'image-to-video', 'text-to-video']
      },
      'veo3-standard': {
        endpoint: 'fal-ai/veo3',
        costPerSecond: 0.75,
        maxDuration: 10,
        features: ['audio', 'image-to-video', 'text-to-video', 'high-quality']
      },
      'minimax': {
        endpoint: 'fal-ai/minimax-video',
        costPerSecond: 0.35,
        maxDuration: 6,
        features: ['fast', 'image-to-video', 'text-to-video']
      },
      'kling': {
        endpoint: 'fal-ai/kling-video',
        costPerSecond: 0.50,
        maxDuration: 10,
        features: ['cinematic', 'image-to-video', 'text-to-video', 'high-motion']
      }
    };
  }

  async generateVideo(
    prompt,
    model = 'veo3-fast',
    imageUrl = null,
    aspectRatio = '16:9',
    duration = 8,
    contextProfileId = null
  ) {
    const modelConfig = this.models[model];
    if (!modelConfig) {
      throw new Error(`Unknown video model: ${model}`);
    }

    // Digital Twin detection for quality boost
    const isDigitalTwin = contextProfileId ?
      await detectDigitalTwinMode(contextProfileId) : false;

    // Build request based on model
    const requestBody = {
      prompt: prompt,
      duration: Math.min(duration, modelConfig.maxDuration)
    };

    // Add image if provided
    if (imageUrl && modelConfig.features.includes('image-to-video')) {
      requestBody.image_url = imageUrl;
    }

    // Add aspect ratio
    if (aspectRatio !== '16:9') {
      requestBody.aspect_ratio = aspectRatio;
    }

    // Model-specific optimizations
    if (model.startsWith('veo3')) {
      requestBody.generate_audio = true;
      requestBody.model_version = model;
    }

    if (model === 'kling' && isDigitalTwin) {
      requestBody.motion_level = 'high';  // More cinematic
      requestBody.quality = 'ultra';
    }

    if (model === 'minimax') {
      requestBody.speed_mode = 'fast';
    }

    try {
      const result = await fal.subscribe(modelConfig.endpoint, {
        input: requestBody,
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`⏳ ${model} generating... ${update.status}`);
        }
      });

      return {
        success: true,
        videoUrl: result.video.url,
        model: model,
        duration: duration,
        aspectRatio: aspectRatio,
        estimatedCost: duration * modelConfig.costPerSecond,
        isDigitalTwin: isDigitalTwin
      };

    } catch (error) {
      console.error(`❌ ${model} generation failed:`, error);
      throw error;
    }
  }

  getAvailableModels() {
    return Object.keys(this.models).map(key => ({
      id: key,
      ...this.models[key]
    }));
  }

  recommendModel(requirements) {
    // Smart recommendations based on requirements
    if (requirements.budget === 'low') return 'minimax';
    if (requirements.quality === 'ultra') return 'veo3-standard';
    if (requirements.speed === 'fast') return 'minimax';
    if (requirements.cinematic === true) return 'kling';

    return 'veo3-fast';  // Default balanced option
  }
}
```

**Integración en MCP**:

```javascript
// mcp/adapters/api-bridge.js
import { VideoModelManager } from '../lib/video-models.js';

export class ApiBridge {
  constructor() {
    this.videoManager = new VideoModelManager();
  }

  async generateVideo(prompt, options = {}) {
    const {
      imageUrl = null,
      videoModel = 'veo3-fast',  // 🆕 Configurable
      aspectRatio = '16:9',
      duration = '8s',
      contextProfileId = null
    } = options;

    const durationSeconds = parseInt(duration);

    return await this.videoManager.generateVideo(
      prompt,
      videoModel,
      imageUrl,
      aspectRatio,
      durationSeconds,
      contextProfileId
    );
  }

  getAvailableVideoModels() {
    return this.videoManager.getAvailableModels();
  }
}
```

**Ventajas**:
- ✅ 4 modelos de video (Veo3 fast/standard, Minimax, Kling)
- ✅ Selector configurable por usuario
- ✅ Optimizaciones por modelo
- ✅ Digital Twin boost automático
- ✅ Recommendations inteligentes

---

### 3. 🖼️➕🖼️ COMPOSICIÓN: Implementar Image Composition

**Recomendación**: **Composición de imágenes ANTES de generar video**

**Problema Actual**:
```javascript
// ❌ ACTUAL: Solo pasa producto
videoOptions.imageUrl = productImage.publicUrl;  // Avatar ignorado
```

**Solución**:

```javascript
// NEW: lib/image-compositor.js
import sharp from 'sharp';
import fetch from 'node-fetch';

export class ImageCompositor {
  async composeProductAvatar(productImageUrl, avatarImageUrl, layout = 'side-by-side') {
    try {
      // Download images
      const productBuffer = await this.downloadImage(productImageUrl);
      const avatarBuffer = await this.downloadImage(avatarImageUrl);

      // Load with sharp
      const productImg = sharp(productBuffer);
      const avatarImg = sharp(avatarBuffer);

      // Get metadata
      const productMeta = await productImg.metadata();
      const avatarMeta = await avatarImg.metadata();

      // Composite based on layout
      let compositeBuffer;

      if (layout === 'side-by-side') {
        compositeBuffer = await this.composeSideBySide(
          productBuffer, productMeta,
          avatarBuffer, avatarMeta
        );
      } else if (layout === 'avatar-holding-product') {
        compositeBuffer = await this.composeAvatarHolding(
          avatarBuffer, avatarMeta,
          productBuffer, productMeta
        );
      } else if (layout === 'product-with-avatar-overlay') {
        compositeBuffer = await this.composeOverlay(
          productBuffer, productMeta,
          avatarBuffer, avatarMeta
        );
      }

      // Upload composite to temporary storage
      const compositeUrl = await this.uploadComposite(compositeBuffer);

      return {
        success: true,
        compositeUrl: compositeUrl,
        layout: layout,
        width: 1920,
        height: 1080
      };

    } catch (error) {
      console.error('❌ Image composition failed:', error);
      throw error;
    }
  }

  async composeSideBySide(productBuffer, productMeta, avatarBuffer, avatarMeta) {
    // Target: 1920x1080 (16:9)
    const targetWidth = 1920;
    const targetHeight = 1080;
    const halfWidth = targetWidth / 2;

    // Resize both images to fit half-width
    const resizedProduct = await sharp(productBuffer)
      .resize(halfWidth, targetHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .toBuffer();

    const resizedAvatar = await sharp(avatarBuffer)
      .resize(halfWidth, targetHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .toBuffer();

    // Composite side by side
    return sharp({
      create: {
        width: targetWidth,
        height: targetHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      { input: resizedProduct, left: 0, top: 0 },
      { input: resizedAvatar, left: halfWidth, top: 0 }
    ])
    .png()
    .toBuffer();
  }

  async composeAvatarHolding(avatarBuffer, avatarMeta, productBuffer, productMeta) {
    // Avatar as background, product overlaid at hands position
    const targetWidth = 1920;
    const targetHeight = 1080;

    // Resize avatar to full canvas
    const resizedAvatar = await sharp(avatarBuffer)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .toBuffer();

    // Product smaller (30% of width), positioned at hands
    const productWidth = Math.floor(targetWidth * 0.3);
    const resizedProduct = await sharp(productBuffer)
      .resize(productWidth, null, { fit: 'contain' })
      .toBuffer();

    // Position product at bottom-right (hands area)
    const productLeft = Math.floor(targetWidth * 0.6);
    const productTop = Math.floor(targetHeight * 0.5);

    return sharp(resizedAvatar)
      .composite([
        { input: resizedProduct, left: productLeft, top: productTop }
      ])
      .png()
      .toBuffer();
  }

  async composeOverlay(productBuffer, productMeta, avatarBuffer, avatarMeta) {
    // Product as background, avatar as circular overlay
    const targetWidth = 1920;
    const targetHeight = 1080;

    // Product full canvas
    const resizedProduct = await sharp(productBuffer)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .toBuffer();

    // Avatar circular (20% of width)
    const avatarSize = Math.floor(targetWidth * 0.2);
    const circularAvatar = await sharp(avatarBuffer)
      .resize(avatarSize, avatarSize, { fit: 'cover' })
      .composite([
        {
          input: Buffer.from(`<svg><circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2}"/></svg>`),
          blend: 'dest-in'
        }
      ])
      .toBuffer();

    // Position avatar at top-left corner
    return sharp(resizedProduct)
      .composite([
        { input: circularAvatar, left: 50, top: 50 }
      ])
      .png()
      .toBuffer();
  }

  async downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    return await response.buffer();
  }

  async uploadComposite(buffer) {
    // Upload to temporary storage (usar Vercel Blob o similar)
    // Por ahora, retornar data URL
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  }
}
```

**Integración en Content Orchestrator**:

```javascript
// mcp/tools/content-orchestrator.js
import { ImageCompositor } from '../lib/image-compositor.js';

export class ContentOrchestrator {
  constructor() {
    this.imageCompositor = new ImageCompositor();
  }

  async generateVideoContent(productImage, avatarImage, nicheContext) {
    console.log('🎬 Generating video content...');

    // 🆕 STEP 1: Compose product + avatar into single image
    let baseImageUrl = productImage.publicUrl;  // Default: product only

    if (avatarImage && avatarImage.publicUrl) {
      console.log('🖼️ Composing product + avatar for video...');

      try {
        const composition = await this.imageCompositor.composeProductAvatar(
          productImage.publicUrl,
          avatarImage.publicUrl,
          'side-by-side'  // or 'avatar-holding-product' or 'product-with-avatar-overlay'
        );

        baseImageUrl = composition.compositeUrl;
        console.log('✅ Composite image created for video base');

      } catch (error) {
        console.error('⚠️ Image composition failed, using product only:', error);
        // Fallback: use product only
      }
    }

    // STEP 2: Generate video scene prompt
    const sceneConfig = {
      mode: 'presentation',
      productImage: productImage.publicUrl,
      avatarImage: avatarImage.publicUrl,
      niche: nicheContext.niche,
      style: nicheContext.visualStyle
    };

    const videoScene = await this.sceneComposer.composeScene(sceneConfig);

    // STEP 3: Generate video with composite image
    const videoOptions = {
      imageUrl: baseImageUrl,  // ✅ NOW: Composite (product + avatar)
      videoModel: 'veo3-fast',  // 🆕 Configurable
      videoStyle: 'cinematic',
      aspectRatio: '16:9',
      duration: '8s',
      enhanceWithAI: true
    };

    const result = await this.apiBridge.generateVideo(videoScene.prompt, videoOptions);

    return {
      scene: videoScene,
      compositeUsed: avatarImage ? true : false,
      ...result
    };
  }
}
```

**Ventajas**:
- ✅ Producto + Avatar visualmente combinados
- ✅ 3 layouts de composición
- ✅ Fallback a producto solo si falla
- ✅ Video muestra AMBAS imágenes
- ✅ Sharp.js (rápido y eficiente)

---

## 📊 Resumen de Cambios Necesarios

| Componente | Estado Actual | Cambio Requerido | Prioridad |
|------------|---------------|------------------|-----------|
| **Imágenes - Modelo** | FLUX 1.1 Pro via Replicate | ✅ Flux Nano Banana via FAL | 🔴 P0 |
| **Imágenes - API** | Replicate API | ✅ FAL API + Replicate fallback | 🔴 P0 |
| **Videos - Modelos** | Solo Veo3 (2 variantes) | ✅ Veo3 + Minimax + Kling (4 total) | 🟡 P1 |
| **Videos - Selector** | Hardcoded | ✅ Configurable por usuario | 🟡 P1 |
| **Composición** | NO implementada | ✅ Sharp.js composition | 🔴 P0 |

---

## 🎯 Plan de Implementación Recomendado

### Fase 1: CRÍTICO (2-3 horas) 🔴

**Orden de implementación**:

1. **Image Composition** (1h)
   - Instalar Sharp.js
   - Implementar ImageCompositor
   - Integrar en ContentOrchestrator
   - Test: producto + avatar → video

2. **Flux Nano Banana** (1h)
   - Implementar fal-image-client.js
   - Integrar en generate-image.js API
   - Test con aspect ratios
   - Test Digital Twin quality boost

3. **Video Model Selector** (30min)
   - Implementar VideoModelManager
   - Integrar Minimax
   - Integrar Kling
   - Test selector configurable

### Fase 2: VALIDACIÓN (30min) 🟢

1. Test end-to-end: brief → composite image → video
2. Test Digital Twin mode quality boost
3. Test aspect ratios (1:1, 16:9, 9:16)
4. Test fallbacks (FAL fail → Replicate)

---

## ✅ Criterios de Éxito

| Criterio | Métrica | Status |
|----------|---------|--------|
| **Nano Banana activo** | Default image model = nano-banana | ⏳ PENDING |
| **FAL API funcional** | Images via FAL, fallback Replicate | ⏳ PENDING |
| **Composición funcional** | Videos muestran producto + avatar | ⏳ PENDING |
| **4 modelos video** | Veo3, Minimax, Kling disponibles | ⏳ PENDING |
| **Digital Twin boost** | Quality increase detectable | ⏳ PENDING |
| **Aspect ratios flexibles** | 1:1, 16:9, 9:16, custom | ⏳ PENDING |

---

## 🚨 Decisión Usuario

**Usuario afirma**: "Esto me parece super importante que lo solventemos y no dejar así, analizalo bien"

**Mi recomendación**: ✅ **PROCEDER CON FASE 1 COMPLETA**

**Razones**:
1. Composición de video es CORE de la solución (producto + avatar)
2. Nano Banana es producción-ready y superior a FLUX 1.1
3. Múltiples modelos de video = flexibilidad cliente
4. Tiempo: 2-3 horas (manejable)
5. Impacto: Transforma calidad de output final

---

**Created**: 2025-11-04
**Author**: Phase 5 - Critical API Analysis
**Status**: ⚠️ AWAITING USER APPROVAL TO PROCEED
