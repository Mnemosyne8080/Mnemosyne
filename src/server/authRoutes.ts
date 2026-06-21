import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase/server';

const router = Router();

const COOKIE_OPTIONS: any = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// GET /api/auth/login?provider=github|google
router.get('/login', async (req: Request, res: Response) => {
  const provider = req.query.provider as string;
  if (!['github', 'google'].includes(provider)) {
    return res.status(400).json({ error: 'Unsupported provider' });
  }
  const redirectTo = `${process.env.APP_URL || ''}/api/auth/callback`;
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider: provider as 'github' | 'google',
    options: { redirectTo },
  });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.redirect(data.url);
});

// GET /api/auth/callback
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }
  const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.cookie('access_token', data.session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
  res.cookie('refresh_token', data.session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30 * 1000,
  });
  res.redirect(process.env.APP_URL || '/');
});

// GET /api/auth/session
router.get('/session', async (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.json({ user: null });
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return res.json({ user: null });
  }
  res.json({ user });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  res.json({ success: true });
});

// GET /api/auth/user
router.get('/user', async (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });
  res.json({ user });
});

export default router;
