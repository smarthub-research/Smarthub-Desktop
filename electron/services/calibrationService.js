/**
 * Calibration control service (Electron side).
 *
 * Provides a thin controller that coordinates starting and stopping a
 * dynamic calibration session. The heavy computation is performed in the
 * Python backend; this service triggers events via Kafka and controls BLE
 * reading on the Electron side.
 */

const kafkaService = require("./kafkaService")
const dataService = require("./dataService")

class CalibrationService {
    constructor() {
        this.calibration = null; // persisted calibration object
        this.isCalibrating = false;
    }

    // Store a calibration object for later use
    setCalibration(calibration) {
        this.calibration = calibration;
    }

    // Return the stored calibration
    getCalibration() {
        return this.calibration;
    }

    /**
     * Begin dynamic calibration for both SmartHub wheels.
     *
     * Workflow:
     * 1) Ensure Kafka is available
     * 2) Send a 'begin-static-calibration' recording event
     * 3) Start BLE reading so backend receives raw packets for calibration
     *
     * The backend will perform the sampling and convergence checks and
     * will notify completion via Kafka when finished.
     */
    async beginStaticCalibration() {
        if (this.isCalibrating) {
            console.warn('Calibration already in progress');
            return;
        }

        this.isCalibrating = true;
        console.log('Starting dynamic calibration...');

        try {
            await dataService.initializeKafka();
            await kafkaService.sendEvent("begin-static-calibration");
            console.log('Calibration event sent to backend');
            await dataService.beginReadingData();
            console.log('Reading data for calibration...');
        } catch (error) {
            console.error('Error during calibration:', error);
            this.isCalibrating = false;
            throw error;
        }
    }

    /**
     * End calibration and stop reading BLE data. Can be called manually or
     * in response to a backend completion event.
     */
    async endStaticCalibration() {
        if (!this.isCalibrating) {
            console.warn('No calibration in progress');
            return;
        }

        console.log('Ending calibration...');

        try {
            await kafkaService.sendEvent("end-static-calibration");
            await dataService.stopReadingData();
            console.log('Calibration ended - data reading stopped');
        } catch (error) {
            console.error('Error ending calibration:', error);
        } finally {
            this.isCalibrating = false;
        }
    }

    // Return boolean indicating if calibration is active
    isCalibrationActive() {
        return this.isCalibrating;
    }
}

module.exports = new CalibrationService();