const { ipcMain } = require('electron');
const testDataService = require('../services/testDataService');

function testDataHandlers() {
    ipcMain.handle('get-test-data', (_, options) => {
        return testDataService.getTestData(options);
    });

    ipcMain.handle('set-test-data', (_, data) => {
        testDataService.setTestData(data)
    });

    ipcMain.handle('get-review-data', (_, options) => {
        return testDataService.getReviewData(options);
    });

    ipcMain.handle('set-review-data', (_, data) => {
        testDataService.setReviewData(data);
    })

    ipcMain.handle('clear-review-data', async () => {
        testDataService.clearReviewData();
    })
}

// Export setup function and any methods needed by dataHandler.js
module.exports = {
    testDataHandlers
};