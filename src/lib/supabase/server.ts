import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required. Set it in your .env file.');
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

// Lazy proxy for backward compatibility — delegates to getSupabaseAdmin()
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
