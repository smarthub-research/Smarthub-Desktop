import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://meebiiezbbboxzknbcyj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// Create a custom storage implementation using sessionStorage
const sessionStorageAdapter = {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
    removeItem: (key) => sessionStorage.removeItem(key)
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true, // Enable session persistence
        autoRefreshToken: true, // Allow token refresh
        storage: sessionStorageAdapter // Use sessionStorage instead of localStorage
    }
});