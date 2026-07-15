// api/check.js — License verification endpoint
// Deploy to Vercel as serverless function

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const API_SECRET = process.env.ROBLOX_API_SECRET;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate API secret key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_SECRET) {
    return res.status(401).json({ allowed: false, reason: 'Unauthorized' });
  }

  const { userId, username, placeId, jobId, timestamp, version } = req.body;

  // Basic input validation
  if (!userId || !username || !placeId || !jobId) {
    return res.status(400).json({ allowed: false, reason: 'Missing required fields' });
  }

  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    return res.status(400).json({ allowed: false, reason: 'Invalid userId' });
  }

  let allowed = false;
  let reason = 'Not whitelisted';
  let licenseKey = null;

  try {
    // Look up license by userId
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userIdInt)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('DB error:', error);
      return res.status(500).json({ allowed: false, reason: 'Server error' });
    }

    if (license) {
      licenseKey = license.license_key;
      if (license.status === 'active') {
        allowed = true;
        reason = 'License valid';
      } else if (license.status === 'suspended') {
        reason = 'License suspended';
      } else if (license.status === 'revoked') {
        reason = 'License revoked';
      }
    }

    // Fetch welcome message from settings
    const { data: settingRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'welcome_message')
      .single();

    const welcomeMessage = settingRow?.value ?? 'Welcome aboard!';

    // Log the check
    await supabase.from('logs').insert({
      user_id: userIdInt,
      username,
      place_id: placeId,
      job_id: jobId,
      timestamp: timestamp || new Date().toISOString(),
      version: version || 'unknown',
      allowed,
      reason,
    });

    return res.status(200).json({
      allowed,
      reason,
      welcomeMessage: allowed ? welcomeMessage : null,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ allowed: false, reason: 'Server error' });
  }
}
