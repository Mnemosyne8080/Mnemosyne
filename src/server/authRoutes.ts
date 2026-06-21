import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase/server';

const router = Router();

const BASE_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

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

// POST /api/auth/signup — { email, password }
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: BASE_URL,
    },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // If email confirmation is disabled, sign them in immediately
  if (data.session) {
    res.cookie('access_token', data.session.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    res.cookie('refresh_token', data.session.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });
    return res.json({ user: data.user, needsConfirmation: false });
  }
  return res.json({ user: data.user, needsConfirmation: true });
});

// POST /api/auth/login — { email, password }
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  res.cookie('access_token', data.session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
  res.cookie('refresh_token', data.session.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30 * 1000,
  });
  res.json({ user: data.user });
});

// POST /api/auth/magic-link — { email }
router.post('/magic-link', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const { error } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: BASE_URL },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ success: true });
});

// GET /api/auth/callback — handles magic link / email confirmation redirects
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (code) {
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      res.cookie('access_token', data.session.access_token, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
      res.cookie('refresh_token', data.session.refresh_token, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30 * 1000,
      });
    }
  }
  res.redirect(BASE_URL || '/');
});

// GET /api/auth/session
router.get('/session', async (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return tryRefreshOrReturnNull(req, res);
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return tryRefreshOrReturnNull(req, res);
  }
  res.json({ user });
});

async function tryRefreshOrReturnNull(req: Request, res: Response) {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.json({ user: null });
  }
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      res.cookie('access_token', data.session.access_token, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
      if (data.session.refresh_token) {
        res.cookie('refresh_token', data.session.refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 60 * 60 * 24 * 30 * 1000,
        });
      }
      return res.json({ user: data.session.user });
    }
  } catch {
    // fall through
  }
  res.json({ user: null });
}

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('access_token', clearCookieOptions);
  res.clearCookie('refresh_token', clearCookieOptions);
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
