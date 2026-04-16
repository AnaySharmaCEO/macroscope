import { createClient } from '@supabase/supabase-js';

const env =
  typeof process !== 'undefined' && process.env
    ? process.env
    : ({} as Record<string, string | undefined>);

const supabaseUrl =
  env.EXPO_PUBLIC_SUPABASE_URL ||
  env.VITE_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (for Expo), or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (for Vite).'
  );
}

export let supabase = createClient(supabaseUrl, supabaseAnonKey);

export const setSupabaseClient = (client: any) => {
  supabase = client;
};
