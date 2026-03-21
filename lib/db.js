/**
 * lib/db.js - Unified Data Layer (Supabase + File Fallback)
 * FIXED: filmReleases naming, full CRUD support
 */

import { supabase } from './supabase';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const VALID_RESOURCES = new Set([
  'filmReleases',
  'actingProjects',
  'galleryItems',
  'teamMembers',
'contactMessages',
  'newsletterSubscribers'
]);

export const hasSupabase = Boolean(supabase);

// File fallback helpers (local dev)
async function readFileData(resource) {
  try {
    const raw = readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data[resource]) ? data[resource] : [];
  } catch {
    return [];
  }
}

async function writeFileData(resource, operation, payload) {
  try {
    const raw = readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    let items = Array.isArray(data[resource]) ? data[resource] : [];

    if (operation === 'POST') {
      items.push(payload);
    } else if (operation === 'PUT') {
      const { id, ...updates } = payload;
      items = items.map(item => item.id === id ? { ...item, ...updates } : item);
    } else if (operation === 'DELETE') {
      items = items.filter(item => item.id !== payload);
    }

    data[resource] = items;
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return items;
  } catch (err) {
    console.error('File write failed:', err);
    throw new Error('Local storage unavailable');
  }
}

// Supabase helpers
async function readSupabaseData(resource) {
  const table = resource; // matches frontend
  const { data, error } = await supabase.from(table).select('*').order('created_at');
  if (error) throw error;
  return data || [];
}

async function writeSupabaseData(resource, operation, payload) {
  const table = resource;
  try {
    if (operation === 'POST') {
      const { data, error } = await supabase.from(table).insert(payload).select();
      if (error) throw error;
      return data[0];
    } else if (operation === 'PUT') {
      const { id, ...updates } = payload;
      const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
      if (error) throw error;
      return data[0];
    } else if (operation === 'DELETE') {
      const { error } = await supabase.from(table).delete().eq('id', payload);
      if (error) throw error;
      return { ok: true };
    }
  } catch (err) {
    console.error(`Supabase ${operation} failed:`, err);
    throw err;
  }
}

// Unified API (Supabase primary, file fallback for GET)
export async function readData(resource) {
  if (!VALID_RESOURCES.has(resource)) {
    throw new Error(`Invalid resource: ${resource}`);
  }

  if (hasSupabase) {
    try {
      return await readSupabaseData(resource);
    } catch {
      console.warn(`Supabase fallback to file: ${resource}`);
    }
  }
  return await readFileData(resource);
}

export async function writeData(resource, operation, payload) {
  if (!VALID_RESOURCES.has(resource)) {
    throw new Error(`Invalid resource: ${resource}`);
  }

  if (hasSupabase) {
    try {
      return await writeSupabaseData(resource, operation, payload);
    } catch {
      console.warn(`Supabase write failed, file fallback: ${resource}`);
    }
  }
  return await writeFileData(resource, operation, payload);
}
