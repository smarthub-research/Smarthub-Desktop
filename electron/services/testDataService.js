/**
 * Test data holder and formatter for the renderer.
 *
 * Stores an in-memory snapshot of a test (raw arrays) and provides
 * utilities to prepare that data for review UIs. Interacts with
 * `dataBuffer` when asked to snapshot the current buffer.
 */

const dataBuffer = require('../utils/dataBuffer');

class TestDataService {
    // Return the currently stored test data (or null)
    getTestData() {
        return this.testData || null;
    }

    // Helper to normalize values that may be wrapped in single-element arrays
    _spreadData(data) {
        if (!data || !Array.isArray(data)) return [];
        const fix = [];
        for (let val of data) {
            fix.push(Array.isArray(val) ? val[0] : val);
        }
        return fix;
    }

    // Persist test data object. If `data === true`, snapshot current buffer.
    setTestData(data) {
        console.log("TEST DATA SET: ", dataBuffer.getRawDataBuffer());
        let dataValues;
        if (data === null) return { success: false };
        if (data === true) dataValues = dataBuffer.getRawDataBuffer(); else dataValues = data;

        this.testData = {
            gyroLeft: this._spreadData(dataValues.gyroLeft) || [],
            gyroRight: this._spreadData(dataValues.gyroRight) || [],
            accelLeft: dataValues.accelLeft || [],
            accelRight: dataValues.accelRight || [],
            displacement: dataValues.displacement || [],
            velocity: dataValues.velocity || [],
            heading: dataValues.heading || [],
            trajectory_x: dataValues.trajectory_x || [],
            trajectory_y: dataValues.trajectory_y || [],
            timeStamp: this._spreadData(dataValues.timeStamp) || [],
        };

        // Optionally clear the live buffer after saving
        if (data && dataBuffer.clearBuffer()) {
            dataBuffer.initializeBuffer();
        }

        return { success: true };
    }

    setReviewData(data) { this.reviewData = data }

    getReviewData() { return this._prepareForReview(this.reviewData); }

    clearReviewData() { this.reviewData = null; }

    _formatTestData(data, dataType) {
        return data.timeStamp.map((time, index) => ({ time: (Number(time) / 1000).toFixed(2), [dataType]: data[dataType][index] }));
    }

    // Pair trajectory x/y with timestamps for the UI
    _formatTrajectoryData(data) {
        return data.timeStamp.map((time, index) => ({ time: (Number(time) / 1000).toFixed(2), trajectory_x: data.trajectory_x[index], trajectory_y: data.trajectory_y[index] }))
    }

    _prepareForReview(data) {
        if (!data) return null;
        return { ...data, displacement: this._formatTestData(data, "displacement"), heading: this._formatTestData(data, "heading"), velocity: this._formatTestData(data, "velocity"), trajectory: this._formatTrajectoryData(data) };
    }
}

module.exports = new TestDataService();