import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data.json');

export async function readData() {
  try {
    const json = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(json);
  } catch (err) {
    // if file doesn't exist or can't be parsed, return default shape
    return {
      musicReleases: [],
      actingProjects: [],
      galleryItems: [],
      teamMembers: [],
      contactMessages: []
    };
  }
}

export async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}
