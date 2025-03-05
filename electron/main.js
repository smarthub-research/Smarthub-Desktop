const path = require('path');
const { app, BrowserWindow } = require('electron');
require('./ipcHandlers')

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Smarthub Recorder',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadURL('http://localhost:3001');
}

app.whenReady().then(() => {
    createMainWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})
