import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure we only create one instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // This must be TRUE to keep you logged in
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});