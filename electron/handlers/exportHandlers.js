const { ipcMain, dialog } = require('electron');
const exportService = require('../services/exportService');

function exportHandlers() {
    ipcMain.handle('export-to-csv', async (event) => {
        return await exportService.exportToCsv();
    });
}

module.exports = {
    exportHandlers
};