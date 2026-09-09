import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  // @ts-ignore
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  // @ts-ignore
  (typeof import.meta !== 'undefined' && import.meta.env?.EXPO_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  // @ts-ignore
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  // @ts-ignore
  (typeof import.meta !== 'undefined' && import.meta.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
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
