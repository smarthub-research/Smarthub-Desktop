const { ipcMain } = require('electron');
const bleServices = require('./services/bleServices');

function setupBleHandlers() {
    // These handlers should be moved from oldDataHandler to here
    // They're already properly calling into service functions

    ipcMain.handle('begin-reading-data', async () => {
        return await bleServices.startBleReading();
    });

    ipcMain.handle('stop-reading-data', async () => {
        return await bleServices.stopBleReading();
    });
}

module.exports = {
    setupBleHandlers
};