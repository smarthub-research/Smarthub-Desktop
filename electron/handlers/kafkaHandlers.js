/*
Handlers for Kafka-related operations
*/

const { ipcMain } = require('electron');
const dataService = require('../services/dataService');

function kafkaHandlers() {
    // Check if Kafka is initialized and ready
    ipcMain.handle('check-kafka-status', async () => {
        return {
            initialized: dataService.kafkaInitialized,
            initializing: dataService.kafkaInitializing
        };
    });

    // Manually trigger Kafka initialization (optional)
    ipcMain.handle('initialize-kafka', async () => {
        try {
            const success = await dataService.initializeKafka();
            return { success };
        } catch (error) {
            console.error('Manual Kafka initialization failed:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    kafkaHandlers
};
