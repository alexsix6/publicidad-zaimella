# 🚀 API Documentation - Publicidad Zaimella

## Overview
Esta API proporciona endpoints para generar contenido con IA y obtener URLs públicas automáticamente.

## Base URL
```
https://publicidad-zaimella.vercel.app/api
```

## Authentication
Las API keys se configuran en variables de entorno del servidor. No se requiere autenticación en las requests.

---

## 🎨 Generate Image

Genera imágenes usando FLUX.1 Kontext Max con enhancement automático de prompts.

### Endpoint
```
POST /api/generate-image
```

### Request Body
```json
{
  "prompt": "A cat sitting on a red chair",
  "inputImage": null,
  "saveLocally": true,
  "enhanceWithAI": true,
  "enhancementModel": "anthropic/claude-3.5-sonnet"
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Descripción de la imagen a generar |
| `inputImage` | string | ❌ No | `null` | URL de imagen base para edición |
| `saveLocally` | boolean | ❌ No | `true` | Guardar imagen en servidor para URL pública |
| `enhanceWithAI` | boolean | ❌ No | `true` | Mejorar prompt con OpenRouter |
| `enhancementModel` | string | ❌ No | `claude-3.5-sonnet` | Modelo para enhancement |

### Available Enhancement Models
- `anthropic/claude-3.5-sonnet` (recomendado)
- `openai/gpt-4o`
- `openai/gpt-4`
- `openai/o1-mini`

### Response

#### Success Response (200)
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/pbxt/abc123.png",
  "publicUrl": "https://publicidad-zaimella.vercel.app/generated/image-2024-01-15-abc123.png",
  "localPath": "public/generated/image-2024-01-15-abc123.png",
  "seed": 1234567890,
  "prompts": {
    "original": "A cat sitting on a red chair",
    "final": "A majestic tabby cat gracefully sitting on an elegant red velvet armchair, soft ambient lighting, professional photography, high resolution, detailed fur texture, warm color palette",
    "enhanced": true
  },
  "enhancement": {
    "model": "anthropic/claude-3.5-sonnet",
    "success": true
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "enhancementModel": "anthropic/claude-3.5-sonnet"
  }
}
```

#### Error Response (400/500)
```json
{
  "success": false,
  "error": "Prompt is required",
  "enhancementUsed": false,
  "originalPrompt": ""
}
```

### cURL Example
```bash
curl -X POST https://publicidad-zaimella.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A modern logo for a tech company",
    "enhanceWithAI": true,
    "saveLocally": true
  }'
```

### JavaScript Example
```javascript
const response = await fetch('https://publicidad-zaimella.vercel.app/api/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over the mountains',
    enhanceWithAI: true,
    enhancementModel: 'anthropic/claude-3.5-sonnet'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Image generated:', result.publicUrl);
  console.log('Enhanced prompt:', result.prompts.final);
} else {
  console.error('Error:', result.error);
}
```

---

## 🎬 Generate Video

Genera videos usando Veo 3 con doble enhancement (IA + técnico).

### Endpoint
```
POST /api/generate-video
```

