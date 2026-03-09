import { promises as fs } from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'gallery', 'media');

function sanitizeFileName(name = '') {
  const base = String(name).trim().toLowerCase();
  return base.replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
}

function extensionFromMime(mime = '') {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  return '';
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { fileName, mimeType, base64 } = req.body || {};
      if (!base64 || !mimeType || !mimeType.startsWith('image/')) {
        return res.status(400).json({ error: 'Invalid image payload.' });
      }

      await fs.mkdir(uploadDir, { recursive: true });

      const providedName = sanitizeFileName(fileName || 'upload');
      const providedExt = path.extname(providedName);
      const ext = providedExt || extensionFromMime(mimeType) || '.jpg';
      const stem = path.basename(providedName, providedExt || undefined) || 'upload';
      const finalName = `${Date.now()}-${stem}${ext}`;
      const absPath = path.join(uploadDir, finalName);

      const binary = Buffer.from(base64, 'base64');
      await fs.writeFile(absPath, binary);

      return res.status(201).json({
        ok: true,
        src: `/gallery/media/${finalName}`
      });
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const src = String(req.query.src || '');
      const normalized = src.replace(/\\/g, '/');
      if (!normalized.includes('/gallery/media/')) {
        return res.status(200).json({ ok: true });
      }
      const relativeName = path.basename(normalized);
      if (!relativeName) return res.status(200).json({ ok: true });
      await fs.unlink(path.join(uploadDir, relativeName)).catch(() => null);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) });
    }
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
