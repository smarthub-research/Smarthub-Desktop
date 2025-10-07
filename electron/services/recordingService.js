const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require('./timeManager');
const dataBuffer = require("./dataBufferService")

class RecordingService {

    async restartRecording() {
        timeManager.setRecordingStartTime(timeManager.isRecording() ? Date.now() : null);
        timeManager.setPausedElapsedTime(0);
        timeManager.setIsPaused(false);
        dataBuffer.clearAllBuffers();

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