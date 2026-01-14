/**
 * Supabase client helper for Electron main process.
 *
 * Exposes `getSupabaseWithAuth` which will return a Supabase client
 * instance configured with the current session's access token when
 * available. This creates a short-lived client with auth headers set to
 * avoid global side-effects in the shared `supabase` instance.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { getSession } = require('./authManager');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Return a client pre-configured with Authorization header when a session exists
async function getSupabaseWithAuth() {
    const session = getSession();

    if (session && session.access_token) {
        try {
            // Create a NEW client with the auth headers already set. This avoids
            // mutating the shared client and ensures requests carry the user's token.
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