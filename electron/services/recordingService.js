const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require('../utils/timeManager');
const dataBuffer = require("../utils/dataBuffer")
const KafkaService = require('./kafkaService');

class RecordingService {
    async restartRecording() {
        // Reset recording state without starting
        timeManager.reset();
        dataBuffer.clearAllBuffers();
        // NOTE: Do NOT clear backend's fullTestData - it should preserve all data
        // Only the frontend ring buffer should be trimmed on restart
        KafkaService.sendEvent('restart-recording')

        this.notifyAllWindows('restart-recording', { startTime: null }); // No start time since not starting

        return { success: true, startTime: null };
    }

    getRecordingState() {
        return {
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime(),
            elapsedTime: timeManager.getPausedElapsedTime(),
        };
    }

    startRecording() {
        timeManager.beginRecording()
        KafkaService.sendEvent('start-recording')
        this.notifyAllWindows('start-recording')
    }

    pauseRecording() {
        timeManager.stopRecording();
        KafkaService.sendEvent('pause-recording')
        this.notifyAllWindows('pause-recording')
    }

    endTest() {
        timeManager.stopRecording();
        KafkaService.sendEvent('end-test')
        this.notifyAllWindows('test-ended');
    }

    notifyAllWindows(channel, payload = {}) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(channel, payload);
        });
    }
}

module.exports = new RecordingService();