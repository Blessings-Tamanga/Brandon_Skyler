import { readData, writeData } from '../../lib/db';
import { supabase } from '../../lib/supabase';

const VALID_RESOURCES = new Set([
  'filmReleases',
  'actingProjects',
  'galleryItems',
  'teamMembers',
  'contactMessages'
]);

const SUPABASE_TABLE_MAP = {
  filmReleases: 'filmReleases',
  actingProjects: 'actingProjects',
  galleryItems: 'galleryItems',
  teamMembers: 'teamMembers',
  contactMessages: 'contactMessages'
};

const hasSupabase = Boolean(supabase);

async function handleFileStore(req, res, resource) {
  const data = await readData();
  const items = data[resource];

  if (!Array.isArray(items)) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return res.status(200).json(items);
      case 'POST': {
        const newItem = req.body;
        items.push(newItem);
        await writeData(data);
        return res.status(201).json(newItem);
      }
      case 'PUT': {
        if (Array.isArray(req.body)) {
          data[resource] = req.body;
        } else {
          const { id, ...rest } = req.body;
          data[resource] = items.map((i) => (i.id === id ? { id, ...rest } : i));
        }
        await writeData(data);
        return res.status(200).json(data[resource]);
      }
      case 'DELETE': {
        const { id } = req.query;
        data[resource] = items.filter((i) => i.id !== Number(id));
        await writeData(data);
        return res.status(200).json({ ok: true });
      }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    const isWrite = req.method !== 'GET';
    if (isWrite) {
      return res.status(500).json({
        error: 'File storage write failed. Configure Supabase for persistent writes on Vercel.',
        details: String(err.message || err)
      });
    }
    return res.status(500).json({ error: 'File storage read failed.' });
  }
}

async function handleSupabaseStore(req, res, resource) {
  const table = SUPABASE_TABLE_MAP[resource] || resource;
  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return res.status(200).json(data || []);
    }case 'POST': {
  // Ensure payload is always an array
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  // Fill defaults for missing NOT NULL fields
  const prepared = payload.map(item => ({
    title: item.title || 'Untitled',
    description: item.description || 'No description',
    video: item.video || '',
    link: item.link || '#'
  }));

  // Insert into Supabase
  const { data, error } = await supabase.from(table).insert(prepared).select();
  if (error) throw error;

  return res.status(201).json(data || []);
}
    case 'PUT': {
      if (Array.isArray(req.body)) {
        // Replace full collection (used by dashboard clear-all flows).
        const { error: deleteError } = await supabase.from(table).delete().not('id', 'is', null);
        if (deleteError) throw deleteError;
        if (req.body.length === 0) return res.status(200).json([]);
        const { data, error } = await supabase.from(table).insert(req.body).select();
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      const { id, ...rest } = req.body;
      if (typeof id === 'undefined') {
        return res.status(400).json({ error: 'Missing id in PUT payload.' });
      }
      const { data, error } = await supabase.from(table).update(rest).eq('id', id).select();
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    case 'DELETE': {
      const { id } = req.query;
      if (typeof id === 'undefined') {
        return res.status(400).json({ error: 'Missing id in query string.' });
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default async function handler(req, res) {
  const { resource } = req.query;
  if (!VALID_RESOURCES.has(resource)) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (hasSupabase) {
    try {
      return await handleSupabaseStore(req, res, resource);
    } catch (err) {
      console.error('Supabase error:', err);
      if (req.method === 'GET') {
        // Read-only fallback helps the dashboard load if DB is temporarily unavailable.
        return handleFileStore(req, res, resource);
      }
      return res.status(502).json({
        error: 'Database write failed. Check Supabase credentials/table permissions.',
        details: String(err.message || err)
      });
    }
  }

  return handleFileStore(req, res, resource);
}
