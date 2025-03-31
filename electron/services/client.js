const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://meebiiezbbboxzknbcyj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.error('SUPABASE_KEY environment variable is not set');
    throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
    supabase
}