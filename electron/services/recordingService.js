/**
 * Recording lifecycle controller.
 *
 * Coordinates recording state via `timeManager`, notifies renderer windows,
 * and emits recording lifecycle events to the backend through Kafka.
 */

const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require('../utils/timeManager');
const dataBuffer = require("../utils/dataBuffer")
const KafkaService = require('./kafkaService');

class RecordingService {
    // Reset the local recording buffers and notify windows
    async restartRecording() {
        timeManager.reset();
        dataBuffer.clearAllBuffers();
        // Do not clear backend's preserved fullTestData
        KafkaService.sendEvent('restart-recording')
        this.notifyAllWindows('restart-recording', { startTime: null });
        return { success: true, startTime: null };
    }

    // Return a small status object for UI
    getRecordingState() {
        return {
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime(),
            elapsedTime: timeManager.getPausedElapsedTime(),
        };
    }

    // Begin recording and notify backend/renderer
    startRecording() {
        timeManager.beginRecording()
        KafkaService.sendEvent('start-recording')
        this.notifyAllWindows('start-recording')
    }

    // Pause recording and notify
    pauseRecording() {
        timeManager.stopRecording();
        KafkaService.sendEvent('pause-recording')
        this.notifyAllWindows('pause-recording')
    }

    // End the test and notify listeners
    endTest() {
        timeManager.stopRecording();
        KafkaService.sendEvent('end-test')
        this.notifyAllWindows('test-ended');
    }

    // Helper to broadcast IPC messages to all renderer windows
    notifyAllWindows(channel, payload = {}) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(channel, payload);
        });
    }
}

module.exports = new RecordingService();