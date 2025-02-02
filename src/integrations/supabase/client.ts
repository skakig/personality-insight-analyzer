import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced debug logging
if (!supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    error: 'Anonymous key not found in environment variables',
    availableKeys: Object.keys(import.meta.env),
    envValue: import.meta.env.VITE_SUPABASE_ANON_KEY,
    url: supabaseUrl
  });
  throw new Error('Supabase anonymous key is required. Please check your environment variables.');
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Add debug logging for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', {
    event,
    userEmail: session?.user?.email,
    timestamp: new Date().toISOString()
  });
});