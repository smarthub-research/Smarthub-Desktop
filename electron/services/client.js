const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { getSession } = require('./authManager');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// electron/services/client.js
async function getSupabaseWithAuth() {
    const session = getSession();

    if (session && session.access_token) {
        try {
            // Create a NEW client with the auth headers already set
            // This is more reliable than setSession
            const authedSupabase = createClient(
                supabaseUrl,
                supabaseKey,
                {
                    global: {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    },
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            );

            return authedSupabase;
        } catch (e) {
            console.error('Exception creating authenticated client:', e);
        }
    }

    // Return regular client if no session
    return supabase;
}

module.exports = {
    getSupabaseWithAuth
}