import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Make sure to use the exact URL from your Supabase project settings
const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';

// Use the anon/public key directly here since it's safe to expose in client-side code
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZWJucGJkcHJycHRvZ2lyeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MjY4NjAsImV4cCI6MjAyMjQwMjg2MH0.SSUKx5tz0FqMBcDRQzFkYh4C4Nt8lQJR7ph4G8M-9P4';

if (!supabaseAnonKey) {
  console.error('Supabase anonymous key is not available');
  throw new Error('Supabase configuration error');
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
  console.log('Auth state changed:', event, session?.user?.email);
});