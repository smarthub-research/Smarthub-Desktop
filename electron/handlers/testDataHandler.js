const { ipcMain } = require('electron');
const testDataService = require('../services/testDataService');

// options = filter

function setupTestDataHandlers() {
    ipcMain.handle('get-test-data', (event, options) => {
        return testDataService.getTestData(options);
    });

    ipcMain.handle('set-test-data', (event, data) => {
        testDataService.setTestData(data)
    });

    ipcMain.handle('get-review-data', (event, options) => {
        return testDataService.getReviewData(options);
    });

    ipcMain.handle('set-review-data', (event, data) => {
        testDataService.setReviewData(data);
    })

    ipcMain.handle('clear-review-data', async () => {
        testDataService.clearReviewData();
    })

    ipcMain.handle('calculate-metrics', (event, data) => {
        return testDataService.calculateMetrics(data);
    });
}

// Export setup function and any methods needed by dataHandler.js
module.exports = {
    setupTestDataHandlers,
    getTestData: (options) => testDataService.getTestData(options),
    getReviewData: (options) => testDataService.getReviewData(options)
};