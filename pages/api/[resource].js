import { readData, writeData } from '../../lib/db';
import { supabase } from '../../lib/supabase';

// utility to detect if Supabase client is configured
const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { resource } = req.query;

  // prefer Supabase if available
  if (hasSupabase) {
    // table names should correspond exactly to resource names used in front end
    const table = resource;
    try {
      switch (req.method) {
        case 'GET': {
          const { data, error } = await supabase.from(table).select('*');
          if (error) throw error;
          return res.status(200).json(data);
        }
        case 'POST': {
          const { data, error } = await supabase.from(table).insert(req.body);
          if (error) throw error;
          return res.status(201).json(data);
        }
        case 'PUT': {
          if (Array.isArray(req.body)) {
            // bulk upsert
            const { data, error } = await supabase.from(table).upsert(req.body);
            if (error) throw error;
            return res.status(200).json(data);
          } else {
            const { id, ...rest } = req.body;
            const { data, error } = await supabase.from(table).update(rest).eq('id', id);
            if (error) throw error;
            return res.status(200).json(data);
          }
        }
        case 'DELETE': {
          const { id } = req.query;
          const { data, error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          return res.status(200).json({ ok: true });
        }
        default:
          res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (err) {
      console.error('Supabase error', err);
      return res.status(500).json({ error: err.message || 'Server error' });
    }
  }

  // fallback to file-based implementation for local/dev
  const data = await readData();
  if (!data[resource]) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  const items = data[resource];

  switch (req.method) {
    case 'GET':
      res.status(200).json(items);
      break;
    case 'POST':
      // create new item
      const newItem = req.body;
      items.push(newItem);
      await writeData(data);
      res.status(201).json(newItem);
      break;
    case 'PUT':
      // full replace or bulk write
      if (Array.isArray(req.body)) {
        data[resource] = req.body;
      } else {
        const { id, ...rest } = req.body;
        data[resource] = items.map(i => (i.id === id ? { id, ...rest } : i));
      }
      await writeData(data);
      res.status(200).json(data[resource]);
      break;
    case 'DELETE':
      const { id } = req.query;
      data[resource] = items.filter(i => i.id !== parseInt(id, 10));
      await writeData(data);
      res.status(200).json({ ok: true });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
