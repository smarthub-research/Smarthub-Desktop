/**
 * Data IPC handlers.
 *
 * Exposes commands to start/stop data reading and to request full test
 * data from the backend. These handlers are thin adapters that call the
 * `dataService`, `timeManager`, and `kafkaService` as needed.
 */

const { ipcMain } = require("electron");
const dataService = require('../services/dataService')
const timeManager = require('../utils/timeManager')
const kafkaService = require('../services/kafkaService');

function dataHandlers() {
    // Start reading device data and return the recording start timestamp
    ipcMain.handle('begin-reading-data', async () => {
        await dataService.beginReadingData();
        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    // Stop reading data and return elapsed paused time
    ipcMain.handle('stop-reading-data', async () => {
        await dataService.stopReadingData();
        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    });
    
    // Request full test data from the backend (via Kafka request/response)
    ipcMain.handle('get-full-test-data', async () => {
        console.log('🔍 IPC: get-full-test-data handler called');
        const fullData = await kafkaService.requestFullTestData();
        console.log('✅ IPC: Returning full test data with', fullData?.distance?.length || 0, 'points');
        return fullData;
    });
}

module.exports = {
    dataHandlers
};