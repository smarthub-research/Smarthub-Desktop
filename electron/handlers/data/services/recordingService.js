const BrowserWindow = require('electron').BrowserWindow;
const connectionStore = require('../../../services/connectionStore');
const timeManager = require('../../../services/timeManager');
const bleHandler = require('../bleHandler');
const bleService = require('./bleServices');
const flagHandlers = require('../../flagHandlers');

class RecordingService {
    async startRecording() {
        // If resuming from pause
        if (timeManager.isPaused()) {
            timeManager.setIsPaused(false);
            timeManager.setRecordingStartTime(Date.now() - timeManager.getPausedElapsedTime());
        } else {
            // Fresh start
            timeManager.setRecordingStartTime(Date.now());
            timeManager.setPausedElapsedTime(0);
        }

        timeManager.setIsRecording(true);

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await bleService.findCharacteristics(true, conn1);
        }

        if (conn2 !== null) {
            await bleService.findCharacteristics(true, conn2);
        }

        this.notifyAllWindows('begin-reading', { startTime: timeManager.getRecordingStartTime() });

        return { success: true, startTime: timeManager.getRecordingStartTime() };
    }

    async stopRecording() {
        timeManager.setIsRecording(false);
        timeManager.setIsPaused(true);

        if (timeManager.getRecordingStartTime()) {
            timeManager.setPausedElapsedTime(Date.now() - timeManager.getRecordingStartTime());
        }

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await bleService.findCharacteristics(false, conn1);
        }

        if (conn2 !== null) {
            await bleService.findCharacteristics(false, conn2);
        }

        this.notifyAllWindows('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });

        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    }

    async restartRecording() {
        timeManager.setRecordingStartTime(timeManager.isRecording() ? Date.now() : null);
        timeManager.setPausedElapsedTime(0);
        timeManager.setIsPaused(false);
        flagHandlers.clearFlags();

        console.log('Restarting recording...');
        this.notifyAllWindows('restart-recording', { startTime: timeManager.getRecordingStartTime() });

        return { success: true, startTime: timeManager.getRecordingStartTime() };
    }

    getRecordingState() {
        console.log('Getting recording state...');
        return {
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime(),
            elapsedTime: timeManager.getPausedElapsedTime(),
        };
    }

    endTest() {
        console.log('Ending test...');
        this.notifyAllWindows('test-ended');
    }

    notifyAllWindows(channel, payload = {}) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(channel, payload);
        });
    }
}

module.exports = new RecordingService();