/**
 * Recording control IPC handlers.
 *
 * Exposes controls to restart/pause/end recordings and to query the
 * current recording state. The actions delegate to `recordingService`.
 */

const { ipcMain } = require('electron');
const recordingService = require('../services/recordingService');

function recordingHandlers() {
    // Restart recording: clear buffers and restart timers
    ipcMain.handle('restart-recording', async () => {
        return await recordingService.restartRecording();
    });

    // Return a small object representing the current recording state
    ipcMain.handle('get-recording-state', () => {
        return recordingService.getRecordingState();
    });

    // Pause the recording (stops accumulation but preserves state)
    ipcMain.handle('pause-recording', () => {
        recordingService.pauseRecording();
    });

    // End the current test: finalize buffers and trigger any upload/save
    ipcMain.handle('end-test', () => {
        recordingService.endTest();
    });
}

module.exports = {
    recordingHandlers
};