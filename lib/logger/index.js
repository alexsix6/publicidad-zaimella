// lib/logger/index.js
// Sistema de logging empresarial unificado

import { CONFIG } from '../config/index.js';

class EnterpriseLogger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.currentLevel = this.logLevels[CONFIG.logging.level] || this.logLevels.info;
    this.enableConsole = CONFIG.logging.enableConsole;
    this.enableFile = CONFIG.logging.enableFile;
  }

  // 🎯 Formatear log entry
  formatLogEntry(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    return {
      formatted: `[${timestamp}] ${level.toUpperCase()}: ${message}${Object.keys(meta).length ? ' | ' + JSON.stringify(meta) : ''}`,
      structured: logEntry
    };
  }

  // 📝 Log methods
  error(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.error) {
      const log = this.formatLogEntry('error', message, meta);
      if (this.enableConsole) console.error('[ERROR]', log.formatted);
      this.writeToFile('error', log.structured);
    }
  }

  warn(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.warn) {
      const log = this.formatLogEntry('warn', message, meta);
      if (this.enableConsole) console.warn('[WARN]', log.formatted);
      this.writeToFile('warn', log.structured);
    }
  }

  info(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.info) {
      const log = this.formatLogEntry('info', message, meta);
      if (this.enableConsole) console.log('[INFO]', log.formatted);
      this.writeToFile('info', log.structured);
    }
  }

  debug(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.debug) {
      const log = this.formatLogEntry('debug', message, meta);
      if (this.enableConsole) console.log('[DEBUG]', log.formatted);
      this.writeToFile('debug', log.structured);
    }
  }

  trace(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.trace) {
      const log = this.formatLogEntry('trace', message, meta);
      if (this.enableConsole) console.log('[TRACE]', log.formatted);
      this.writeToFile('trace', log.structured);
    }
  }

  // 🎯 Métodos especializados para la aplicación
  apiRequest(method, endpoint, params = {}) {
    this.info(`API Request: ${method} ${endpoint}`, {
      type: 'api_request',
      method,
      endpoint,
      params: Object.keys(params).length > 0 ? params : undefined
    });
  }

  apiResponse(endpoint, status, duration) {
    this.info(`API Response: ${endpoint} - ${status}`, {
      type: 'api_response',
      endpoint,
      status,
      durationMs: duration
    });
  }

  generation(type, prompt, result) {
    this.info(`Generation ${type}: ${result.success ? 'SUCCESS' : 'FAILED'}`, {
      type: 'generation',
      generationType: type,
      promptLength: prompt.length,
      success: result.success,
      error: result.error,
      processingTime: result.processingTime
    });
  }

  contextProfile(action, profileId, details = {}) {
    this.info(`Context Profile ${action}: ${profileId}`, {
      type: 'context_profile',
      action,
      profileId,
      ...details
    });
  }

  enhancement(originalPrompt, enhancedPrompt, context = {}) {
    this.info('Prompt Enhancement', {
      type: 'enhancement',
      originalLength: originalPrompt.length,
      enhancedLength: enhancedPrompt.length,
      improvementRatio: enhancedPrompt.length / originalPrompt.length,
      ...context
    });
  }

  performance(operation, duration, metadata = {}) {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      type: 'performance',
      operation,
      durationMs: duration,
      ...metadata
    });
  }

  // 💾 Write to file (placeholder - implement if needed)
  writeToFile(level, logEntry) {
    if (!this.enableFile) return;
    
    // En Vercel serverless no podemos escribir archivos
    // Este método puede implementarse para otras plataformas
    // o usar servicios externos como LogDNA, Papertrail, etc.
  }

  // 📊 Crear logger con contexto específico
  createContextLogger(context) {
    return {
      error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
      info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
      trace: (message, meta = {}) => this.trace(message, { ...context, ...meta })
    };
  }
}

// 🌟 Export singleton instance
export const logger = new EnterpriseLogger();

// 🚀 Export convenience functions
export function createApiLogger(endpoint) {
  return logger.createContextLogger({ endpoint, type: 'api' });
}

export function createGenerationLogger(type) {
  return logger.createContextLogger({ generationType: type, type: 'generation' });
}

export function createProfileLogger(profileId) {
  return logger.createContextLogger({ profileId, type: 'context_profile' });
}

// 🎯 Export shortcuts
export const {
  error,
  warn,
  info,
  debug,
  trace,
  apiRequest,
  apiResponse,
  generation,
  contextProfile,
  enhancement,
  performance
} = logger;

export default logger;