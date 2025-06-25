const path = require('path');
const { app, screen} = require('electron');
const {initializeAllHandlers} = require("./handlers");
const BrowserWindow = require('electron').BrowserWindow;

initializeAllHandlers();

function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        // titleBarStyle: "hiddenInset",
        title: 'Smarthub Page',
        // width: width,
        // height: height,
        width: width,
        height: height,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadURL('http://localhost:3000');
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
