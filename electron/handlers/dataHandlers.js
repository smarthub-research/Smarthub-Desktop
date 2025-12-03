const { ipcMain } = require("electron");
const dataService = require('../services/dataService')
const timeManager = require('../utils/timeManager')
const kafkaService = require('../services/kafkaService');

function dataHandlers() {
    ipcMain.handle('begin-reading-data', async () => {
        await dataService.beginReadingData();
        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    ipcMain.handle('stop-reading-data', async () => {
        await dataService.stopReadingData();
        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    });
    
    ipcMain.handle('get-full-test-data', async () => {
        console.log('🔍 IPC: get-full-test-data handler called');
        // Request full test data from backend via Kafka
        const fullData = await kafkaService.requestFullTestData();
        console.log('✅ IPC: Returning full test data with', fullData?.distance?.length || 0, 'points');
        return fullData;
    });
}

module.exports = {
    dataHandlers
};