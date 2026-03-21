import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_c2AMgk9az3ZMhYjTQ7Zqag_IHXBSLAI';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
