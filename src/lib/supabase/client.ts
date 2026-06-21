import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is required. Set it in your .env file.');
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Lazy proxy for backward compatibility
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
