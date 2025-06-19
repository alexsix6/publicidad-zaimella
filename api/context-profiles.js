// API Endpoints for JSON Context Profiles
// Provides RESTful API for context profile management

import { contextProfileManager } from '../lib/context-profile-manager.js';
import { enhancePromptWithContext, analyzePromptCompatibility } from '../lib/context-enhancer.js';

// 🏗️ Initialize context manager
async function ensureInitialized() {
  if (!contextProfileManager.initialized) {
    await contextProfileManager.initialize();
  }
}

// 📝 GET /api/context-profiles - List all profiles
export async function listContextProfiles(req, res) {
  try {
    await ensureInitialized();
    
    const profiles = contextProfileManager.listProfiles();
    
    res.json({
      success: true,
      profiles: profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('❌ Error listing profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 📖 GET /api/context-profiles/:id - Get specific profile
export async function getContextProfile(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const profile = await contextProfileManager.loadProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile ${id} not found`
      });
    }
    
    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('❌ Error getting profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🆕 POST /api/context-profiles - Create new profile
export async function createContextProfile(req, res) {
  try {
    await ensureInitialized();
    
    const profileData = req.body;
    
    // Validate required fields
    if (!profileData.name) {
      return res.status(400).json({
        success: false,
        error: 'Profile name is required'
      });
    }
    
    if (!profileData.context) {
      return res.status(400).json({
        success: false,
        error: 'Profile context is required'
      });
    }
    
    const result = await contextProfileManager.createProfile(profileData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profileId: result.profileId,
        profile: result.profile
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🔄 PUT /api/context-profiles/:id - Update profile
export async function updateContextProfile(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const updates = req.body;
    
    const result = await contextProfileManager.updateProfile(id, updates);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: result.profile
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🗑️ DELETE /api/context-profiles/:id - Delete profile
export async function deleteContextProfile(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const result = await contextProfileManager.deleteProfile(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🎯 POST /api/context-profiles/:id/enhance - Enhance prompt with profile
export async function enhancePrompt(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const { prompt, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }
    
    const result = await enhancePromptWithContext(prompt, id, options);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error enhancing prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 📊 POST /api/context-profiles/:id/analyze - Analyze prompt compatibility
export async function analyzePrompt(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }
    
    const profile = await contextProfileManager.loadProfile(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile ${id} not found`
      });
    }
    
    const analysis = analyzePromptCompatibility(prompt, profile);
    
    res.json({
      success: true,
      analysis: analysis,
      profile: {
        id: profile.profile.id,
        name: profile.profile.name
      }
    });
  } catch (error) {
    console.error('❌ Error analyzing prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 📈 GET /api/context-profiles/:id/stats - Get profile statistics
export async function getProfileStats(req, res) {
  try {
    await ensureInitialized();
    
    const { id } = req.params;
    const profile = await contextProfileManager.loadProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile ${id} not found`
      });
    }
    
    const stats = {
      profile: {
        id: profile.profile.id,
        name: profile.profile.name,
        created: profile.profile.created,
        updated: profile.profile.updated,
        version: profile.profile.version
      },
      usage: profile.memory.usage_stats,
      memory: {
        successful_prompts_count: profile.memory.successful_prompts.length,
        learned_patterns_count: Object.keys(profile.memory.learned_patterns).length,
        recent_prompts: profile.memory.successful_prompts.slice(-5).map(p => ({
          prompt: p.prompt.substring(0, 50) + (p.prompt.length > 50 ? '...' : ''),
          timestamp: p.timestamp,
          quality: p.result_quality
        }))
      },
      relationships: {
        semantic_connections_count: Object.keys(profile.relationships.semantic_connections || {}).length,
        style_associations_count: Object.keys(profile.relationships.style_associations || {}).length
      }
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error getting profile stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 🎨 POST /api/context-profiles/quick-create - Quick profile creation with templates
export async function quickCreateProfile(req, res) {
  try {
    await ensureInitialized();
    
    const { template, name, customizations = {} } = req.body;
    
    if (!template || !name) {
      return res.status(400).json({
        success: false,
        error: 'Template and name are required'
      });
    }
    
    // Profile templates
    const templates = {
      'marketing-agency': {
        description: 'Professional marketing agency profile',
        context: {
          user_preferences: {
            style: 'modern professional',
            mood: 'confident',
            color_palette: ['#2563eb', '#f8fafc', '#1e293b'],
            avoid: ['amateur', 'cluttered']
          },
          project_context: {
            theme: 'corporate excellence',
            target_audience: 'business professionals'
          },
          technical_preferences: {
            quality: 'high',
            aspect_ratio: '16:9'
          },
          brand_guidelines: {
            values: ['professionalism', 'innovation', 'reliability']
          }
        }
      },
      'creative-studio': {
        description: 'Creative studio with artistic focus',
        context: {
          user_preferences: {
            style: 'artistic creative',
            mood: 'inspiring',
            color_palette: ['#7c3aed', '#f59e0b', '#ef4444'],
            avoid: ['boring', 'corporate']
          },
          project_context: {
            theme: 'creative expression',
            target_audience: 'creative professionals'
          },
          technical_preferences: {
            quality: 'ultra-high',
            aspect_ratio: '1:1'
          },
          brand_guidelines: {
            values: ['creativity', 'innovation', 'uniqueness']
          }
        }
      },
      'e-commerce': {
        description: 'E-commerce product photography profile',
        context: {
          user_preferences: {
            style: 'clean product',
            mood: 'appealing',
            color_palette: ['#ffffff', '#f3f4f6', '#111827'],
            avoid: ['distracting', 'dark']
          },
          project_context: {
            theme: 'product showcase',
            target_audience: 'online shoppers'
          },
          technical_preferences: {
            quality: 'ultra-high',
            aspect_ratio: '1:1'
          },
          brand_guidelines: {
            values: ['quality', 'clarity', 'appeal']
          }
        }
      }
    };
    
    const templateData = templates[template];
    if (!templateData) {
      return res.status(400).json({
        success: false,
        error: `Template '${template}' not found. Available: ${Object.keys(templates).join(', ')}`
      });
    }
    
    // Merge template with customizations
    const profileData = {
      name: name,
      description: customizations.description || templateData.description,
      context: {
        ...templateData.context,
        ...customizations.context
      }
    };
    
    const result = await contextProfileManager.createProfile(profileData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: `Profile created from ${template} template`,
        profileId: result.profileId,
        profile: result.profile,
        template: template
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error creating quick profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// 📋 GET /api/context-profiles/templates - List available templates
export async function listTemplates(req, res) {
  try {
    const templates = [
      {
        id: 'marketing-agency',
        name: 'Marketing Agency',
        description: 'Professional marketing agency with modern, clean aesthetic',
        preview: {
          style: 'modern professional',
          mood: 'confident',
          colors: ['#2563eb', '#f8fafc', '#1e293b']
        }
      },
      {
        id: 'creative-studio',
        name: 'Creative Studio',
        description: 'Artistic creative studio with inspiring visuals',
        preview: {
          style: 'artistic creative',
          mood: 'inspiring',
          colors: ['#7c3aed', '#f59e0b', '#ef4444']
        }
      },
      {
        id: 'e-commerce',
        name: 'E-commerce',
        description: 'Product photography with clean, appealing presentation',
        preview: {
          style: 'clean product',
          mood: 'appealing',
          colors: ['#ffffff', '#f3f4f6', '#111827']
        }
      }
    ];
    
    res.json({
      success: true,
      templates: templates
    });
  } catch (error) {
    console.error('❌ Error listing templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
} 