const { ipcMain } = require('electron');
const testDataService = require('./services/testDataService');

function setupTestDataHandlers() {
    ipcMain.handle('get-test-data', (event, options) => {
        return testDataService.getTestData(options);
    });

    ipcMain.handle('get-review-data', (event, options) => {
        return testDataService.getReviewData(options);
    });

    ipcMain.handle('set-review-data', (event, data) => {
        testDataService.setReviewData(data);
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