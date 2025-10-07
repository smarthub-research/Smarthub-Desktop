const fs = require('fs');
const path = require('path');
const dataBuffer = require('../services/dataBufferService');
const exportUtils = require('../utils/exportUtils');

async function exportToCsv() {

    // Get data from buffer
    const data = dataBuffer.getRawDataBuffer();

    // Format data for CSV
    const csvData = exportUtils.formatDataForCSV(data);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `export_${timestamp}.csv`;
    const filePath = path.join(exportUtils.getAppPath('downloads'), filename);

    try {
        // Write to file
        await fs.promises.writeFile(filePath, csvData);
        return { success: true, filePath };
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    exportToCsv
}