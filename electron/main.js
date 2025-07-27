const path = require('path');
const { app, screen} = require('electron');
const {initializeAllHandlers} = require("./handlers");
const BrowserWindow = require('electron').BrowserWindow;

initializeAllHandlers();

function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const iconPath = path.resolve( __dirname, 'assets/icons',
        process.platform === 'darwin' ? 'icon.icns' :
            process.platform === 'win32' ? 'icon.ico' : 'icon.png');
    console.log('Icon path:', iconPath);

    const mainWindow = new BrowserWindow({
        titleBarStyle: "hiddenInset",
        title: 'Smarthub Desktop',
        width: width,
        height: height,
        backgroundColor: '#000000',
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    if (process.platform === 'darwin') {
        app.dock.setIcon(path.resolve(__dirname, 'assets/icons/icon.png'));
    }

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
