const dataBuffer = require('./dataBufferService');
const calculationUtils = require('../utils/calculationUtils');
const downsamplingUtils = require('../utils/downsamplingUtils');

class TestDataService {
    getTestData(options = {}) {
        console.log('Getting test data...');

        // Get raw data from buffer
        const rawData = dataBuffer.getRawDataBuffer();

        // Process the data based on options
        return this._processData(rawData, options);
    }

    setReviewData(data) {
        this.reviewData = data
    }

    getReviewData(options = {}) {
        console.log('Getting review data...');
        // Apply any additional processing needed for review
        return this._prepareForReview(this.reviewData);
    }

    calculateMetrics(data) {
        return {
            // Use calculation utils for various metrics
            averageSpeed: calculationUtils.calculateAverage(data.speed),
            maxSpeed: calculationUtils.calculateMax(data.speed),
            // Other metrics...
        };
    }

    _processData(rawData, options) {
        // Apply any necessary calculations or transformations
        const processedData = calculationUtils.processRawData(rawData);

        // Apply downsampling if needed
        if (options.downsample) {
            return downsamplingUtils.downsampleData(processedData, options.targetPoints);
        }

        return processedData;
    }

    _prepareForReview(data, options) {
        // Additional processing for review display
        // Could include formatting, filtering, etc.
        return data;
    }
}

module.exports = new TestDataService();