import axios from 'axios';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function downloadAndSaveFile(url, fileName, folder = 'generated') {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = join(process.cwd(), 'public', folder, fileName);
    
    writeFileSync(filePath, response.data);
    
    return {
      success: true,
      localPath: `/public/${folder}/${fileName}`,
      publicUrl: `${process.env.VERCEL_URL || 'http://localhost:3000'}/${folder}/${fileName}`
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function generateFileName(type = 'image', extension = 'png') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${type}-${timestamp}-${randomId}.${extension}`;
}

export function enhancePromptForVideo(imagePrompt, videoStyle = 'cinematic') {
  const videoEnhancements = {
    cinematic: "cinematic camera movement, professional lighting, smooth motion",
    viral: "engaging camera angles, dynamic movement, attention-grabbing visuals",
    artistic: "creative transitions, artistic camera work, expressive movement"
  };
  
  return `${imagePrompt}, ${videoEnhancements[videoStyle] || videoEnhancements.cinematic}, high quality video, 5 seconds duration`;
} 