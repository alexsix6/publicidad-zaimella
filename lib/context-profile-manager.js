// Context Profile Manager - Core system for JSON Context Profiles
// Manages creation, storage, and application of context profiles

import { promises as fs } from 'fs';
import path from 'path';

export class ContextProfileManager {
  constructor() {
    this.profiles = new Map();
    this.profilesDir = './data/context-profiles';
    this.activeProfile = null;
    this.initialized = false;
  }

  // 🏗️ Initialize the manager and load existing profiles
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Ensure profiles directory exists
      await fs.mkdir(this.profilesDir, { recursive: true });
      
      // Load existing profiles
      await this.loadAllProfiles();
      
      this.initialized = true;
      console.log(`✅ ContextProfileManager initialized with ${this.profiles.size} profiles`);
    } catch (error) {
      console.error('❌ Error initializing ContextProfileManager:', error);
      throw error;
    }
  }

  // 📁 Load all profiles from storage
  async loadAllProfiles() {
    try {
      const files = await fs.readdir(this.profilesDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        const profileId = path.basename(file, '.json');
        const profile = await this.loadProfile(profileId);
        if (profile) {
          this.profiles.set(profileId, profile);
        }
      }
      
      console.log(`📁 Loaded ${this.profiles.size} context profiles`);
    } catch (error) {
      console.warn('⚠️ No existing profiles found, starting fresh');
    }
  }

  // 🆕 Create a new context profile
  async createProfile(profileData) {
    try {
      // Validate required fields
      if (!profileData.name || !profileData.context) {
        throw new Error('Profile must have name and context');
      }

      // Generate unique ID
      const profileId = this.generateProfileId(profileData.name);
      
      // Create profile structure
      const profile = {
        profile: {
          id: profileId,
          name: profileData.name,
          description: profileData.description || '',
          version: '1.0.0',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        context: {
          user_preferences: profileData.context.user_preferences || {},
          project_context: profileData.context.project_context || {},
          technical_preferences: profileData.context.technical_preferences || {},
          brand_guidelines: profileData.context.brand_guidelines || {}
        },
        memory: {
          successful_prompts: [],
          learned_patterns: {},
          usage_stats: {
            total_generations: 0,
            success_rate: 0,
            last_used: null
          }
        },
        relationships: {
          semantic_connections: {},
          style_associations: {}
        }
      };

      // Validate profile structure
      this.validateProfile(profile);

      // Save to storage
      await this.saveProfile(profileId, profile);
      
      // Add to memory
      this.profiles.set(profileId, profile);

      console.log(`✅ Created context profile: ${profileId} (${profile.profile.name})`);
      
      return {
        success: true,
        profileId: profileId,
        profile: profile
      };
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📖 Load a specific profile
  async loadProfile(profileId) {
    try {
      // Check memory first
      if (this.profiles.has(profileId)) {
        return this.profiles.get(profileId);
      }

      // Load from storage
      const filePath = path.join(this.profilesDir, `${profileId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const profile = JSON.parse(data);
      
      // Validate profile
      this.validateProfile(profile);
      
      // Add to memory
      this.profiles.set(profileId, profile);
      
      console.log(`📖 Loaded profile: ${profileId}`);
      return profile;
    } catch (error) {
      console.error(`❌ Error loading profile ${profileId}:`, error);
      return null;
    }
  }

  // 🔄 Update an existing profile
  async updateProfile(profileId, updates) {
    try {
      const profile = await this.loadProfile(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      // Deep merge updates
      const updatedProfile = this.deepMerge(profile, updates);
      
      // Update metadata
      updatedProfile.profile.updated = new Date().toISOString();
      updatedProfile.profile.version = this.incrementVersion(profile.profile.version);

      // Validate updated profile
      this.validateProfile(updatedProfile);

      // Save to storage
      await this.saveProfile(profileId, updatedProfile);
      
      // Update memory
      this.profiles.set(profileId, updatedProfile);

      console.log(`🔄 Updated profile: ${profileId}`);
      
      return {
        success: true,
        profile: updatedProfile
      };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🗑️ Delete a profile
  async deleteProfile(profileId) {
    try {
      // Remove from storage
      const filePath = path.join(this.profilesDir, `${profileId}.json`);
      await fs.unlink(filePath);
      
      // Remove from memory
      this.profiles.delete(profileId);
      
      console.log(`🗑️ Deleted profile: ${profileId}`);
      
      return {
        success: true,
        message: `Profile ${profileId} deleted successfully`
      };
    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎯 Apply context profile to a prompt
  async applyContextToPrompt(prompt, profileId) {
    try {
      const profile = await this.loadProfile(profileId);
      if (!profile) {
        console.warn(`⚠️ Profile ${profileId} not found, using original prompt`);
        return {
          success: false,
          enhancedPrompt: prompt,
          error: 'Profile not found'
        };
      }

      // Build contextual prompt
      const enhancedPrompt = this.buildContextualPrompt(prompt, profile);
      
      // Record usage
      await this.recordUsage(profileId, prompt);

      console.log(`🎯 Applied context ${profileId} to prompt`);
      console.log(`   Original: "${prompt}"`);
      console.log(`   Enhanced: "${enhancedPrompt}"`);

      return {
        success: true,
        enhancedPrompt: enhancedPrompt,
        profile: profile,
        contextApplied: true
      };
    } catch (error) {
      console.error('❌ Error applying context:', error);
      return {
        success: false,
        enhancedPrompt: prompt,
        error: error.message
      };
    }
  }

  // 🏗️ Build contextual prompt from profile
  buildContextualPrompt(prompt, profile) {
    const context = profile.context;
    const parts = [prompt];

    // Add style preferences
    if (context.user_preferences?.style) {
      parts.push(`${context.user_preferences.style} style`);
    }

    // Add mood
    if (context.user_preferences?.mood) {
      parts.push(`${context.user_preferences.mood} mood`);
    }

    // Add color palette
    if (context.user_preferences?.color_palette?.length > 0) {
      parts.push(`color palette: ${context.user_preferences.color_palette.join(', ')}`);
    }

    // Add project context
    if (context.project_context?.theme) {
      parts.push(`${context.project_context.theme} theme`);
    }

    // Add brand values
    if (context.brand_guidelines?.values?.length > 0) {
      parts.push(`brand values: ${context.brand_guidelines.values.join(', ')}`);
    }

    // Add quality preferences
    if (context.technical_preferences?.quality) {
      parts.push(`${context.technical_preferences.quality} quality`);
    }

    // Add things to avoid
    if (context.user_preferences?.avoid?.length > 0) {
      parts.push(`avoid: ${context.user_preferences.avoid.join(', ')}`);
    }

    return parts.join(', ');
  }

  // 📊 Record usage statistics
  async recordUsage(profileId, prompt) {
    try {
      const profile = this.profiles.get(profileId);
      if (!profile) return;

      profile.memory.usage_stats.total_generations++;
      profile.memory.usage_stats.last_used = new Date().toISOString();

      // Save updated stats
      await this.saveProfile(profileId, profile);
    } catch (error) {
      console.error('❌ Error recording usage:', error);
    }
  }

  // 📝 List all profiles
  listProfiles() {
    const profileList = Array.from(this.profiles.values()).map(profile => ({
      id: profile.profile.id,
      name: profile.profile.name,
      description: profile.profile.description,
      created: profile.profile.created,
      updated: profile.profile.updated,
      totalGenerations: profile.memory.usage_stats.total_generations,
      lastUsed: profile.memory.usage_stats.last_used
    }));

    return profileList;
  }

  // 💾 Save profile to storage
  async saveProfile(profileId, profile) {
    const filePath = path.join(this.profilesDir, `${profileId}.json`);
    await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');
  }

  // 🔍 Validate profile structure
  validateProfile(profile) {
    const required = ['profile', 'context', 'memory', 'relationships'];
    for (const field of required) {
      if (!profile[field]) {
        throw new Error(`Profile missing required field: ${field}`);
      }
    }

    if (!profile.profile.id || !profile.profile.name) {
      throw new Error('Profile metadata incomplete');
    }
  }

  // 🆔 Generate unique profile ID
  generateProfileId(name) {
    const timestamp = Date.now();
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    return `${sanitized}_${timestamp}`;
  }

  // 🔄 Deep merge objects
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // 📈 Increment version number
  incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }
}

// 🌟 Export singleton instance
export const contextProfileManager = new ContextProfileManager(); 