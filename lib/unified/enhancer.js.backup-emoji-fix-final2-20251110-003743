// lib/unified/enhancer.js
// Sistema unificado de enhancement: Context Profiles + AI Enhancement + Sanitizer
// 🎯 VERSIÓN FINAL: Digital Twin detection + No predeterminación de modelo + Límites adaptativos

import { enhancePromptWithContext } from '../context-enhancer.js';
import { enhancePrompt } from '../openrouter-client.js';
import { contextProfileManager } from '../context-profile-manager.js';
import { sanitizePrompt } from '../prompt-sanitizer.js';
import { CONFIG } from '../config/index.js';

/**
 * 🚀 Enhancement unificado de prompts
 * Combina Context Profiles + Sanitizer + AI Enhancement de forma inteligente
 */
export class UnifiedEnhancer {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await contextProfileManager.initialize();
      this.initialized = true;
      console.log('✅ UnifiedEnhancer initialized');
    }
  }

  /**
   * 🆕 NEW: Detect if profile is Digital Twin and adjust parameters
   */
  async detectDigitalTwinMode(profileId) {
    if (!profileId) return false;
    
    try {
      const profile = await contextProfileManager.loadProfile(profileId);
      if (!profile) return false;

      const context = profile.context;
      let score = 0;
      let totalChecks = 4;

      // Check 1: Has detailed product specifications
      if (context.product_specifications?.pack_dimensions_mm) score++;

      // Check 2: Has exact Pantone color specifications
      if (context.brand_guidelines?.color_spec) score++;

      // Check 3: Has validation rules with must_include
      if (context.validation_rules?.must_include?.length > 0) score++;

      // Check 4: Has specific copy/text requirements
      if (context.product_specifications?.front_panel) score++;

      const digitalTwinScore = score / totalChecks;
      const isDigitalTwin = digitalTwinScore >= 0.75; // 75% threshold

      console.log(`🔍 Profile ${profileId}: Digital Twin = ${isDigitalTwin} (score: ${score}/${totalChecks})`);
      
      return isDigitalTwin;
    } catch (error) {
      console.error('❌ Error detecting digital twin mode:', error);
      return false;
    }
  }

  /**
   * 🎯 Enhancement principal - Auto-selección de perfil + Sanitizer + AI enhancement
   */
  async enhancePrompt(prompt, options = {}) {
    await this.initialize();

    const {
      type = 'image', // 'image' | 'video'
      contextProfileId = null,
      useAI = true,
      aiModel = CONFIG.generation.enhancement.defaultModel,
      autoSelectProfile = CONFIG.profiles.autoSelectProfile,
      includeAnalysis = false,
      useSanitizer = true
    } = options;

    console.log(`🧠 [UnifiedEnhancer] Starting enhancement for ${type}`);
    console.log('🔍 [DEBUG] UnifiedEnhancer received:');
    console.log('   Input prompt:', JSON.stringify(prompt));
    console.log('   Input length:', prompt.length);
    console.log('   Will apply context profile:', contextProfileId || 'auto-select');
    console.log(`   Original: "${prompt}"`);
    console.log(`   Profile: ${contextProfileId || 'auto-select'}`);
    console.log(`   AI Enhancement: ${useAI}`);
    console.log(`   Sanitizer: ${useSanitizer}`);

    const result = {
      success: false,
      originalPrompt: prompt,
      enhancedPrompt: prompt,
      contextApplied: false,
      sanitized: false,
      sanitizationLog: null,
      preSanitizationPrompt: null,
      postAISanitized: false,
      aiEnhanced: false,
      profileUsed: null,
      analysis: null,
      steps: [],
      metadata: {}
    };

    try {
      // PASO 1: Selección automática de perfil si no se especifica
      let finalProfileId = contextProfileId;
      
      if (!finalProfileId && autoSelectProfile) {
        finalProfileId = await this.autoSelectProfile(prompt, type);
        result.steps.push(`Auto-selected profile: ${finalProfileId}`);
      }

      // 🆕 PASO 1.5: DETECTAR MODO DIGITAL TWIN
      let isDigitalTwin = false;
      if (finalProfileId) {
        isDigitalTwin = await this.detectDigitalTwinMode(finalProfileId);
        console.log(`✅ Digital Twin profile validated: ${finalProfileId}`);
      }

      // PASO 2: Aplicar Context Profile si está disponible
      if (finalProfileId) {
        console.log(`🎯 Applying context profile: ${finalProfileId}`);
        
        // 🎯 FIXED: NO predeterminar modelo - pasar opciones correctas
        const contextOptions = {
          useAdvancedEnhancement: true,
          optimizeForModel: options.targetModel || 'flexible', // 🎯 NO predeterminar modelo
          // 🆕 NEW: Digital Twin specific options
          includeDigitalTwin: isDigitalTwin, // Auto-enable for digital twins
          maxLength: isDigitalTwin ? 800 : 350, // Adaptive length limits
          includeNegatives: true, // Include avoid terms for better filtering
          separator: ', ' // Consistent separator
        };

        console.log(`🎯 Context options for ${isDigitalTwin ? 'Digital Twin' : 'Standard'} profile:`, contextOptions);
        
        const contextResult = await enhancePromptWithContext(prompt, finalProfileId, contextOptions);

        if (contextResult.success) {
          result.enhancedPrompt = contextResult.enhancedPrompt;
          result.contextApplied = true;
          result.profileUsed = finalProfileId;
          result.steps.push('Context profile applied successfully');
          
          console.log(`✨ Context applied: "${result.enhancedPrompt}"`);
        } else {
          console.warn(`⚠️ Context application failed: ${contextResult.error}`);
          result.steps.push(`Context failed: ${contextResult.error}`);
        }
      }

      // 🛡️ PASO 2.5: SANITIZAR PROMPT (FIXED) - Skip for Digital Twins
      if (useSanitizer && !isDigitalTwin) {
        console.log('🛡️ Applying prompt sanitization...');
        
        try {
          const sanitizationResult = sanitizePrompt(result.enhancedPrompt);
          
          if (sanitizationResult && sanitizationResult.changed) {
            result.preSanitizationPrompt = result.enhancedPrompt;
            result.enhancedPrompt = sanitizationResult.sanitized;
            result.sanitized = true;
            
            // 🎯 FIXED: Correct access to sanitization results
            const replacements = sanitizationResult.changes || [];
            result.sanitizationLog = { replacements: replacements };
            
            // Log each replacement
            replacements.forEach(change => {
              console.log(`🛡️ Sanitized: "${change.term}" → "${change.replacement}" (${change.count} occurrences)`);
            });
            
            result.steps.push(`Prompt sanitized: ${replacements.length} terms replaced`);
            console.log(`🛡️ Sanitized: "${result.enhancedPrompt}"`);
          } else {
            result.steps.push('No sanitization needed');
            console.log('🛡️ No sensitive terms found');
          }
        } catch (sanitizerError) {
          console.error('🚨 Sanitizer error:', sanitizerError);
          result.steps.push('Sanitizer error - using original prompt');
        }
      }

      // PASO 3: Enhancement con AI si está habilitado (Skip for Digital Twins)
      if (useAI && !isDigitalTwin) {
        console.log(`🤖 Applying AI enhancement with ${aiModel}`);
        
        // 🎯 FIXED: Pasar Digital Twin mode al AI enhancement
        const aiResult = await enhancePrompt(result.enhancedPrompt, type, aiModel, true, isDigitalTwin);
        
        if (aiResult.success) {
          result.enhancedPrompt = aiResult.enhancedPrompt;
          result.aiEnhanced = true;
          result.steps.push('AI enhancement applied successfully');
          
          console.log(`🚀 AI enhanced: "${result.enhancedPrompt}"`);
        } else {
          console.warn(`⚠️ AI enhancement failed: ${aiResult.error}`);
          result.steps.push(`AI enhancement failed: ${aiResult.error}`);
          
          // Usar fallback model si falló
          if (aiModel !== CONFIG.generation.enhancement.fallbackModel) {
            console.log(`🔄 Trying fallback model: ${CONFIG.generation.enhancement.fallbackModel}`);
            const fallbackResult = await enhancePrompt(result.enhancedPrompt, type, CONFIG.generation.enhancement.fallbackModel, true, isDigitalTwin);
            
            if (fallbackResult.success) {
              result.enhancedPrompt = fallbackResult.enhancedPrompt;
              result.aiEnhanced = true;
              result.steps.push('Fallback AI enhancement applied');
            }
          }
        }
      } else if (useAI && isDigitalTwin) {
        console.log(`🎯 Skipping AI enhancement for Digital Twin - preserving context profile integrity`);
        result.steps.push('AI enhancement skipped for Digital Twin');
      }

      // 🛡️ PASO 3.5: SANITIZAR NUEVAMENTE DESPUÉS DEL AI (FIXED)
      if (useAI && result.aiEnhanced && useSanitizer && !isDigitalTwin) {
        console.log('🛡️ Re-sanitizing after AI enhancement...');
        
        try {
          const postAISanitization = sanitizePrompt(result.enhancedPrompt);
          
          if (postAISanitization && postAISanitization.changed) {
            result.enhancedPrompt = postAISanitization.sanitized;
            result.postAISanitized = true;
            result.steps.push('Post-AI sanitization applied');
            console.log(`🛡️ Re-sanitized: "${result.enhancedPrompt}"`);
            
            // 🎯 FIXED: Correct access to post-AI sanitization results
            const postReplacements = postAISanitization.changes || [];
            
            if (postReplacements.length > 0) {
              console.log(`🚨 AI re-introduced ${postReplacements.length} sensitive terms - now sanitized`);
              postReplacements.forEach(change => {
                console.log(`🛡️ Post-AI sanitized: "${change.term}" → "${change.replacement}"`);
              });
            }
          } else {
            result.steps.push('No post-AI sanitization needed');
            console.log('🛡️ AI output was clean');
          }
        } catch (postSanitizerError) {
          console.error('🚨 Post-AI sanitizer error:', postSanitizerError);
          result.steps.push('Post-AI sanitizer error');
        }
      }

      // PASO 4: Análisis de compatibilidad si se solicita
      if (includeAnalysis && finalProfileId) {
        const profile = await contextProfileManager.loadProfile(finalProfileId);
        if (profile) {
          const { analyzePromptCompatibility } = await import('../context-enhancer.js');
          result.analysis = analyzePromptCompatibility(result.enhancedPrompt, profile);
          result.steps.push('Compatibility analysis completed');
        }
      }

      // PASO 5: Validación final
      if (result.enhancedPrompt && result.enhancedPrompt.length > 0) {
        result.success = true;
        
        // Recordar uso exitoso del perfil
        if (finalProfileId && result.contextApplied) {
          await this.recordProfileSuccess(finalProfileId, prompt, result.enhancedPrompt, isDigitalTwin);
        }
        
        console.log(`🎉 Enhancement completed successfully`);
        console.log('📊 UNIFIED ENHANCER METRICS:');
        console.log('   Final prompt length:', result.enhancedPrompt.length);
        console.log('   Length increase:', ((result.enhancedPrompt.length / prompt.length - 1) * 100).toFixed(1) + '%');
        console.log('   Context applied:', result.contextApplied);
        console.log('   AI enhanced:', result.aiEnhanced);
        console.log('   Sanitized:', result.sanitized);
        console.log(`   Steps: ${result.steps.length}`);
        console.log(`   Final: "${result.enhancedPrompt}"`);
      }

      // 🎯 FIXED: Metadata del resultado con acceso seguro
      result.metadata = {
        originalLength: prompt.length,
        enhancedLength: result.enhancedPrompt.length,
        improvementRatio: result.enhancedPrompt.length / prompt.length,
        processingSteps: result.steps.length,
        timestamp: new Date().toISOString(),
        sanitizerUsed: useSanitizer,
        termsSanitized: result.sanitized && result.sanitizationLog 
          ? result.sanitizationLog.replacements.length 
          : 0,
        postAISanitized: result.postAISanitized || false,
        // 🆕 NEW: Digital Twin metadata
        digitalTwinMode: isDigitalTwin,
        profileType: isDigitalTwin ? 'digital_twin' : 'standard'
      };

      return result;

    } catch (error) {
      console.error('❌ UnifiedEnhancer error:', error);
      
      result.steps.push(`Error: ${error.message}`);
      result.metadata.error = error.message;
      
      return result;
    }
  }

  /**
   * 🎯 Auto-selección inteligente de perfil basada en el prompt
   */
  async autoSelectProfile(prompt, type) {
    try {
      const profiles = contextProfileManager.listProfiles();
      
      if (profiles.length === 0) {
        console.log('📝 No profiles available for auto-selection');
        return null;
      }

      // 🆕 ENHANCED: Priorizar Digital Twin profiles para productos específicos
      const promptLower = prompt.toLowerCase();
      
      // Check for specific product mentions that might have digital twins
      const productKeywords = ['prudential', 'comfort total', 'package', 'product', 'brand'];
      const hasProductKeywords = productKeywords.some(keyword => promptLower.includes(keyword));
      
      if (hasProductKeywords) {
        // Look for digital twin profiles first
        for (const profile of profiles) {
          const isDigitalTwin = await this.detectDigitalTwinMode(profile.id);
          if (isDigitalTwin) {
            // Check if profile keywords match the prompt
            const profileKeywords = [
              profile.name.toLowerCase(),
              profile.description.toLowerCase()
            ].join(' ');
            
            const hasMatch = productKeywords.some(keyword => 
              promptLower.includes(keyword) && profileKeywords.includes(keyword)
            );
            
            if (hasMatch) {
              console.log(`🎯 Auto-selected Digital Twin profile: ${profile.id} (product match)`);
              return profile.id;
            }
          }
        }
      }

      // Fallback to original keyword matching
      const keywordMatches = {
        'marketing': ['marketing', 'business', 'corporate', 'professional'],
        'creative': ['artistic', 'creative', 'art', 'design'],
        'ecommerce': ['product', 'ecommerce', 'shop', 'retail', 'commercial'],
        'photography': ['photo', 'photography', 'picture', 'image']
      };

      for (const [category, keywords] of Object.entries(keywordMatches)) {
        if (keywords.some(keyword => promptLower.includes(keyword))) {
          // Buscar perfil que coincida con la categoría
          const matchingProfile = profiles.find(p => 
            p.name.toLowerCase().includes(category) || 
            p.description.toLowerCase().includes(category)
          );
          
          if (matchingProfile) {
            console.log(`🎯 Auto-selected profile: ${matchingProfile.id} (${category} match)`);
            return matchingProfile.id;
          }
        }
      }

      // Fallback: usar el perfil más usado
      const mostUsedProfile = profiles.reduce((prev, current) => 
        (current.totalGenerations > prev.totalGenerations) ? current : prev
      );

      console.log(`🎯 Auto-selected most used profile: ${mostUsedProfile.id}`);
      return mostUsedProfile.id;

    } catch (error) {
      console.error('❌ Error in auto-selection:', error);
      return null;
    }
  }

  /**
   * 📊 Registrar uso exitoso del perfil para aprendizaje (ENHANCED)
   */
  async recordProfileSuccess(profileId, originalPrompt, enhancedPrompt, isDigitalTwin = false) {
    try {
      const { updateProfileFromSuccess } = await import('../context-enhancer.js');
      await updateProfileFromSuccess(profileId, originalPrompt, {
        enhancedPrompt: enhancedPrompt,
        success: true
      }, {
        quality: 8,
        comment: 'Auto-enhancement successful',
        // 🆕 NEW: Include digital twin info
        digitalTwinUsed: isDigitalTwin,
        enhancementType: isDigitalTwin ? 'digital_twin' : 'standard'
      });
      
      console.log(`📈 Recorded success for profile ${profileId}`);
    } catch (error) {
      console.error('❌ Error recording profile success:', error);
    }
  }

  /**
   * 🎨 Enhancement específico para imagen con configuración optimizada
   */
  async enhanceForImage(prompt, options = {}) {
    return this.enhancePrompt(prompt, {
      type: 'image',
      ...options
    });
  }

  /**
   * 🎬 Enhancement específico para video con configuración optimizada
   */
  async enhanceForVideo(prompt, options = {}) {
    return this.enhancePrompt(prompt, {
      type: 'video',
      ...options
    });
  }

  /**
   * 🛡️ Enhancement con sanitización forzada (para casos especiales)
   */
  async enhanceWithSanitizer(prompt, options = {}) {
    return this.enhancePrompt(prompt, {
      useSanitizer: true,
      ...options
    });
  }

  /**
   * 🆕 NEW: Enhancement específico para Digital Twins
   */
  async enhanceForDigitalTwin(prompt, profileId, options = {}) {
    return this.enhancePrompt(prompt, {
      contextProfileId: profileId,
      type: 'image', // Digital twins typically for product images
      useAI: true,
      useSanitizer: true,
      includeAnalysis: true, // Include compatibility analysis for digital twins
      ...options
    });
  }

  /**
   * 📊 Obtener estadísticas de enhancement (ENHANCED)
   */
  getStats() {
    const profiles = contextProfileManager.listProfiles();
    
    return {
      totalProfiles: profiles.length,
      profilesWithUsage: profiles.filter(p => p.totalGenerations > 0).length,
      mostUsedProfile: profiles.reduce((prev, current) => 
        (current.totalGenerations > prev.totalGenerations) ? current : prev, 
        { totalGenerations: 0 }
      ),
      initialized: this.initialized,
      features: {
        contextProfiles: true,
        sanitizer: true,
        aiEnhancement: true,
        autoSelection: true,
        compatibilityAnalysis: true,
        postAISanitization: true,
        digitalTwinDetection: true, // 🆕 NEW FEATURE
        adaptiveLengthLimits: true, // 🆕 NEW FEATURE
        intelligentTruncation: true // 🆕 NEW FEATURE
      }
    };
  }
}

// 🌟 Export singleton instance
export const unifiedEnhancer = new UnifiedEnhancer();

// 🚀 Export convenience functions
export async function enhancePromptUnified(prompt, options = {}) {
  return unifiedEnhancer.enhancePrompt(prompt, options);
}

export async function enhanceImagePrompt(prompt, options = {}) {
  return unifiedEnhancer.enhanceForImage(prompt, options);
}

export async function enhanceVideoPrompt(prompt, options = {}) {
  return unifiedEnhancer.enhanceForVideo(prompt, options);
}

// 🛡️ Convenience function for sanitized enhancement
export async function enhancePromptSafe(prompt, options = {}) {
  return unifiedEnhancer.enhanceWithSanitizer(prompt, options);
}

// 🆕 NEW: Convenience function for Digital Twin enhancement
export async function enhanceDigitalTwin(prompt, profileId, options = {}) {
  return unifiedEnhancer.enhanceForDigitalTwin(prompt, profileId, options);
}