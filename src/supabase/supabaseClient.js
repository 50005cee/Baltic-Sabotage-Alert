// src/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Create a mock Supabase client if environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Create a mock Supabase client with dummy auth methods if env vars are missing
const createMockClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      user: () => null
    }
  };
};

// Use real Supabase client if env vars exist, otherwise use mock
export const supabase = (supabaseUrl !== 'https://example.supabase.co') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();