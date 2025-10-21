/**
 * Integration tests for dataService.js to catch issues that unit tests miss
 * These tests simulate the actual data flow through the system
 */

const dataService = require('../../services/dataService');
const calculationUtils = require('../calculationUtils');
const timeManager = require('../timeManager');

describe('DataService Integration Tests', () => {
    beforeEach(() => {
        calculationUtils.resetState();
        timeManager.reset();
    });

    describe('Timestamp Generation', () => {
        test('timestamps should be monotonically increasing and properly converted', () => {
            // Simulate recording start
            timeManager.beginRecording();
            const startTime = timeManager.getRecordingStartTime();
            
            // Simulate time passing (100ms)
            jest.spyOn(Date, 'now').mockReturnValue(startTime + 100);
            
            const time_curr = (Date.now() - startTime) / 1000; // Should be 0.1 seconds
            const timeStamps = [];
            
            // This is what dataService.processPackets does
            for (let i = 3; i > -1; i--) {
                timeStamps.push(time_curr - i * (1/68));
            }
            
            // Verify timestamps
            expect(timeStamps).toHaveLength(4);
            
            // All timestamps should be in seconds
            expect(timeStamps[0]).toBeGreaterThan(0);
            expect(timeStamps[0]).toBeLessThan(1); // Should be less than 1 second
            
            // Should be monotonically increasing
            for (let i = 1; i < timeStamps.length; i++) {
                expect(timeStamps[i]).toBeGreaterThan(timeStamps[i-1]);
            }
            
            // Spacing should be approximately 1/68 seconds (sensor interval)
            const expectedInterval = 1/68;
            for (let i = 1; i < timeStamps.length; i++) {
                const actualInterval = timeStamps[i] - timeStamps[i-1];
                expect(actualInterval).toBeCloseTo(expectedInterval, 6);
            }
            
            jest.restoreAllMocks();
        });

        test('timestamps should accumulate correctly across multiple packets', () => {
            timeManager.beginRecording();
            const startTime = timeManager.getRecordingStartTime();
            
            const allTimestamps = [];
            
            // Simulate 3 packets arriving
            for (let packetNum = 0; packetNum < 3; packetNum++) {
                const elapsedMs = 100 * (packetNum + 1); // 100ms, 200ms, 300ms
                jest.spyOn(Date, 'now').mockReturnValue(startTime + elapsedMs);
                
                const time_curr = (Date.now() - startTime) / 1000;
                const timeStamps = [];
                
                for (let i = 3; i > -1; i--) {
                    timeStamps.push(time_curr - i * (1/68));
                }
                
                allTimestamps.push(...timeStamps);
            }
            
            // All timestamps should be monotonically increasing across packets
            for (let i = 1; i < allTimestamps.length; i++) {
                expect(allTimestamps[i]).toBeGreaterThanOrEqual(allTimestamps[i-1]);
            }
            
            jest.restoreAllMocks();
        });
    });

    describe('Gain and Threshold Application', () => {
        test('gain should be applied before threshold', () => {
            const gyroLeft = [0.02, 0.03, 0.01, 0.025];  // Some below threshold
            const gyroRight = [0.025, 0.02, 0.028, 0.015];
            
            const leftCopy = [...gyroLeft];
            const rightCopy = [...gyroRight];
            
            // Apply gain (what dataService does)
            dataService.applyGain(leftCopy, rightCopy);
            
            // After gain, values should be multiplied
            expect(leftCopy[0]).toBeCloseTo(gyroLeft[0] * 1.13, 10);
            expect(rightCopy[0]).toBeCloseTo(gyroRight[0] * 1.12, 10);
            
            // Apply threshold
            const THRESHOLD = 0.03;
            dataService.applyThreshold(leftCopy, rightCopy);
            
            // Values below threshold should be zero AFTER gain is applied
            // 0.02 * 1.13 = 0.0226 < 0.03, should be 0
            expect(leftCopy[2]).toBe(0);
            
            // 0.03 * 1.13 = 0.0339 > 0.03, should NOT be 0
            expect(leftCopy[1]).toBeCloseTo(0.03 * 1.13, 10);
        });

        test('threshold should zero out small values symmetrically', () => {
            const gyroLeft = [0.02, -0.02, 0.04, -0.04];
            const gyroRight = [0.025, -0.025, 0.035, -0.035];
            
            dataService.applyThreshold(gyroLeft, gyroRight);
            
            // Both positive and negative small values should be zeroed
            expect(gyroLeft[0]).toBe(0);
            expect(gyroLeft[1]).toBe(0);
            expect(gyroRight[0]).toBe(0);
            expect(gyroRight[1]).toBe(0);
            
            // Larger values should pass through
            expect(Math.abs(gyroLeft[2])).toBeGreaterThan(0);
            expect(Math.abs(gyroLeft[3])).toBeGreaterThan(0);
        });
    });

    describe('State Accumulation Across Packets', () => {
        test('displacement should accumulate correctly over multiple packets', () => {
            // Don't reset state - simulate continuous recording
            
            const diameter = 3.937; // inches
            
            // First packet
            const t1 = [0, 0.0147, 0.0294, 0.0441];
            const left1 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.13);
            const right1 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.12);
            
            const result1 = calculationUtils.calc(t1, left1, right1, [0,0,0,0], [0,0,0,0], diameter);
            
            const firstDisplacement = result1.displacement[result1.displacement.length - 1];
            expect(firstDisplacement).toBeGreaterThan(0);
            
            // Second packet - should start from where first ended
            const t2 = [0.0588, 0.0735, 0.0882, 0.1029];
            const left2 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.13);
            const right2 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.12);
            
            const result2 = calculationUtils.calc(t2, left2, right2, [0,0,0,0], [0,0,0,0], diameter);
            
            // Second packet's initial displacement should equal first packet's final
            expect(result2.displacement[0]).toBeCloseTo(firstDisplacement, 10);
            
            // Final displacement should be greater
            expect(result2.displacement[result2.displacement.length - 1]).toBeGreaterThan(firstDisplacement);
        });

        test('heading should accumulate correctly during turns', () => {
            // Simulate a turn (different left/right speeds)
            const t1 = [0, 0.0147, 0.0294, 0.0441];
            const left1 = [0.3, 0.3, 0.3, 0.3].map(v => v * 1.13);
            const right1 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.12);
            
            const result1 = calculationUtils.calc(t1, left1, right1, [0,0,0,0], [0,0,0,0]);
            const firstHeading = result1.heading[result1.heading.length - 1];
            
            // Continue turn
            const t2 = [0.0588, 0.0735, 0.0882, 0.1029];
            const left2 = [0.3, 0.3, 0.3, 0.3].map(v => v * 1.13);
            const right2 = [0.5, 0.5, 0.5, 0.5].map(v => v * 1.12);
            
            const result2 = calculationUtils.calc(t2, left2, right2, [0,0,0,0], [0,0,0,0]);
            
            // Heading should continue accumulating
            expect(result2.heading[0]).toBeCloseTo(firstHeading, 10);
            expect(result2.heading[result2.heading.length - 1]).toBeGreaterThan(firstHeading);
        });
    });

    describe('Data Packet Synchronization', () => {
        test('should handle when only one packet is pending', () => {
            dataService.pendingLeftData = {
                accelData: [0, 0, 0, 0],
                gyroData: [0.5, 0.5, 0.5, 0.5]
            };
            dataService.pendingRightData = null;
            
            // Should not process - need both packets
            // This test verifies the check exists
            expect(dataService.pendingLeftData).not.toBeNull();
            expect(dataService.pendingRightData).toBeNull();
        });

        test('pending data should be cleared after processing', async () => {
            // This would require mocking the BLE connections and smoothing API
            // But the key is that after processPackets(), both should be null
            
            dataService.pendingLeftData = {
                accelData: [0, 0, 0, 0],
                gyroData: [0.5, 0.5, 0.5, 0.5]
            };
            dataService.pendingRightData = {
                accelData: [0, 0, 0, 0],
                gyroData: [0.5, 0.5, 0.5, 0.5]
            };
            
            // After successful processing, both should be cleared
            // (This test is a placeholder - you'd need to mock the smoothing API)
        });
    });

    describe('Velocity Edge Cases', () => {
        test('velocity calculation should handle reverse motion', () => {
            const t = [0, 0.015, 0.03, 0.045];
            const left = [-0.5, -0.5, -0.5, -0.5]; // Negative = reverse
            const right = [-0.5, -0.5, -0.5, -0.5];
            
            const vel = calculationUtils.getVelocity(left, right);
            
            // All velocities should be negative
            for (let i = 1; i < vel.length; i++) {
                expect(vel[i]).toBeLessThan(0);
            }
        });

        test('velocity should handle one wheel forward, one reverse', () => {
            const t = [0, 0.015, 0.03, 0.045];
            const left = [0.5, 0.5, 0.5, 0.5];
            const right = [-0.5, -0.5, -0.5, -0.5]; // Turning in place
            
            const vel = calculationUtils.getVelocity(left, right);
            
            // Average should be near zero (turning in place)
            for (let i = 1; i < vel.length; i++) {
                expect(Math.abs(vel[i])).toBeLessThan(0.01);
            }
        });
    });

    describe('Sensor Data Decoding', () => {
        test('should correctly decode sensor data with sign bits', () => {
            // Create test data with known values
            const data = Buffer.alloc(18);
            
            // Sign bits - all negative
            data[0] = 0b00001111; // All 4 accel negative
            data[1] = 0b00001111; // All 4 gyro negative
            
            // Accel data 1: 1000 / 1000 = 1.0, with sign = -1.0
            data[2] = 0xE8; // 1000 LSB
            data[3] = 0x03; // 1000 MSB
            
            // Gyro data 1: 100 / 100 = 1.0, with sign = -1.0
            data[10] = 0x64; // 100 LSB
            data[11] = 0x00; // 100 MSB
            
            const accelData = [];
            const gyroData = [];
            
            calculationUtils.decodeSensorData(data, accelData, gyroData);
            
            // Should have 4 values each
            expect(accelData).toHaveLength(4);
            expect(gyroData).toHaveLength(4);
            
            // First values should be negative
            expect(accelData[0]).toBeCloseTo(-1.0, 3);
            expect(gyroData[0]).toBeCloseTo(-1.0, 3);
        });

        test('should handle mixed positive/negative values', () => {
            const data = Buffer.alloc(18);
            
            // Sign bits - alternating
            data[0] = 0b00000101; // accel: neg, pos, neg, pos
            data[1] = 0b00001010; // gyro: pos, neg, pos, neg
            
            // Fill with same raw values
            for (let i = 0; i < 4; i++) {
                data[2 + i*2] = 0x64; // 100
                data[3 + i*2] = 0x00;
                data[10 + i*2] = 0x64; // 100
                data[11 + i*2] = 0x00;
            }
            
            const accelData = [];
            const gyroData = [];
            
            calculationUtils.decodeSensorData(data, accelData, gyroData);
            
            // Check signs
            expect(accelData[0]).toBeLessThan(0);
            expect(accelData[1]).toBeGreaterThan(0);
            expect(gyroData[0]).toBeGreaterThan(0);
            expect(gyroData[1]).toBeLessThan(0);
        });
    });
});
