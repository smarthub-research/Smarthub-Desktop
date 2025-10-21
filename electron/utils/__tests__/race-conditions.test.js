/**
 * Tests for race condition prevention in dataService
 */

const dataService = require('../../services/dataService');
const calculationUtils = require('../calculationUtils');
const timeManager = require('../timeManager');

// Mock BrowserWindow to prevent errors
jest.mock('electron', () => ({
    BrowserWindow: {
        getAllWindows: jest.fn(() => [])
    }
}));

describe('Race Condition Prevention', () => {
    
    beforeEach(() => {
        calculationUtils.resetState();
        timeManager.reset();
        timeManager.beginRecording();
        
        // Reset dataService state
        dataService.pendingLeftData = null;
        dataService.pendingRightData = null;
        dataService.isProcessing = false;
        
        // Mock successful smoothing by default
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
            })
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Concurrent processPackets() calls', () => {
        test('should prevent concurrent processing with isProcessing flag', async () => {
            // Setup pending data
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            // Make smoothing take time
            let smoothingCallCount = 0;
            global.fetch = jest.fn().mockImplementation(() => {
                smoothingCallCount++;
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: async () => ({
                                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                                gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                            })
                        });
                    }, 100);
                });
            });

            // Call processPackets multiple times rapidly
            const promise1 = dataService.processPackets();
            const promise2 = dataService.processPackets();
            const promise3 = dataService.processPackets();

            await Promise.all([promise1, promise2, promise3]);

            // Should only process once (smoothing API called once)
            expect(smoothingCallCount).toBe(1);
        });

        test('should allow processing after previous call completes', async () => {
            let processCount = 0;
            global.fetch = jest.fn().mockImplementation(() => {
                processCount++;
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                        gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                    })
                });
            });

            // First packet
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            await dataService.processPackets();
            expect(processCount).toBe(1);

            // Second packet after first completes
            dataService.pendingLeftData = {
                gyroData: [0.6, 0.6, 0.6, 0.6],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.6, 0.6, 0.6, 0.6],
                accelData: [0, 0, 0, 0]
            };

            await dataService.processPackets();
            expect(processCount).toBe(2);
        });
    });

    describe('Pending data capture', () => {
        test('should capture pending data immediately to prevent race conditions', async () => {
            const initialLeft = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            const initialRight = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            dataService.pendingLeftData = initialLeft;
            dataService.pendingRightData = initialRight;

            // Make smoothing slow
            global.fetch = jest.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: async () => ({
                                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                                gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                            })
                        });
                    }, 50);
                });
            });

            const processPromise = dataService.processPackets();

            // Simulate new packet arriving during processing
            // Should not affect current processing
            await new Promise(resolve => setTimeout(resolve, 10));
            
            dataService.pendingLeftData = {
                gyroData: [0.9, 0.9, 0.9, 0.9],
                accelData: [1, 1, 1, 1]
            };
            dataService.pendingRightData = {
                gyroData: [0.9, 0.9, 0.9, 0.9],
                accelData: [1, 1, 1, 1]
            };

            await processPromise;

            // Processing should have used the initial data, not the new data
            const fetchCall = global.fetch.mock.calls[0][1];
            const body = JSON.parse(fetchCall.body);
            
            expect(body.gyroLeft).toEqual([0.5, 0.5, 0.5, 0.5]);
            expect(body.gyroRight).toEqual([0.5, 0.5, 0.5, 0.5]);
        });

        test('should clear pending data immediately after capture', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            const processPromise = dataService.processPackets();

            // Check that data is cleared quickly (not waiting for smoothing)
            await new Promise(resolve => setTimeout(resolve, 10));
            
            expect(dataService.pendingLeftData).toBeNull();
            expect(dataService.pendingRightData).toBeNull();

            await processPromise;
        });
    });

    describe('Smoothing API error handling', () => {
        test('should handle API timeout gracefully', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.6, 0.6, 0.6, 0.6],
                accelData: [0, 0, 0, 0]
            };

            // Mock slow API (will timeout)
            global.fetch = jest.fn().mockImplementation(() => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: async () => ({
                                gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                                gyro_right_smoothed: [0.6, 0.6, 0.6, 0.6]
                            })
                        });
                    }, 1000); // Longer than timeout
                });
            });

            // Should not throw, should use fallback
            await expect(dataService.processPackets()).resolves.not.toThrow();

            // Should have cleared processing flag
            expect(dataService.isProcessing).toBe(false);
        });

        test('should use unsmoothed data as fallback on API error', async () => {
            const originalLeft = [0.5, 0.52, 0.48, 0.51];
            const originalRight = [0.6, 0.62, 0.58, 0.61];

            dataService.pendingLeftData = {
                gyroData: originalLeft,
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: originalRight,
                accelData: [0, 0, 0, 0]
            };

            // Mock API failure
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            // Should not throw
            await expect(dataService.processPackets()).resolves.not.toThrow();

            // Should have cleared processing flag
            expect(dataService.isProcessing).toBe(false);
        });

        test('should handle invalid smoothing response (wrong length)', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            // Mock invalid response (wrong array length)
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    gyro_left_smoothed: [0.5, 0.5], // Only 2 values!
                    gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                })
            });

            // Should fallback to unsmoothed data
            await expect(dataService.processPackets()).resolves.not.toThrow();
        });

        test('should handle NaN/Infinity in smoothing response', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            // Mock invalid values
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    gyro_left_smoothed: [0.5, NaN, 0.5, Infinity],
                    gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                })
            });

            // Should fallback to unsmoothed data
            await expect(dataService.processPackets()).resolves.not.toThrow();
        });

        test('should clear processing flag on error', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };

            // Mock error
            global.fetch = jest.fn().mockRejectedValue(new Error('Test error'));

            await dataService.processPackets();

            // Processing flag should be cleared
            expect(dataService.isProcessing).toBe(false);
        });
    });

    describe('Data mutation prevention', () => {
        test('should not mutate original gyroData arrays', async () => {
            const originalLeft = [0.5, 0.5, 0.5, 0.5];
            const originalRight = [0.5, 0.5, 0.5, 0.5];

            dataService.pendingLeftData = {
                gyroData: originalLeft,
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = {
                gyroData: originalRight,
                accelData: [0, 0, 0, 0]
            };

            await dataService.processPackets();

            // Original arrays should not be modified
            // (gain and threshold modify in place, but we make copies in processPackets)
            expect(originalLeft).toEqual([0.5, 0.5, 0.5, 0.5]);
            expect(originalRight).toEqual([0.5, 0.5, 0.5, 0.5]);
        });
    });

    describe('Packet arrival scenarios', () => {
        test('should handle rapid successive packet pairs', async () => {
            let processCount = 0;
            global.fetch = jest.fn().mockImplementation(() => {
                processCount++;
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        gyro_left_smoothed: [0.5, 0.5, 0.5, 0.5],
                        gyro_right_smoothed: [0.5, 0.5, 0.5, 0.5]
                    })
                });
            });

            // Simulate 5 rapid packet pairs
            for (let i = 0; i < 5; i++) {
                dataService.pendingLeftData = {
                    gyroData: [0.5, 0.5, 0.5, 0.5],
                    accelData: [0, 0, 0, 0]
                };
                dataService.pendingRightData = {
                    gyroData: [0.5, 0.5, 0.5, 0.5],
                    accelData: [0, 0, 0, 0]
                };

                await dataService.processPackets();
            }

            // Should have processed all 5
            expect(processCount).toBe(5);
        });

        test('should handle when left packet arrives but right is null', async () => {
            dataService.pendingLeftData = {
                gyroData: [0.5, 0.5, 0.5, 0.5],
                accelData: [0, 0, 0, 0]
            };
            dataService.pendingRightData = null;

            await dataService.processPackets();

            // Should return early without processing
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});
