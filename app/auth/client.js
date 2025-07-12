/**
 * This file creates a supabase client using the necessary key and url
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://meebiiezbbboxzknbcyj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);