// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbyzubwrzddlmucettjf.supabase.co';
const supabaseKey = 'sb_publishable_c2AMgk9az3ZMhYjTQ7Zqag_IHXBSLAI'; // publishable key from your screenshot

export const supabase = createClient(supabaseUrl, supabaseKey);