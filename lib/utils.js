import axios from 'axios';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function downloadAndSaveFile(url, fileName, folder = 'generated') {
  const maxRetries = 3;
  const timeoutMs = 30000; // 30 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      //console.log(`📥 Downloading attempt ${attempt}/${maxRetries}: ${fileName}`);
      
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageDownloader/1.0)'
        }
      });
      
      const filePath = join(process.cwd(), 'public', folder, fileName);
      writeFileSync(filePath, response.data);
      
      //console.log(`✅ Image saved successfully: ${fileName}`);
      
      return {
        success: true,
        localPath: `/public/${folder}/${fileName}`,
        publicUrl: `${process.env.VERCEL_URL || 'http://localhost:3000'}/${folder}/${fileName}`,
        remoteUrl: url
      };
    } catch (error) {
      console.error(`❌ Download attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        // Si fallan todos los reintentos, devolver URL remota
        console.log(`⚠️ Using remote URL as fallback: ${url}`);
        return {
          success: false,
          error: error.message,
          fallbackUrl: url,
          publicUrl: url // Fallback a URL remota
        };
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

export function generateFileName(type = 'image', extension = 'png') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${type}-${timestamp}-${randomId}.${extension}`;
}

export function enhancePromptForVideo(imagePrompt, videoStyle = 'cinematic') {
  const videoEnhancements = {
    cinematic: "smooth camera movement, cinematic lighting",
    viral: "dynamic angles, engaging movement", 
    artistic: "creative transitions, artistic flow"
  };
  
  const enhancement = videoEnhancements[videoStyle] || videoEnhancements.cinematic;
  return `${imagePrompt}, ${enhancement}`;
}
