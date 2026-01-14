/**
 * Lightweight session manager for the Electron main process.
 *
 * Exposes `setSession` and `getSession` to store an in-memory auth/session
 * object (for example, a Supabase session). This intentionally keeps
 * session state transient and process-local.
 */

let currentSession = null;

function setSession(session) {
    console.log('Setting session with token:', session?.access_token ?
        `${session.access_token.substring(0, 10)}...` : 'No token');

    // Store the complete session object in-memory for later retrieval
    currentSession = session;
    return true;
}

function getSession() {
    // Return the current in-memory session (or null)
    return currentSession;
}

module.exports = {
    setSession,
    getSession
};