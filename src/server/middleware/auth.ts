import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../lib/supabase/server';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (token) {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      (req as any).user = user;
      return next();
    }
  }

  // Try refresh token
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    try {
      const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        // Set new cookies
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', data.session.access_token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProd,
          path: '/',
          maxAge: 60 * 60 * 24 * 7 * 1000,
        });
        if (data.session.refresh_token) {
          res.cookie('refresh_token', data.session.refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd,
            path: '/',
            maxAge: 60 * 60 * 24 * 30 * 1000,
          });
        }
        (req as any).user = data.session.user;
        return next();
      }
    } catch {
      // fall through
    }
  }

  return res.status(401).json({ error: 'Unauthenticated' });
}
