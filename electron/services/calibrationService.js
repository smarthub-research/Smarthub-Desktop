/*

Stores a selected calibration for accessing later

*/

class CalibrationService {
    constructor() {
        this.calibration = null;
    }

    // Assigns this the values of a calibration
    setCalibration(calibration) {
        this.calibration = calibration;
    }

    // Returns the calibration
    getCalibration() {
        return this.calibration;
    }
}

module.exports = new CalibrationService();