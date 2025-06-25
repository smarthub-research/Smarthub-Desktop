const { ipcMain } = require('electron');
const supabaseHandlers = require("./services/supabaseService");

function setupSupabaseHandlers() {
    ipcMain.handle('submit-test-data', (event, metadata) => {
        return supabaseHandlers.submitTestData(metadata, rawDataBuffer);
    });

    ipcMain.handle('fetch-test-files',  async () => {
        return await supabaseHandlers.fetchTestFiles();
    })

    ipcMain.handle('fetch-test-files-amount', async (event, numberOfTests) => {
        return await supabaseHandlers.fetchTestFiles(numberOfTests);
    })

    ipcMain.handle('update-test-name', async (event, id, testName) => {
        return await supabaseHandlers.updateTestName(id, testName);
    })
}

module.exports = {
    setupSupabaseHandlers,
}