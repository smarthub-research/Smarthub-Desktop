
// Service to store, set, and get calibration data in memory using a class.
class CalibrationService {
    constructor() {
        this.calibration = null;
    }

    setCalibration(calibration) {
        this.calibration = calibration;
        this.leftGain = calibration.left_gain;   // Backend sends left_gain (snake_case)
        this.rightGain = calibration.right_gain; // Backend sends right_gain (snake_case)
        this.wheelDistance = calibration.wheel_distance;
    }

    getCalibration() {
        return this.calibration;
    }
}

module.exports = new CalibrationService();