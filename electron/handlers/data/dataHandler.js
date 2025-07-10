const { ipcMain } = require('electron');
const recordingHandler = require('./recordingHandler');
const testDataHandler = require('./testDataHandler');
const exportHandler = require('./exportHandler');
const flagHandlers = require('../flagHandlers');
const bleHandler = require('./bleHandler');
const supabaseHandlers = require("./supabaseHandler");

function setupDataHandlers() {
    flagHandlers.setupFlagHandlers();

    // Set up all handlers
    bleHandler.setupBleHandler();
    recordingHandler.setupRecordingHandlers();
    testDataHandler.setupTestDataHandlers();
    exportHandler.setupExportHandlers();
    supabaseHandlers.setupSupabaseHandlers();

    return {
        // Export any methods that need to be accessible elsewhere
        getTestData: testDataHandler.getTestData,
        getReviewData: testDataHandler.getReviewData
    };
}

module.exports = {
    setupDataHandlers
};