const {BrowserWindow, ipcMain} = require("electron");

const {noble} = require("../deviceDiscovery");
const connectionStore = require("../../services/connectionStore");
const timeManager = require("../../services/timeManager");
const bleServices = require('./services/bleServices')

function setupBleHandler() {
    ipcMain.handle('begin-reading-data', async () => {
        noble.stopScanning();

        // If resuming from pause
        if (timeManager.isPaused()) {
            timeManager.setIsPaused(false);
            // Adjust the start time to account for the pause duration
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
            await bleServices.findCharacteristics(true, conn1);
        }

        if (conn2 !== null) {
            await bleServices.findCharacteristics(true, conn2);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('begin-reading', { startTime: timeManager.getRecordingStartTime() });
        });

        return { success: true, startTime: timeManager.getRecordingStartTime() };
    });

    ipcMain.handle('stop-reading-data', async () => {
        timeManager.setIsRecording(false);
        timeManager.setIsPaused(true);

        // Calculate how much time has elapsed up to this pause
        if (timeManager.getRecordingStartTime()) {
            timeManager.setPausedElapsedTime(Date.now() - timeManager.getRecordingStartTime());
        }

        const conn1 = connectionStore.getConnectionOne();
        const conn2 = connectionStore.getConnectionTwo();

        if (conn1 !== null) {
            await bleServices.findCharacteristics(false, conn1);
        }
        if (conn2 !== null) {
            await bleServices.findCharacteristics(false, conn2);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('stop-reading', { elapsedTime: timeManager.getPausedElapsedTime() });
        });

        return { success: true, elapsedTime: timeManager.getPausedElapsedTime() };
    });

    ipcMain.handle('check-connection-status', async () => {
        return bleServices.checkConnectionStatus();
    })

    ipcMain.handle('setup-disconnection-listeners', () => {
        bleServices.setupDisconnectionListeners();
    })
}

module.exports = {
    setupBleHandler
}