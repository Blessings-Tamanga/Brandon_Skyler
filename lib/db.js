import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data.json');

export async function readData() {
  const defaults = {
    filmReleases: [],
    actingProjects: [],
    galleryItems: [],
    teamMembers: [],
    contactMessages: []
  };
  try {
    const json = await fs.readFile(dataPath, 'utf-8');
    const parsed = JSON.parse(json);

    // Backward compatibility for older typo in data key.
    if (!parsed.filmReleases && Array.isArray(parsed.filmeleases)) {
      parsed.filmReleases = parsed.filmeleases;
      delete parsed.filmeleases;
      await writeData(parsed);
    }

    return { ...defaults, ...parsed };
  } catch (err) {
    // if file doesn't exist or can't be parsed, return default shape
    return defaults;
  }
}

export async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}
