
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZWJucGJkcHJycHRvZ2lyeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTcyODgsImV4cCI6MjA1MzQ5MzI4OH0.UWMAEN_06Ne2dAFDOS543B1C8K98GxCb0mQfFbWm7p8';

if (!supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    error: 'Anonymous key not found',
    url: supabaseUrl
  });
  throw new Error('Supabase configuration error: Anonymous key not available');
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
