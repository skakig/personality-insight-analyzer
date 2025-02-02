import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    error: 'Missing configuration',
    availableKeys: Object.keys(import.meta.env),
    url: supabaseUrl,
    anonKey: supabaseAnonKey ? '[HIDDEN]' : undefined
  });
  throw new Error('Supabase configuration is required. Please check your environment variables.');
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