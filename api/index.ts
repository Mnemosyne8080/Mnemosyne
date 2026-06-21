// Vercel serverless function — handles all /api/* routes
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Inline Supabase admin client to avoid import chain issues
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BASE_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const COOKIE_OPTIONS: any = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const clearCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

async function tryRefreshOrReturnNull(req: any, res: any) {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken || !supabaseAdmin) return res.json({ user: null });
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      res.cookie('access_token', data.session.access_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 * 1000 });
      if (data.session.refresh_token) {
        res.cookie('refresh_token', data.session.refresh_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 * 1000 });
      }
      return res.json({ user: data.session.user });
    }
  } catch { /* fall through */ }
  res.json({ user: null });
}

async function authMiddleware(req: any, res: any, next: any) {
  const token = req.cookies?.access_token;
  if (token && supabaseAdmin) {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) { req.user = user; return next(); }
  }
  // Try refresh
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        res.cookie('access_token', data.session.access_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 * 1000 });
        if (data.session.refresh_token) {
          res.cookie('refresh_token', data.session.refresh_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 * 1000 });
        }
        req.user = data.session.user;
        return next();
      }
    } catch { /* fall through */ }
  }
  return res.status(401).json({ error: 'Unauthenticated' });
}

const app = express();
app.use(express.json());
app.use(cookieParser());

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─── Auth: POST /api/auth/signup ──────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const { data, error } = await supabaseAdmin.auth.signUp({ email, password, options: { emailRedirectTo: BASE_URL } });
  if (error) return res.status(400).json({ error: error.message });
  if (data.session) {
    res.cookie('access_token', data.session.access_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 * 1000 });
    res.cookie('refresh_token', data.session.refresh_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 * 1000 });
    return res.json({ user: data.user, needsConfirmation: false });
  }
  res.json({ user: data.user, needsConfirmation: true });
});

// ─── Auth: POST /api/auth/login ───────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.cookie('access_token', data.session.access_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 * 1000 });
  res.cookie('refresh_token', data.session.refresh_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 * 1000 });
  res.json({ user: data.user });
});

// ─── Auth: POST /api/auth/magic-link ──────────────────────────────────────
app.post('/api/auth/magic-link', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const { error } = await supabaseAdmin.auth.signInWithOtp({ email, options: { emailRedirectTo: BASE_URL } });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ─── Auth: GET /api/auth/callback ─────────────────────────────────────────
app.get('/api/auth/callback', async (req, res) => {
  if (!supabaseAdmin) return res.redirect(BASE_URL);
  const code = req.query.code as string;
  if (code) {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      res.cookie('access_token', data.session.access_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 * 1000 });
      res.cookie('refresh_token', data.session.refresh_token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 * 1000 });
    }
  }
  res.redirect(BASE_URL);
});

// ─── Auth: GET /api/auth/session ──────────────────────────────────────────
app.get('/api/auth/session', async (req, res) => {
  if (!supabaseAdmin) return res.json({ user: null });
  const token = req.cookies?.access_token;
  if (!token) return tryRefreshOrReturnNull(req, res);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return tryRefreshOrReturnNull(req, res);
  res.json({ user });
});

// ─── Auth: POST /api/auth/logout ──────────────────────────────────────────
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('access_token', clearCookieOptions);
  res.clearCookie('refresh_token', clearCookieOptions);
  res.json({ success: true });
});

// ─── Auth: GET /api/auth/user ─────────────────────────────────────────────
app.get('/api/auth/user', async (req, res) => {
  if (!supabaseAdmin) return res.status(401).json({ error: 'Unauthenticated' });
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });
  res.json({ user });
});

// ─── Chat: POST /api/chat (protected) ──────────────────────────────────────
app.post('/api/chat', authMiddleware, async (req, res) => {
  // Dynamic import to avoid bundling OpenAI in the function init
  try {
    const { default: OpenAI } = await import('openai');
    const { messages, baseUrl, model, apiKey, currentPlan } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'Messages required' });
    if (!apiKey) return res.status(400).json({ error: 'API Key required' });
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const sendEvent = (event: string, data: any) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const openai = new OpenAI({ apiKey, baseURL: baseUrl || 'https://api.openai.com/v1' });
    const { executeAgents } = await import('../src/server/agents/index.ts');
    await executeAgents({ openai, model: model || 'gpt-4o', messages, sendEvent, plan: currentPlan });
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message || 'An error occurred' })}\n\n`);
    res.end();
  }
});

// ─── Workflows (protected) ─────────────────────────────────────────────────
app.get('/api/workflows', authMiddleware, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin.from('workflows').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (error) throw error;
    res.json({ workflows: data || [] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/workflows', authMiddleware, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin.from('workflows').insert({ user_id: userId, config: req.body.config || {} }).select().single();
    if (error) throw error;
    res.json({ workflow: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/workflows/:id', authMiddleware, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const { data, error } = await supabaseAdmin.from('workflows').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ workflow: data });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/workflows/:id', authMiddleware, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase not configured' });
  try { await supabaseAdmin.from('workflows').delete().eq('id', req.params.id); res.json({ success: true }); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default app;
