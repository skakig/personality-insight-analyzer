import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for environment variable
console.log('Environment check:', {
  hasAnonKey: !!supabaseAnonKey,
  envKeys: Object.keys(import.meta.env)
});

if (!supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    error: 'Anonymous key not found in environment variables',
    availableKeys: Object.keys(import.meta.env),
    url: supabaseUrl
  });
  throw new Error('Supabase configuration error: Anonymous key not available');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Add some debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', {
    event,
    userEmail: session?.user?.email,
    timestamp: new Date().toISOString()
  });
});