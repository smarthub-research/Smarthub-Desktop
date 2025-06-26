const dataBuffer = require('./dataBufferService');
const calculationUtils = require('../utils/calculationUtils');
const downsamplingUtils = require('../utils/downsamplingUtils');

class TestDataService {
    getTestData() {
        if (!this.testData) {
            console.log("No test data available");
            return null;
        }
        return this.testData
    }

    setTestData(data) {
        let dataValues;
        if (!data) {
            dataValues = dataBuffer.getRawDataBuffer();
        } else {
            dataValues = data;
        }
        console.log("setting test data");

        this.testData = {
            gyro_left: dataValues.gyro_left || [],
            gyro_right: dataValues.gyro_right || [],
            accel_left: dataValues.accel_left || [],
            accel_right: dataValues.accel_right || [],
            displacement: dataValues.displacement || [],
            velocity: dataValues.velocity || [],
            heading: dataValues.heading || [],
            trajectory_x: dataValues.trajectory_x || [],
            trajectory_y: dataValues.trajectory_y || [],
            timeStamp: dataValues.timeStamp || [],
            duration: this.calculateDuration(dataValues),
            maxVelocity: this.calculateMaxVelocity(dataValues.velocity || []),
            avgHeading: this.calculateAvgHeading(dataValues.heading || [])
        };

        // Clear the data buffers
        dataBuffer.initializeBuffer();
        return { success: true };
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

    calculateMaxVelocity(data) {
        if (!data.velocity) { return 0 }
        return data.velocity.max
    }

    calculateAvgHeading(data) {
        if (!data.heading) { return 0 }
        let avg = 0
        data.heading.map((val) => {
            avg += val
        })
        return avg /= data.heading.length
    }

    calculateDuration(data) {
        const timeData = data.displacement || data;
        if (!timeData || timeData.length === 0) return 0;

        // Find the last timestamp
        const lastItem = timeData[timeData.length - 1];
        return lastItem.timeStamp ? (lastItem.timeStamp / 1000).toFixed(1) : 0;
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