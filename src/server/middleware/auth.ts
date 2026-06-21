import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../lib/supabase/server';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ error: 'No session' });
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  (req as any).user = user;
  next();
}
