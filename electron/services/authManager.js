let currentSession = null;

function setSession(session) {
    console.log('Setting session with token:', session?.access_token ?
        `${session.access_token.substring(0, 10)}...` : 'No token');

    // Store the complete session object
    currentSession = session;
    return true;
}

function getSession() {
    return currentSession;
}

module.exports = {
    setSession,
    getSession
};