### Request Body
```json
{
  "prompt": "A cat walking in a garden",
  "imageUrl": null,
  "videoStyle": "cinematic",
  "saveLocally": true,
  "enhanceWithAI": true,
  "enhancementModel": "anthropic/claude-3.5-sonnet",
  "useUtilsEnhancement": true
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ Yes | - | Descripción del video a generar |
| `imageUrl` | string | ❌ No | `null` | URL de imagen base para video |
| `videoStyle` | string | ❌ No | `cinematic` | Estilo técnico del video |
| `saveLocally` | boolean | ❌ No | `true` | Guardar video en servidor para URL pública |
| `enhanceWithAI` | boolean | ❌ No | `true` | Mejorar prompt con OpenRouter |
| `enhancementModel` | string | ❌ No | `claude-3.5-sonnet` | Modelo para enhancement |
| `useUtilsEnhancement` | boolean | ❌ No | `true` | Aplicar enhancement técnico |

### Available Video Styles
- `cinematic` - Movimientos cinematográficos fluidos
- `dynamic` - Movimientos dinámicos y energéticos  
- `artistic` - Estilo artístico y creativo
- `action` - Movimientos rápidos y de acción
- `smooth` - Transiciones suaves y elegantes

### Response

#### Success Response (200)
```json
{
  "success": true,
  "videoUrl": "https://fal.media/files/abc123.mp4",
  "publicUrl": "https://publicidad-zaimella.vercel.app/videos/video-2024-01-15-abc123.mp4",
  "localPath": "public/videos/video-2024-01-15-abc123.mp4",
  "duration": "5 seconds",
  "imageUrl": null,
  "prompts": {
    "original": "A cat walking in a garden",
    "final": "A majestic cat gracefully walking through a lush garden, cinematic camera movement, professional lighting, smooth motion, high quality video, 5 seconds duration",
    "aiEnhanced": true,
    "utilsEnhanced": true
  },
  "enhancement": {
    "ai": {
      "model": "anthropic/claude-3.5-sonnet",
      "success": true
    },
    "technical": {
      "style": "cinematic",
      "applied": true
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "enhancementModel": "anthropic/claude-3.5-sonnet",
    "videoStyle": "cinematic"
  }
}
```

### cURL Example
```bash
curl -X POST https://publicidad-zaimella.vercel.app/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A car driving through a futuristic city",
    "videoStyle": "dynamic",
    "enhanceWithAI": true,
    "useUtilsEnhancement": true
  }'
```

### JavaScript Example
```javascript
const response = await fetch('https://publicidad-zaimella.vercel.app/api/generate-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A beautiful butterfly flying over flowers',
    imageUrl: 'https://example.com/butterfly-image.jpg',
    videoStyle: 'artistic',
    enhanceWithAI: true,
    useUtilsEnhancement: true
  })
});

const result = await response.json();

