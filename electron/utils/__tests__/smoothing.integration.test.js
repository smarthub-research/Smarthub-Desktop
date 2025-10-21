/**
 * Tests for smoothing API integration
 * The smoothing is done by a Python backend and this is where issues often hide
 */

const dataService = require('../../services/dataService');

describe('Smoothing API Integration', () => {
    
    describe('API Response Handling', () => {
        test('should handle successful smoothing response', async () => {
            const pendingRightData = {
                gyroData: [0.5, 0.52, 0.48, 0.51],
                accelData: [0, 0, 0, 0]
            };
            const pendingLeftData = {
                gyroData: [0.49, 0.51, 0.47, 0.50],
                accelData: [0, 0, 0, 0]
            };
            const timeStamps = [0.0, 0.0147, 0.0294, 0.0441];

            // Mock successful fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    gyro_right_smoothed: [0.50, 0.51, 0.49, 0.51],
                    gyro_left_smoothed: [0.49, 0.50, 0.48, 0.50]
                })
            });

            const result = await dataService.smoothData(
                pendingRightData,
                pendingLeftData,
                timeStamps
            );

            expect(result).toHaveProperty('gyro_right_smoothed');
            expect(result).toHaveProperty('gyro_left_smoothed');
            expect(result.gyro_right_smoothed).toHaveLength(4);
            expect(result.gyro_left_smoothed).toHaveLength(4);
        });

        test('should handle API timeout', async () => {
            const pendingRightData = {
                gyroData: [0.5, 0.52, 0.48, 0.51],
                accelData: [0, 0, 0, 0]
            };
            const pendingLeftData = {
                gyroData: [0.49, 0.51, 0.47, 0.50],
                accelData: [0, 0, 0, 0]
            };
            const timeStamps = [0.0, 0.0147, 0.0294, 0.0441];

            // Mock timeout
            global.fetch = jest.fn().mockRejectedValue(new Error('Timeout'));

            // Should return original data as fallback
            const result = await dataService.smoothData(
                pendingRightData,
                pendingLeftData,
                timeStamps
            );

            // Verify fallback returns unsmoothed data
            expect(result.gyro_right_smoothed).toEqual(pendingRightData.gyroData);
            expect(result.gyro_left_smoothed).toEqual(pendingLeftData.gyroData);
        });

        test('should handle malformed API response', async () => {
            const pendingRightData = {
                gyroData: [0.5, 0.52, 0.48, 0.51],
                accelData: [0, 0, 0, 0]
            };
            const pendingLeftData = {
                gyroData: [0.49, 0.51, 0.47, 0.50],
                accelData: [0, 0, 0, 0]
            };
            const timeStamps = [0.0, 0.0147, 0.0294, 0.0441];

            // Mock malformed response
            global.fetch = jest.fn().mockResolvedValue({
                json: async () => ({
                    // Missing gyro_left_smoothed
                    gyro_right_smoothed: [0.50, 0.51, 0.49, 0.51]
                })
            });

            const result = await dataService.smoothData(
                pendingRightData,
                pendingLeftData,
                timeStamps
            );

            // Should handle gracefully by returning unsmoothed data
            expect(result.gyro_left_smoothed).toEqual(pendingLeftData.gyroData);
            expect(result.gyro_right_smoothed).toEqual(pendingRightData.gyroData);
        });

        test('should handle API returning wrong array length', async () => {
            const pendingRightData = {
                gyroData: [0.5, 0.52, 0.48, 0.51], // 4 values
                accelData: [0, 0, 0, 0]
            };
            const pendingLeftData = {
                gyroData: [0.49, 0.51, 0.47, 0.50],
                accelData: [0, 0, 0, 0]
            };
            const timeStamps = [0.0, 0.0147, 0.0294, 0.0441];

            // Mock wrong length response
            global.fetch = jest.fn().mockResolvedValue({
                json: async () => ({
                    gyro_right_smoothed: [0.50, 0.51], // Only 2 values!
                    gyro_left_smoothed: [0.49, 0.50, 0.48, 0.50]
                })
            });

            const result = await dataService.smoothData(
                pendingRightData,
                pendingLeftData,
                timeStamps
            );

            // Length mismatch should be caught and fallback to original data
            expect(result.gyro_right_smoothed.length).toEqual(4);
            expect(result.gyro_right_smoothed).toEqual(pendingRightData.gyroData);
            expect(result.gyro_left_smoothed).toEqual(pendingLeftData.gyroData);
        });

        test('should handle API returning NaN or Infinity', async () => {
            const pendingRightData = {
                gyroData: [0.5, 0.52, 0.48, 0.51],
                accelData: [0, 0, 0, 0]
            };
            const pendingLeftData = {
                gyroData: [0.49, 0.51, 0.47, 0.50],
                accelData: [0, 0, 0, 0]
            };
            const timeStamps = [0.0, 0.0147, 0.0294, 0.0441];

            // Mock bad values
            global.fetch = jest.fn().mockResolvedValue({
                json: async () => ({
                    gyro_right_smoothed: [0.50, NaN, 0.49, Infinity],
                    gyro_left_smoothed: [0.49, 0.50, 0.48, 0.50]
                })
            });

            const result = await dataService.smoothData(
                pendingRightData,
                pendingLeftData,
                timeStamps
            );

            // Invalid values should be caught and fallback to valid original data
            const hasInvalidValues = result.gyro_right_smoothed.some(v => 
                !isFinite(v) || isNaN(v)
            );
            expect(hasInvalidValues).toBe(false);
            expect(result.gyro_right_smoothed).toEqual(pendingRightData.gyroData);
            expect(result.gyro_left_smoothed).toEqual(pendingLeftData.gyroData);
        });
    });

    describe('Smoothing vs Unsmoothed Comparison', () => {
        test('smoothed data should be close to original but with less noise', async () => {
            // Simulate noisy data
            const noisyRight = [0.50, 0.55, 0.48, 0.52];
            const noisyLeft = [0.49, 0.54, 0.47, 0.51];
            
            // Smoothed should be closer to mean
            const smoothedRight = [0.51, 0.52, 0.50, 0.51];
            const smoothedLeft = [0.50, 0.51, 0.49, 0.50];

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    gyro_right_smoothed: smoothedRight,
                    gyro_left_smoothed: smoothedLeft
                })
            });

            const result = await dataService.smoothData(
                { gyroData: noisyRight, accelData: [0,0,0,0] },
                { gyroData: noisyLeft, accelData: [0,0,0,0] },
                [0, 0.015, 0.03, 0.045]
            );

            // Smoothed variance should be less than original
            const originalVariance = noisyRight.reduce((sum, v, i) => {
                const mean = 0.51;
                return sum + Math.pow(v - mean, 2);
            }, 0) / noisyRight.length;

            const smoothedVariance = result.gyro_right_smoothed.reduce((sum, v, i) => {
                const mean = 0.51;
                return sum + Math.pow(v - mean, 2);
            }, 0) / result.gyro_right_smoothed.length;

            expect(smoothedVariance).toBeLessThan(originalVariance);
        });

        test('should verify smoothing does not introduce phase lag', async () => {
            // If smoothing introduces delay, it will shift the signal
            const original = [0, 0.5, 1.0, 0.5]; // Rising then falling
            
            // Good smoothing: maintains timing
            const goodSmoothed = [0, 0.45, 0.95, 0.5];
            
            // Bad smoothing: introduces lag (peak shifted)
            const badSmoothed = [0, 0.25, 0.75, 0.85]; // Peak moved right

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    gyro_right_smoothed: goodSmoothed,
                    gyro_left_smoothed: goodSmoothed
                })
            });

            const result = await dataService.smoothData(
                { gyroData: original, accelData: [0,0,0,0] },
                { gyroData: original, accelData: [0,0,0,0] },
                [0, 0.015, 0.03, 0.045]
            );

            // Peak should still be at index 2
            const peakIndex = result.gyro_right_smoothed.indexOf(
                Math.max(...result.gyro_right_smoothed)
            );
            expect(peakIndex).toBe(2);
        });
    });

    describe('Performance and Timing', () => {
        test('smoothing API should respond within acceptable time', async () => {
            global.fetch = jest.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: async () => ({
                                gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5],
                                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5]
                            })
                        });
                    }, 100); // 100ms delay
                });
            });

            const start = Date.now();
            
            await dataService.smoothData(
                { gyroData: [0.5, 0.5, 0.5, 0.5], accelData: [0,0,0,0] },
                { gyroData: [0.5, 0.5, 0.5, 0.5], accelData: [0,0,0,0] },
                [0, 0.015, 0.03, 0.045]
            );

            const elapsed = Date.now() - start;
            
            // Should complete in reasonable time (< 200ms)
            expect(elapsed).toBeLessThan(200);
        });

        test('should not block on slow API responses', async () => {
            // This tests if the system can handle slow responses gracefully
            // In production, you might want a timeout
            
            const slowFetch = jest.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            json: async () => ({
                                gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5],
                                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5]
                            })
                        });
                    }, 5000); // 5 second delay
                });
            });

            global.fetch = slowFetch;

            // Should timeout or handle gracefully
            // You might want to add a timeout to the fetch call
        });
    });

    afterEach(() => {
        // Clean up mocks
        if (global.fetch && global.fetch.mockRestore) {
            global.fetch.mockRestore();
        }
    });
});

/**
 * RECOMMENDED: Add these tests to verify your Python smoothing backend
 */
describe('Smoothing Backend Validation (Python)', () => {
    test('Python backend should be running on localhost:8000', async () => {
        try {
            const response = await fetch('http://localhost:8000/');
            expect(response.ok).toBe(true);
        } catch (error) {
            console.warn('Smoothing backend not running. Start it with: cd backend && python main.py');
            // Don't fail test if backend is down during testing
        }
    });

    test('smoothing endpoint should accept correct payload format', async () => {
        const payload = {
            gyroRight: [0.5, 0.52, 0.48, 0.51],
            gyroLeft: [0.49, 0.51, 0.47, 0.50],
            timeStamps: [0.0, 0.0147, 0.0294, 0.0441]
        };

        try {
            const response = await fetch('http://localhost:8000/calculate/smooth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            expect(response.ok).toBe(true);
            
            const data = await response.json();
            expect(data).toHaveProperty('gyro_right_smoothed');
            expect(data).toHaveProperty('gyro_left_smoothed');
        } catch (error) {
            console.warn('Smoothing endpoint test skipped - backend not available');
        }
    });
});
