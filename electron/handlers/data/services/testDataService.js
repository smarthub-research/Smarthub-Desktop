const dataBuffer = require('./dataBufferService');
const calculationUtils = require('../utils/calculationUtils');
const downsamplingUtils = require('../utils/downsamplingUtils');

class TestDataService {
    getTestData() {
        if (!this.testData) {
            return null;
        }
        return this.testData
    }

    _spreadData(data) {
        if (!data || !Array.isArray(data)) {
            return [];
        }
        
        let fix = [];
        for (let val of data) {
            if (Array.isArray(val)) {
                fix.push(val[0]);
            } else {
                fix.push(val);
            }
        }
        return fix;
    }

    setTestData(data) {
        console.log("TEST DATA SET: ", data);
        let dataValues;
        if (data === null) {
            // Return without changing anything if explicitly set to null
            return { success: false };
        } else if (data === true) {
            // Save current buffer without clearing it
            dataValues = dataBuffer.getRawDataBuffer();
        } else {
            dataValues = data;
        }

        this.testData = {
            gyro_left: this._spreadData(dataValues.gyro_left) || [],
            gyro_right: this._spreadData(dataValues.gyro_right) || [],
            accel_left: dataValues.accel_left || [],
            accel_right: dataValues.accel_right || [],
            displacement: dataValues.displacement || [],
            velocity: dataValues.velocity || [],
            heading: dataValues.heading || [],
            trajectory_x: dataValues.trajectory_x || [],
            trajectory_y: dataValues.trajectory_y || [],
            timeStamp: dataValues.timeStamp || [],
        };

        // Clear the data buffers
        if (data && dataBuffer.clearBuffers()) {
            dataBuffer.initializeBuffer();
        }

        return { success: true };
    }

    setReviewData(data) {
        this.reviewData = data
    }

    getReviewData() {
        // Apply any additional processing needed for review
        return this._prepareForReview(this.reviewData);
    }

    clearReviewData() {
        this.reviewData = null;
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

    formatTestData(data, dataType) {
        return data.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            [dataType]: data[dataType][index]
        }));
    }

    // Pairs trajectories with time stamps for trajectory graph
    formatTrajectoryData(data) {
        return data.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            trajectory_x: data.trajectory_x[index],
            trajectory_y: data.trajectory_y[index]
        }))
    }

    _prepareForReview(data) {
        let testData = {
            ...data,
            displacement: this.formatTestData(data, "displacement"),
            heading: this.formatTestData(data, "heading"),
            velocity: this.formatTestData(data, "velocity"),
            trajectory: this.formatTrajectoryData(data)
        }
        console.log(testData)
        return testData
    }
}

module.exports = new TestDataService();