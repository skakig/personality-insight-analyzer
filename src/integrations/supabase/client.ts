import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Ensure the URL is always available
const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';

// Get the anon key from environment
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
  throw new Error('Supabase anonymous key is missing. Please check your environment configuration.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});