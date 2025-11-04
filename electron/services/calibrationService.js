/*
Stores a selected calibration for accessing later and manages dynamic calibration
*/

const kafkaService = require("./kafkaService")
const dataService = require("./dataService")

class CalibrationService {
    constructor() {
        this.calibration = null;
        this.isCalibrating = false;
    }

    // Assigns this the values of a calibration
    setCalibration(calibration) {
        this.calibration = calibration;
    }

    // Returns the calibration
    getCalibration() {
        return this.calibration;
    }

    /**
     * Begin dynamic calibration for both SmartHub wheels
     * This implements the same logic as calibration.py from SmartHub_Test
     * 
     * Process:
     * 1. Send begin-static-calibration event to Kafka
     * 2. Start reading data from BLE devices
     * 3. Python backend will process packets and perform dynamic calibration
     * 4. Calibration runs until target accuracy is achieved (10-120 seconds)
     * 5. Python automatically stops when converged or timeout reached
     * 6. Calibration offsets are applied to the packet handler for future processing
     */
    async beginStaticCalibration() {
        if (this.isCalibrating) {
            console.warn('Calibration already in progress');
            return;
        }

        this.isCalibrating = true;
        console.log('Starting dynamic calibration...');

        try {
            // Ensure Kafka is initialized
            await dataService.initializeKafka();

            // Send calibration start event to Python backend
            await kafkaService.sendEvent("begin-static-calibration");
            console.log('Calibration event sent to backend');

            // Start reading data from BLE devices
            // The backend will process incoming packets for calibration
            await dataService.beginReadingData();
            console.log('Reading data for calibration...');
            
            // Note: The Python backend will automatically:
            // 1. Collect samples from both wheels
            // 2. Calculate offsets for all gyro axes (gx, gy, gz)
            // 3. Check for convergence every 2 seconds
            // 4. Stop when accuracy target is met or timeout reached
            // 5. Apply the calibration to the packet handler
            
            // The calibration runs automatically in the background
            // It will complete when the backend determines convergence or timeout
            
        } catch (error) {
            console.error('Error during calibration:', error);
            this.isCalibrating = false;
            throw error;
        }
    }

    /**
     * End calibration and stop reading data
     * Can be called manually or automatically when backend completes calibration
     */
    async endStaticCalibration() {
        if (!this.isCalibrating) {
            console.warn('No calibration in progress');
            return;
        }

        console.log('Ending calibration...');
        
        try {
            // Send end calibration event to backend (in case it's still running)
            await kafkaService.sendEvent("end-static-calibration");
            
            // Stop reading data from BLE devices
            await dataService.stopReadingData();
            
            console.log('Calibration ended - data reading stopped');
        } catch (error) {
            console.error('Error ending calibration:', error);
        } finally {
            this.isCalibrating = false;
        }
    }

    /**
     * Check if calibration is currently running
     */
    isCalibrationActive() {
        return this.isCalibrating;
    }
}

module.exports = new CalibrationService();