// lib/config/index.js
// Sistema de configuración centralizada empresarial

import { readFileSync } from 'fs';
import { join } from 'path';

// 🔧 Cargar variables de entorno manualmente (sin dotenv)
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envData = readFileSync(envPath, 'utf8');
    
    let loadedCount = 0;
    envData.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
          loadedCount++;
          console.log(`🔑 Loaded: ${key.trim()}`);
        }
      }
    });
    
    console.log(`✅ Environment variables loaded: ${loadedCount} variables from .env.local`);
  } catch (error) {
    console.warn('⚠️ Could not load .env.local:', error.message);
    console.warn('⚠️ Using process.env only');
  }
}

// Cargar variables de entorno al importar
loadEnvFile();

// 🏢 CONFIGURACIÓN EMPRESARIAL
export const CONFIG = {
  // 🔑 APIs y Credenciales
  apis: {
    replicate: {
      token: process.env.REPLICATE_API_TOKEN,
      baseUrl: 'https://api.replicate.com/v1',
      timeout: 300000, // 5 minutos
      retries: 3
    },
    fal: {
      key: process.env.FAL_KEY,
      baseUrl: 'https://fal.run/fal-ai',
      timeout: 300000,
      retries: 3
    },
    openrouter: {
      key: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      timeout: 60000, // 1 minuto
      retries: 2
    }
  },

  // 🎯 Context Profiles
  profiles: {
    defaultProfile: process.env.DEFAULT_CONTEXT_PROFILE || null,
    autoSelectProfile: process.env.AUTO_SELECT_PROFILE === 'true',
    profilesDir: './data/context-profiles',
    cacheProfiles: true,
    maxProfiles: 100
  },

  // 🎨 Generación
  generation: {
    image: {
      defaultModel: 'pro-ultra',
      defaultAspectRatio: '16:9',
      defaultFormat: 'png',
      maxRetries: 3,
      timeout: 180000 // 3 minutos
    },
    video: {
      defaultDuration: '8s',
      defaultAspectRatio: '16:9',
      maxRetries: 2,
      timeout: 300000 // 5 minutos
    },
    enhancement: {
      defaultModel: 'deepseek/deepseek-r1',
      fallbackModel: 'anthropic/claude-3-haiku',
      alwaysEnhance: process.env.ALWAYS_ENHANCE === 'true',
      maxPromptLength: 2000
    }
  },

  // 💾 Almacenamiento
  storage: {
    saveLocally: process.env.SAVE_LOCALLY !== 'false',
    publicDir: './public',
    generatedDir: './public/generated',
    videosDir: './public/videos',
    maxFileSize: '50MB',
    cleanupEnabled: process.env.CLEANUP_OLD_FILES === 'true',
    cleanupMaxAge: parseInt(process.env.CLEANUP_MAX_AGE_HOURS) || 24
  },

  // 🔒 Seguridad
  security: {
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED === 'true',
      maxRequests: parseInt(process.env.MAX_REQUESTS_PER_HOUR) || 100,
      windowMs: 3600000 // 1 hora
    },
    cors: {
      enabled: true,
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    },
    apiKeys: {
      required: process.env.API_KEYS_REQUIRED === 'true',
      masterKey: process.env.MASTER_API_KEY
    }
  },

  // 📊 Logging y Monitoreo
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: process.env.LOG_TO_FILE === 'true',
    logFile: './logs/app.log',
    maxLogSize: '10MB',
    maxLogFiles: 5
  },

  // 🌍 Entorno
  environment: {
    nodeEnv: process.env.NODE_ENV || 'development',
    vercelUrl: process.env.VERCEL_URL,
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development'
  },

  // 📈 Analytics
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    trackUsage: true,
    trackPerformance: true,
    trackErrors: true
  }
};

// 🔍 Validación de configuración
export function validateConfig() {
  const errors = [];

  // Validar APIs críticas
  if (!CONFIG.apis.replicate.token) {
    errors.push('REPLICATE_API_TOKEN is required');
  }
  if (!CONFIG.apis.fal.key) {
    errors.push('FAL_KEY is required');
  }
  if (!CONFIG.apis.openrouter.key) {
    errors.push('OPENROUTER_API_KEY is required');
  }

  // Validar directorios
  if (!CONFIG.storage.publicDir) {
    errors.push('Public directory path is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }

  return true;
}

// 🏗️ Inicialización de configuración
export async function initializeConfig() {
  try {
    validateConfig();
    console.log('✅ Configuration validated successfully');
    return CONFIG;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    throw error;
  }
}

// 🎯 Helper: Obtener configuración por módulo
export function getApiConfig(provider) {
  return CONFIG.apis[provider];
}

export function getGenerationConfig(type = 'image') {
  return CONFIG.generation[type];
}

export function getProfilesConfig() {
  return CONFIG.profiles;
}

export function getStorageConfig() {
  return CONFIG.storage;
}

// 🚀 Export para uso rápido
export default CONFIG;