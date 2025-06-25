const fs = require('fs');
const path = require('path');
const dataBuffer = require('../services/dataBufferService');
const exportUtils = require('../utils/exportUtils');

class ExportService {
    async exportToCsv(options) {
        console.log('Exporting data to CSV...');

        // Get data from buffer
        const data = options.raw ? dataBuffer.getRawDataBuffer() : dataBuffer.getDataBuffer();

        // Format data for CSV
        const csvData = exportUtils.formatDataForCSV(data);

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = options.filename || `export_${timestamp}.csv`;
        const filePath = path.join(options.directory || this._getAppPath('downloads'), filename);

        try {
            // Write to file
            await fs.promises.writeFile(filePath, csvData);
            return { success: true, filePath };
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            return { success: false, error: error.message };
        }
    }

    async exportToJson(options) {
        console.log('Exporting data to JSON...');

        // Get data from buffer
        const data = options.raw ? dataBuffer.getRawDataBuffer() : dataBuffer.getDataBuffer();

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = options.filename || `export_${timestamp}.json`;
        const filePath = path.join(options.directory || app.getPath('downloads'), filename);

        // Process data if needed
        const jsonData = JSON.stringify(data, null, 2);

        try {
            // Write to file
            await fs.promises.writeFile(filePath, jsonData);
            return { success: true, filePath };
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper method to get app paths
    _getAppPath(type) {
        const { app } = require('electron');
        return app.getPath(type);
    }
}

module.exports = new ExportService();