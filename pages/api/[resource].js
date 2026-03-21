/**
 * ============================================================
 * FILE: pages/api/[resource].js - FILM DASHBOARD API
 * Fixed: filmses → filmReleases + dashboard auth ready
 * ============================================================
 */

import { readData, writeData } from '../../lib/db';
import jwt from 'jsonwebtoken';

// ALLOWED RESOURCES (frontend uses these exact names)
const ALLOWED_RESOURCES = new Set([
  'filmReleases',
  'actingProjects',
  'galleryItems',
  'teamMembers',
  'contactMessages',
]);

// MAIN HANDLER
export default async function handler(req, res) {
  const { resource } = req.query;

  // Validate resource
  if (!ALLOWED_RESOURCES.has(resource)) {
    return res.status(400).json({
      error: `Unknown resource "${resource}". Allowed: ${[...ALLOWED_RESOURCES].join(', ')}`,
    });
  }

// JWT AUTH: Verify Bearer token for writes
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Public read: /api/filmReleases → delegates to lib/db.js (Supabase/file)
        const records = await readData(resource);
        return res.status(200).json(records);
      }

      case 'POST': {
        const body = req.body;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return res.status(400).json({ error: 'Body must be JSON object' });
        }
        const record = { id: body.id ?? Date.now(), ...body };
        const created = await writeData(resource, 'POST', record);
        return res.status(201).json(created);
      }

      case 'PUT': {
        const { id, ...updates } = req.body ?? {};
        if (!id) return res.status(400).json({ error: 'PUT requires `id` in body' });
        const updated = await writeData(resource, 'PUT', { id, ...updates });
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'DELETE requires ?id= param' });
        const result = await writeData(resource, 'DELETE', Number(id));
        return res.status(200).json(result);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error(`[api/${resource}] ${req.method}:`, err.message);
    return res.status(500).json({ error: err.message ?? 'Internal error' });
  }
}
