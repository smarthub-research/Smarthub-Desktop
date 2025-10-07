const dataBuffer = require('../utils/dataBuffer');

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
            timeStamp: dataValues.time_from_start || [],
        };

        // Clear the data buffers
        if (data && dataBuffer.clearBuffer()) {
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

    _formatTestData(data, dataType) {
        return data.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            [dataType]: data[dataType][index]
        }));
    }

    // Pairs trajectories with time stamps for trajectory graph
    _formatTrajectoryData(data) {
        return data.timeStamp.map((time, index) => ({
            time: (Number(time) / 1000).toFixed(2),
            trajectory_x: data.trajectory_x[index],
            trajectory_y: data.trajectory_y[index]
        }))
    }

    _prepareForReview(data) {
        let testData = {
            ...data,
            displacement: this._formatTestData(data, "displacement"),
            heading: this._formatTestData(data, "heading"),
            velocity: this._formatTestData(data, "velocity"),
            trajectory: this._formatTrajectoryData(data)
        }
        return testData
    }
}

module.exports = new TestDataService();