const { ipcMain } = require('electron');
const BrowserWindow = require('electron').BrowserWindow;
const timeManager = require('../services/timeManager');

let flags = [];
let isInitialized = false;

function setupFlagHandlers() {
    // Prevent double initialization
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    ipcMain.handle('add-flag', (event, { flag }) => {
        // Prevent duplicate flags
        if (!flags.some(f => f.id === flag.id)) {
            const startTime = timeManager.getRecordingStartTime();
            flag.timeStamp = startTime ? Date.now() - startTime : null;
            flags.push(flag);

            // Broadcast the new flag to all windows
            BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send('new-flag', flag);
            });
        }
        return { success: true };
    });

    ipcMain.handle('clear-flags', () => {
        flags = [];
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('clear-flags');
        });
        return { success: true };
    });

    ipcMain.handle('get-flags', () => {
        return {
            flags: flags,
            elapsedTime: timeManager.getPausedElapsedTime(),
            isRecording: timeManager.isRecording(),
            isPaused: timeManager.isPaused(),
            startTime: timeManager.getRecordingStartTime()
        };
    });
}

function getFlags() {
    return flags;
}

function clearFlags() {
    flags = [];
}

module.exports = {
    setupFlagHandlers,
    getFlags,
    clearFlags
};