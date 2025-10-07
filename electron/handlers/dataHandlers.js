const { ipcMain } = require("electron");
const dataService = require('../services/dataService')
const timeManager = require('../utils/timeManager')

function dataHandlers() {
    ipcMain.handle('begin-reading-data', async () => {
        await dataService.beginReadingData();
        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    ipcMain.handle('stop-reading-data', async () => {
        await dataService.stopReadingData();
        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    });
}

module.exports = {
    dataHandlers
};