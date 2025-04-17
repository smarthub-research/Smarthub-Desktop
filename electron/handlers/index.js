const { setupDiscoveryHandlers } = require('./deviceDiscovery');
const { setupConnectionHandlers } = require('./connectionHandlers');
const { setupDataHandlers } = require('./dataHandlers');
const {setupFlagHandlers} = require("./flagHandlers");
const {setupBugHandlers} = require("./bugHandlers");

function initializeAllHandlers() {
    setupDiscoveryHandlers();
    setupConnectionHandlers();
    setupDataHandlers();
    setupFlagHandlers();
    setupBugHandlers();
    console.log('All IPC handlers initialized');
}

module.exports = {
    initializeAllHandlers
};
