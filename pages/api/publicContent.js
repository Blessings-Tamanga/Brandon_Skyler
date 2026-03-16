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

export async function GET() {\n  try {\n    if (hasSupabase) {\n      const payload = await readFromSupabase();\n      return Response.json(payload);\n    }\n\n    const payload = await readFromFileStore();\n    return Response.json(payload);\n  } catch (err) {\n    console.error('publicContent error:', err);\n    return Response.json({ error: 'Failed to load public content.' }, { status: 500 });\n  }\n}\n\nexport const revalidate = 300; // ISR 5min
