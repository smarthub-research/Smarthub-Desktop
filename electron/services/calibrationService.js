
// Service to store, set, and get calibration data in memory using a class.
class CalibrationService {
    constructor() {
        this.calibration = null;
    }

    setCalibration(calibration) {
        this.calibration = calibration;
        this.leftGain = calibration.leftGain;
        this.rightGain = calibration.rightGain;
    }

    getCalibration() {
        return this.calibration;
    }
}

module.exports = new CalibrationService();