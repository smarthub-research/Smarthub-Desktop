
// Service to store, set, and get calibration data in memory using a class.
class CalibrationService {
    constructor() {
        this.calibration = null;
    }

    setCalibration(calibration) {
        this.calibration = calibration;
        this.leftGain = calibration.leftGain;
        this.rightGain = calibration.rightGain;
        this.wheelDistance = calibration.wheel_distance;
    }

    getCalibration() {
        return this.calibration;
    }
}

module.exports = new CalibrationService();