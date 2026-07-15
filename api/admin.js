// api/admin.js — Admin panel backend
// Handles: licenses CRUD, logs read, settings read/write
// Protected by ADMIN_SECRET header

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function authGuard(req, res) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

function generateLicenseKey() {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!authGuard(req, res)) return;

  const { action } = req.query;

  try {
    // ─── DASHBOARD ───────────────────────────────────────────────
    if (action === 'dashboard') {
      const [{ count: totalLicenses }, { count: totalLogs }, { data: recentLogs }] =
        await Promise.all([
          supabase.from('licenses').select('*', { count: 'exact', head: true }),
          supabase.from('logs').select('*', { count: 'exact', head: true }),
          supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(10),
        ]);

      const { count: activeLicenses } = await supabase
        .from('licenses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return res.status(200).json({ totalLicenses, activeLicenses, totalLogs, recentLogs });
    }

    // ─── LICENSES ────────────────────────────────────────────────
    if (action === 'licenses') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (req.method === 'POST') {
        // Add new license
        const { userId, username } = req.body;
        if (!userId || !username) return res.status(400).json({ error: 'userId and username required' });

        const userIdInt = parseInt(userId, 10);
        const licenseKey = generateLicenseKey();

        const { data, error } = await supabase.from('licenses').insert({
          user_id: userIdInt,
          username,
          license_key: licenseKey,
          status: 'active',
        }).select().single();

        if (error) throw error;
        return res.status(201).json(data);
      }

      if (req.method === 'PUT') {
        // Update license status
        const { id, status } = req.body;
        if (!id || !['active', 'suspended', 'revoked'].includes(status)) {
          return res.status(400).json({ error: 'id and valid status required' });
        }

        const { data, error } = await supabase
          .from('licenses')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'id required' });

        const { error } = await supabase.from('licenses').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
    }

    // ─── LOGS ────────────────────────────────────────────────────
    if (action === 'logs') {
      const page = parseInt(req.query.page || '1', 10);
      const limit = 50;
      const from = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      if (error) throw error;
      return res.status(200).json({ logs: data, total: count, page, limit });
    }

    // ─── SETTINGS ────────────────────────────────────────────────
    if (action === 'settings') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        const settings = Object.fromEntries(data.map(r => [r.key, r.value]));
        return res.status(200).json(settings);
      }

      if (req.method === 'PUT') {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ error: 'key required' });

        const { data, error } = await supabase
          .from('settings')
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    return res.status(404).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
