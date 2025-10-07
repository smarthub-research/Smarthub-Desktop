const recordingHandler = require('./recordingHandler');
const testDataHandler = require('./testDataHandler');
const exportHandlers = require('./exportHandlers');
const bleHandler = require('./bleHandler');
const supabaseHandlers = require("./supabaseHandler");

function setupDataHandlers() {

    // Set up all handlers
    bleHandler.setupBleHandler();
    recordingHandler.setupRecordingHandlers();
    testDataHandler.setupTestDataHandlers();
    exportHandlers.exportHandlers();
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