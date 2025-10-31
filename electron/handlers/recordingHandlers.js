const { ipcMain } = require('electron');
const recordingService = require('../services/recordingService');

function recordingHandlers() {
    // Clear kafka buffers and restart the timer
    ipcMain.handle('restart-recording', async () => {
        return await recordingService.restartRecording();
    });

    // not sure what this does
    ipcMain.handle('get-recording-state', () => {
        return recordingService.getRecordingState();
    });

    // Pause the recording
    ipcMain.handle('pause-recording', () => {
        recordingService.pauseRecording();
    });

    // needs to tell kafka to stop all recording and send back the current buffer for analyzing.
    // Keep the buffer in the cloud tho because we can write it to the db a little quicker since its already there
    ipcMain.handle('end-test', () => {
        recordingService.endTest();
    });
}

module.exports = {
    recordingHandlers
};