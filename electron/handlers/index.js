const { setupDiscoveryHandlers } = require('./deviceDiscovery');
const { setupConnectionHandlers } = require('./connectionHandlers');
const { setupDataHandlers } = require('./data/dataHandler');
const {setupFlagHandlers} = require("./flagHandlers");
const {setupBugHandlers} = require("./bugHandlers");

function initializeAllHandlers() {
    setupDiscoveryHandlers();
    setupConnectionHandlers();
    setupDataHandlers();
    setupFlagHandlers();
    setupBugHandlers();
}

module.exports = {
    initializeAllHandlers
};
