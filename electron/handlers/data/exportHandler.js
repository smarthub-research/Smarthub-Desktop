const { ipcMain, dialog } = require('electron');
const exportService = require('./services/exportService');

function setupExportHandlers() {
    ipcMain.handle('export-to-csv', async (event, options) => {
        // If no directory specified, show dialog
        if (!options.directory) {
            const { canceled, filePaths } = await dialog.showSaveDialog({
                title: 'Export Data to CSV',
                defaultPath: `export_${new Date().toISOString().replace(/:/g, '-')}.csv`,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }]
            });

            if (canceled) return { success: false, canceled: true };

            options.directory = require('path').dirname(filePaths[0]);
            options.filename = require('path').basename(filePaths[0]);
        }

        return await exportService.exportToCsv(options);
    });

    ipcMain.handle('export-to-json', async (event, options) => {
        // If no directory specified, show dialog
        if (!options.directory) {
            const { canceled, filePaths } = await dialog.showSaveDialog({
                title: 'Export Data to JSON',
                defaultPath: `export_${new Date().toISOString().replace(/:/g, '-')}.json`,
                filters: [{ name: 'JSON Files', extensions: ['json'] }]
            });

            if (canceled) return { success: false, canceled: true };

            options.directory = require('path').dirname(filePaths[0]);
            options.filename = require('path').basename(filePaths[0]);
        }

        return await exportService.exportToJson(options);
    });
}

module.exports = {
    setupExportHandlers,
    exportToCsv: (options) => exportService.exportToCsv(options),
    exportToJson: (options) => exportService.exportToJson(options)
};