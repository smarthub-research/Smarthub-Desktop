const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../../../services/connectionStore');
const timeManager = require('../../../services/timeManager');
const bleService = require('./bleServices');
const flagHandlers = require('../../flagHandlers');

class RecordingService {

    async restartRecording() {
        timeManager.setRecordingStartTime(timeManager.isRecording() ? Date.now() : null);
        timeManager.setPausedElapsedTime(0);
        timeManager.setIsPaused(false);
        flagHandlers.clearFlags();

        this.notifyAllWindows('restart-recording', { startTime: timeManager.getRecordingStartTime() });

        return { success: true, startTime: timeManager.getRecordingStartTime() };
    }

    getRecordingState() {
        return {
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime(),
            elapsedTime: timeManager.getPausedElapsedTime(),
        };
    }

    endTest() {
        this.notifyAllWindows('test-ended');
    }

    notifyAllWindows(channel, payload = {}) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(channel, payload);
        });
    }
}

module.exports = new RecordingService();