import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Secure login endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  
  // Env var safety check
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // Brute force protection: 1s delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validate credentials
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({ 
    token,
    message: 'Login successful',
    expiresIn: 24 * 60 * 60 // seconds
  });
}
