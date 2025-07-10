const { ipcMain } = require('electron');
const supabaseHandlers = require("./services/supabaseService");
const {setSession} = require("../../services/authManager");

function setupSupabaseHandlers() {
    ipcMain.handle('submit-test-data', (event, metadata) => {
        return supabaseHandlers.submitTestData(metadata);
    });

    ipcMain.handle('fetch-test-files',  async () => {
        return await supabaseHandlers.fetchTestFiles();
    })

    ipcMain.handle('fetch-test-files-amount', async (event, numberOfTests) => {
        return await supabaseHandlers.fetchTestFiles(numberOfTests);
    })

    ipcMain.handle('fetch-announcements', async () => {
        return await supabaseHandlers.fetchAnnouncements();
    })

    ipcMain.handle('update-test-name', async (event, id, testName) => {
        return await supabaseHandlers.updateTestName(id, testName);
    })

    ipcMain.handle('set-auth-session', (event, session) => {
        setSession(session)
        return true;
    })
}

module.exports = {
    setupSupabaseHandlers,
}