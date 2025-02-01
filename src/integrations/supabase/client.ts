import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Ensure the URL is always available
const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';

// Get the anon key directly from the project configuration
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