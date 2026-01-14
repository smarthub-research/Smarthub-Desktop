/**
 * Test data IPC handlers.
 *
 * Handlers for retrieving and setting test data and review data. Delegates
 * data operations to `testDataService`.
 */

const { ipcMain } = require('electron');
const testDataService = require('../services/testDataService');

function testDataHandlers() {
    // Retrieve a test's data with optional filters/options
    ipcMain.handle('get-test-data', (_, options) => {
        return testDataService.getTestData(options);
    });

    // Save/replace test data payload
    ipcMain.handle('set-test-data', (_, data) => {
        testDataService.setTestData(data)
    });

    // Retrieve data prepared for review UI
    ipcMain.handle('get-review-data', (_, options) => {
        return testDataService.getReviewData(options);
    });

    // Save review edits
    ipcMain.handle('set-review-data', (_, data) => {
        testDataService.setReviewData(data);
    })

    // Clear any cached review data
    ipcMain.handle('clear-review-data', async () => {
        testDataService.clearReviewData();
    })
}

// Export setup function used by the central handler initializer
module.exports = {
    testDataHandlers
};