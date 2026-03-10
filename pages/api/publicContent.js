import { readData } from '../../lib/db';
import { supabase } from '../../lib/supabase';

const RESOURCES = [
  'filmReleases',
  'actingProjects',
  'galleryItems',
  'teamMembers'
];

const hasSupabase = Boolean(supabase);

async function readFromFileStore() {
  const data = await readData();
  return RESOURCES.reduce((acc, key) => {
    acc[key] = Array.isArray(data[key]) ? data[key] : [];
    return acc;
  }, {});
}

async function readFromSupabase() {
  const results = await Promise.all(
    RESOURCES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return [table, data || []];
    })
  );

  return results.reduce((acc, [table, rows]) => {
    acc[table] = rows;
    return acc;
  }, {});
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    if (hasSupabase) {
      const payload = await readFromSupabase();
      return res.status(200).json(payload);
    }

    const payload = await readFromFileStore();
    return res.status(200).json(payload);
  } catch (err) {
    console.error('publicContent error:', err);
    return res.status(500).json({ error: 'Failed to load public content.' });
  }
}
