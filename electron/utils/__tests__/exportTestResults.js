const fs = require('fs');
const path = require('path');
const calculationUtils = require('../calculationUtils');
const dataService = require('../../services/dataService');

/**
 * Export test results to a JSON file in the same format as testing.json
 * @param {Object} params - Parameters for the export
 * @param {Array<number>} params.elapsed_time_s - Elapsed time in seconds
 * @param {Array<number>} params.gyro_left - Raw left gyro data
 * @param {Array<number>} params.gyro_right - Raw right gyro data
 * @param {Array<number>} params.accel_left - Left accelerometer data
 * @param {Array<number>} params.accel_right - Right accelerometer data
 * @param {number} params.gain_left - Left gain value (default: 1.13)
 * @param {number} params.gain_right - Right gain value (default: 1.12)
 * @param {string} params.outputFileName - Output file name (default: 'test_results.json')
 */
async function exportTestResults({
    elapsed_time_s,
    gyro_left,
    gyro_right,
    accel_left,
    accel_right,
    gain_left = 1.13,
    gain_right = 1.12,
    outputFileName = 'test_results.json'
}) {
    try {
        console.log('Starting test results export...');
        
        // Step 1: Smooth the gyro data
        console.log('Smoothing data...');
        const smoothedData = await dataService.smoothData(
            { "gyroData": gyro_right }, 
            { "gyroData": gyro_left }, 
            elapsed_time_s
        );

        let gyro_left_smoothed = smoothedData.gyro_left_smoothed;
        let gyro_right_smoothed = smoothedData.gyro_right_smoothed;

        // Step 2: Apply gains
        console.log('Applying gains...');
        const gainResponse = dataService.applyGain(gyro_left_smoothed, gyro_right_smoothed);
        gyro_left_smoothed = gainResponse.left;
        gyro_right_smoothed = gainResponse.right;

        // Step 3: Calculate velocity
        console.log('Calculating velocity...');
        const velocity = calculationUtils.getVelocity(gyro_left_smoothed, gyro_right_smoothed);

        // Step 4: Calculate displacement
        console.log('Calculating displacement...');
        const displacement_m = calculationUtils.getDisplacement(
            elapsed_time_s, 
            gyro_left_smoothed, 
            gyro_right_smoothed
        );

        // Step 5: Calculate heading
        console.log('Calculating heading...');
        const heading_deg = calculationUtils.getHeading(
            elapsed_time_s, 
            gyro_left_smoothed, 
            gyro_right_smoothed
        );

        // Step 6: Calculate trajectory
        console.log('Calculating trajectory...');
        const traj = calculationUtils.getTraj(velocity, heading_deg, elapsed_time_s);

        // Build the result object in the same format as testing.json
        const results = {
            elapsed_time_s,
            gyro_right,
            gyro_left,
            gyro_right_smoothed,
            gyro_left_smoothed,
            accel_left,
            accel_right,
            heading_deg,
            displacement_m,
            velocity,
            traj_x: traj.x,
            traj_y: traj.y
        };

        // Write to file
        const outputPath = path.join(__dirname, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        
        console.log(`✅ Results exported successfully to: ${outputPath}`);
        console.log(`📊 Data points: ${elapsed_time_s.length}`);
        console.log(`📐 Gains used: left=${gain_left}, right=${gain_right}`);
        
        return {
            success: true,
            outputPath,
            dataPoints: elapsed_time_s.length,
            results
        };

    } catch (error) {
        console.error('❌ Error exporting test results:', error);
        throw error;
    }
}

/**
 * Export test results from raw test data file
 * @param {string} inputJsonPath - Path to input JSON file with raw test data
 * @param {string} outputFileName - Output file name
 * @param {number} gain_left - Left gain value
 * @param {number} gain_right - Right gain value
 */
async function exportFromTestDataFile(
    inputJsonPath, 
    outputFileName = 'test_results.json',
    gain_left = 1.13,
    gain_right = 1.12
) {
    const testData = require(inputJsonPath);
    
    return await exportTestResults({
        elapsed_time_s: testData.elapsed_time_s,
        gyro_left: testData.gyro_left,
        gyro_right: testData.gyro_right,
        accel_left: testData.accel_left,
        accel_right: testData.accel_right,
        gain_left,
        gain_right,
        outputFileName
    });
}

module.exports = {
    exportTestResults,
    exportFromTestDataFile
};
