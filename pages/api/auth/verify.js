import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({ valid: false, error: 'Server misconfiguration' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid/expired token' });
  }
}