if (result.success) {
  console.log('Video generated:', result.publicUrl);
  console.log('AI Enhanced:', result.enhancement.ai.success);
  console.log('Technical Enhanced:', result.enhancement.technical.applied);
} else {
  console.error('Error:', result.error);
}
```

---

## 🚀 Generate Complete

Genera imagen y video en un solo endpoint con triple enhancement (análisis + IA + técnico).

### Endpoint
```
POST /api/generate-complete
```

### Request Body
```json
{
  "imagePrompt": "A futuristic car driving through a city",
  "videoPrompt": "The car accelerates through neon-lit streets",
  "videoStyle": "cinematic",
  "saveLocally": true,
  "inputImage": null,
  "enhanceWithAI": true,
  "enhancementModel": "anthropic/claude-3.5-sonnet",
  "analyzePrompts": true,
  "analysisType": "creative"
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `imagePrompt` | string | ✅ Yes | - | Descripción de la imagen a generar |
| `videoPrompt` | string | ❌ No | `imagePrompt` | Descripción del video (usa imagePrompt si no se especifica) |
| `videoStyle` | string | ❌ No | `cinematic` | Estilo técnico del video |
| `saveLocally` | boolean | ❌ No | `true` | Guardar archivos en servidor para URLs públicas |
| `inputImage` | string | ❌ No | `null` | URL de imagen base para edición |
| `enhanceWithAI` | boolean | ❌ No | `true` | Mejorar prompts con OpenRouter |
| `enhancementModel` | string | ❌ No | `claude-3.5-sonnet` | Modelo para enhancement |
| `analyzePrompts` | boolean | ❌ No | `false` | Análisis avanzado de prompts |
| `analysisType` | string | ❌ No | `creative` | Tipo de análisis |

### Available Analysis Types
- `creative` - Análisis para contenido viral y creativo
- `technical` - Análisis para contenido profesional y técnico
- `marketing` - Análisis para contenido promocional y engagement

### Triple Enhancement System

1️⃣ **Analysis** (opcional): Análisis inteligente del prompt original  
2️⃣ **AI Enhancement**: Mejora con Claude/GPT para imagen y video  
3️⃣ **Technical Enhancement**: Añade elementos técnicos específicos  

### Response

#### Success Response (200)
```json
{
  "success": true,
  "stage": "complete",
  "image": {
    "url": "https://replicate.delivery/pbxt/abc123.png",
    "publicUrl": "https://publicidad-zaimella.vercel.app/generated/image-2024-01-15-abc123.png",
    "localPath": "public/generated/image-2024-01-15-abc123.png",
    "seed": 1234567890,
    "prompts": {
      "original": "A futuristic car driving through a city",
      "final": "A sleek futuristic sports car driving through a neon-lit cyberpunk city at night, dramatic lighting, high-tech architecture, professional photography",
      "enhanced": true
    }
  },
  "video": {
    "url": "https://fal.media/files/def456.mp4",
    "publicUrl": "https://publicidad-zaimella.vercel.app/videos/video-2024-01-15-def456.mp4",
    "localPath": "public/videos/video-2024-01-15-def456.mp4",
    "duration": "5 seconds",
    "prompts": {
      "original": "The car accelerates through neon-lit streets",
      "final": "The sleek car accelerates powerfully through vibrant neon-lit streets, cinematic camera movement, professional lighting, smooth motion, high quality video, 5 seconds duration",
      "aiEnhanced": true,
      "technicalEnhanced": true
    }
  },
  "enhancement": {
    "image": {
      "model": "anthropic/claude-3.5-sonnet",
      "success": true
    },
    "video": {
      "model": "anthropic/claude-3.5-sonnet",
      "success": true
    }
  },
  "analysis": {
    "success": true,
    "analysis": "The prompt shows great potential for viral content...",
    "model": "openai/o1-mini",
    "analysisType": "creative"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "processingTimeMs": 90000,
    "enhancementModel": "anthropic/claude-3.5-sonnet",
    "videoStyle": "cinematic",
    "analysisUsed": true
  }
}
```

#### Partial Success (207) - Image OK, Video Failed
```json
{
  "success": false,
  "error": "Video generation failed: API timeout",
  "stage": "video",
  "imageResult": {
    "success": true,
    "imageUrl": "https://replicate.delivery/pbxt/abc123.png",
    "publicUrl": "https://publicidad-zaimella.vercel.app/generated/image-2024-01-15-abc123.png",
    "localPath": "public/generated/image-2024-01-15-abc123.png",
    "prompts": {
      "original": "A futuristic car driving through a city",
      "final": "Enhanced version..."
    }
  },
  "analysis": {
    "success": true,
    "analysis": "Analysis results..."
  }
}
```

### cURL Example
```bash
curl -X POST https://publicidad-zaimella.vercel.app/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "imagePrompt": "A dragon flying over a medieval castle",
    "videoPrompt": "The dragon lands gracefully on the castle tower",
    "videoStyle": "cinematic",
    "enhanceWithAI": true,
    "analyzePrompts": true,
    "analysisType": "creative"
  }'
```

### JavaScript Example
```javascript
const response = await fetch('https://publicidad-zaimella.vercel.app/api/generate-complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imagePrompt: 'A magical forest with glowing flowers',
    videoPrompt: 'Wind gently moves the glowing petals',
    videoStyle: 'artistic',
    enhanceWithAI: true,
    analyzePrompts: true,
    analysisType: 'creative'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Image generated:', result.image.publicUrl);
  console.log('Video generated:', result.video.publicUrl);
  console.log('Processing time:', result.metadata.processingTimeMs + 'ms');
  
  if (result.analysis) {
    console.log('Analysis provided:', result.analysis.success);
  }
} else {
  console.error('Error:', result.error);
  
  // Check if image was generated despite video failure
  if (result.imageResult) {
    console.log('Image still available:', result.imageResult.publicUrl);
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Parámetros inválidos |
| `405` | Method Not Allowed - Solo POST permitido |
| `500` | Internal Server Error - Error en APIs externas |

## Rate Limits

- **Images**: 10 requests/minute
- **Videos**: 5 requests/minute  
- **Complete**: 3 requests/minute

## Response Times

- **Images**: 30-60 segundos
- **Videos**: 2-5 minutos
- **Complete**: 3-6 minutos

## Support

Para soporte técnico, contactar a través de GitHub Issues. 