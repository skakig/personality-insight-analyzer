import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://caebnpbdprrptogirxky.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZWJucGJkcHJycHRvZ2lyeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NzQwNDgsImV4cCI6MjAyNDU1MDA0OH0.SYodfJ0VLvRhHMcbxw4GlXEYjpevUqQzLnqcFvr4_KY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check the client configuration.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});