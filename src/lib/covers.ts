import fs from 'fs';
import path from 'path';

export interface Cover {
  id: string;
  filename: string;
  title?: string;
  source?: string;
  url: string;
}

export async function getCovers(): Promise<Cover[]> {
  const coversDir = path.join(process.cwd(), 'public/covers');
  
  try {
    const files = fs.readdirSync(coversDir);
    
    return files
      .filter(file => /\.(jpg|jpeg|png|webp|svg)$/i.test(file))
      .map((file, index) => ({
        id: `cover-${index + 1}`,
        filename: file,
        title: `封面 ${index + 1}`,
        source: '示例来源',
        url: `/covers/${file}`
      }));
  } catch (error) {
    console.error('Error reading covers directory:', error);
    return [];
  }
}
