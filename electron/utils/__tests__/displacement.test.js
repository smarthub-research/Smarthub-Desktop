const http = require('http');
const calculationUtils = require('../calculationUtils')
const dataService = require('../../services/dataService')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const { exportTestResults } = require('./exportTestResults')

describe("Displacement test with supabase data", () => {
    test("displacement should displace", async () => {

        function checkArray(result, expected) {
            result.forEach((value, index) => {
                expect(value).toBeCloseTo(expected[index], 0);
            });
        }

        const timeStamp = testData.elapsed_time_s
        const gyroLeft = testData.gyro_left
        const gyroRight = testData.gyro_right
        const accel_left = testData.accel_left
        const accel_right = testData.accel_right
        
        expect(timeStamp).toStrictEqual(testData.elapsed_time_s)
        expect(gyroLeft).toStrictEqual(testData.gyro_left)
        expect(gyroRight).toStrictEqual(testData.gyro_right)

        const smoothedData = await dataService.smoothData({"gyroData": gyroRight}, {"gyroData": gyroLeft}, timeStamp)

        let gyroLeftSmoothed = smoothedData.gyro_left_smoothed
        let gyroRightSmoothed = smoothedData.gyro_right_smoothed

        let exepectedLeftSmoothed = testData.gyro_left_smoothed
        let expectedRightSmoothed = testData.gyro_right_smoothed

        console.log("RESULTS: ", gyroLeftSmoothed.slice(500, 550))
        // console.log("BEFORE: ", gyroLeft)
        console.log("EXPECTED: ", exepectedLeftSmoothed.slice(500, 550))

        const response = dataService.applyGain(gyroLeftSmoothed, gyroRightSmoothed)
        gyroLeftSmoothed = response.left
        gyroRightSmoothed = response.right

        checkArray(gyroLeftSmoothed, exepectedLeftSmoothed)

        const result = calculationUtils.calc(timeStamp.slice(0, 10), gyroLeft.slice(0,10), gyroRight.slice(0,10), accel_left, accel_right, 24)
        // const testResults = calculationUtils.calc(timeStamp.slice(0, 10), expectedGyroLeft.slice(0, 10), expectedGyroRight.slice(0, 10), accel_left, accel_right, 24)
        // console.log(result)

        // expect(result.gyroLeft).toStrictEqual(gyroLeft.slice(0, 10))
        // expect(testResults).toStrictEqual(result)

        // console.log("EXPECTED: ", testData.distance_m.slice(0,10))
        // console.log("RESULTS: ", result.displacement)

        // expect(timeStamp).toStrictEqual(expectedResults.test_files.timeStamp)
        expect(result.displacement).toStrictEqual(testData.distance_m.slice(0,10));
    })

    describe('getDisplacement', () => {
        test("with 4 smoothed data", () => {
            const t = [
                0.31000976001515107, 
                0.32471564236809225,
                0.33942152472103343,
                0.3541274070739746]
            const left = [
                -0.04287599841582226*1.13, 
                -0.04542933593765827*1.13,
                -0.03638935237260333*1.13, 
                -0.039255624818455535*1.13
            ]
            const right = [
                -0.032062173630695655*1.12, 
                -0.03649130465390851*1.12,
                -0.03161470191108549*1.12, 
                -0.03726532600237976*1.12
            ]
            const dist = calculationUtils.getDisplacement(t, left, right);
            const expected = [
                    0, 
                    -0.00018906455488032007,
                    -0.0003957131520753545,
                    -0.0005672268784075622,
            ]
            expect(dist).toStrictEqual(expected)
        })

        test("with all smoothed data", () => {
            const t = testData.elapsed_time_s
            let left = testData.gyro_left_smoothed
            let right = testData.gyro_right_smoothed

            right = right.map((val) => {return val * 1.12})
            left = left.map((val) => {return val*1.13})

            const dist = calculationUtils.getDisplacement(t, left, right);
            const expected = testData.displacement_m
            expect(dist).toStrictEqual(expected)
        })

        test("with all smoothed data 1.125", () => {
            const t = testData125.elapsed_time_s
            let left = testData125.gyro_left_smoothed
            let right = testData125.gyro_right_smoothed

            right = right.map((val) => {return val * 1.125})
            left = left.map((val) => {return val*1.125})

            const dist = calculationUtils.getDisplacement(t, left, right);
            const expected = testData125.displacement_m
            expect(dist).toStrictEqual(expected)
        })
    });

    describe('getVelocity', () => {
        test('with real data', () => {
            const t = testData.elapsed_time_s
            let left = testData.gyro_left_smoothed
            let right = testData.gyro_right_smoothed

            right = right.map((val) => {return val * 1.12})
            left = left.map((val) => {return val*1.13})

            const vel = calculationUtils.getVelocity(left, right);
            const expected = testData.velocity
            expect(vel).toStrictEqual(expected)
        });

        test('with real data 1.125', () => {
            const t = testData125.elapsed_time_s
            let left = testData125.gyro_left_smoothed
            let right = testData125.gyro_right_smoothed

            right = right.map((val) => {return val * 1.125})
            left = left.map((val) => {return val*1.125})

            const vel = calculationUtils.getVelocity(left, right);
            const expected = testData125.velocity
            expect(vel).toStrictEqual(expected)
        });
    });

    describe('getHeading', () => {
        test('integrates heading based on differential velocity', () => {
            const t = testData.elapsed_time_s
            let left = testData.gyro_left_smoothed
            let right = testData.gyro_right_smoothed

            right = right.map((val) => {return val * 1.12})
            left = left.map((val) => {return val*1.13})

            const heading = calculationUtils.getHeading(t, left, right);
            const expected = testData.heading_deg

            expect(heading).toStrictEqual(expected)
        });

        test('integrates heading based on differential velocity 1.125', () => {
            const t = testData125.elapsed_time_s
            let left = testData125.gyro_left_smoothed
            let right = testData125.gyro_right_smoothed

            right = right.map((val) => {return val * 1.125})
            left = left.map((val) => {return val*1.125})

            const heading = calculationUtils.getHeading(t, left, right);
            const expected = testData125.heading_deg

            expect(heading).toStrictEqual(expected)
        });
    });

    describe('getTraj', () => {
        test('integrates x,y from velocity and heading', () => {
            const t = testData.elapsed_time_s
            let left = testData.gyro_left_smoothed
            let right = testData.gyro_right_smoothed

            right = right.map((val) => {return val * 1.12})
            left = left.map((val) => {return val*1.13})

            const vel = calculationUtils.getVelocity(left, right)
            const heading_deg = calculationUtils.getHeading(t, left, right);
            const traj = calculationUtils.getTraj(vel, heading_deg, t)
            const expectedX = testData.traj_x
            const expectedY = testData.traj_y

            expect(traj.y.length).toStrictEqual(expectedY.length - 1)
            expect(traj.y).toStrictEqual(expectedY.slice(0, -1))
            expect(traj.x).toStrictEqual(expectedX.slice(0, -1))
        });

        test('integrates x,y from velocity and heading 1.125', () => {
            const t = testData125.elapsed_time_s
            let left = testData125.gyro_left_smoothed
            let right = testData125.gyro_right_smoothed

            right = right.map((val) => {return val * 1.125})
            left = left.map((val) => {return val*1.125})

            const vel = calculationUtils.getVelocity(left, right)
            const heading_deg = calculationUtils.getHeading(t, left, right);
            const traj = calculationUtils.getTraj(vel, heading_deg, t)
            const expectedX = testData125.traj_x
            const expectedY = testData125.traj_y

            expect(traj.y.length).toStrictEqual(expectedY.length - 1)
            expect(traj.y).toStrictEqual(expectedY.slice(0, -1))
            expect(traj.x).toStrictEqual(expectedX.slice(0, -1))
        });
    });

    describe('Export Test Results', () => {
        test('export results to JSON file', async () => {
            const exportResult = await exportTestResults({
                elapsed_time_s: testData.elapsed_time_s,
                gyro_left: testData.gyro_left,
                gyro_right: testData.gyro_right,
                accel_left: testData.accel_left,
                accel_right: testData.accel_right,
                gain_left: 1.13,
                gain_right: 1.12,
                outputFileName: 'exported_test_results.json'
            });

            expect(exportResult.success).toBe(true);
            expect(exportResult.dataPoints).toBe(testData.elapsed_time_s.length);
            expect(exportResult.results).toHaveProperty('elapsed_time_s');
            expect(exportResult.results).toHaveProperty('gyro_left');
            expect(exportResult.results).toHaveProperty('gyro_right');
            expect(exportResult.results).toHaveProperty('gyro_left_smoothed');
            expect(exportResult.results).toHaveProperty('gyro_right_smoothed');
            expect(exportResult.results).toHaveProperty('displacement_m');
            expect(exportResult.results).toHaveProperty('velocity');
            expect(exportResult.results).toHaveProperty('heading_deg');
            expect(exportResult.results).toHaveProperty('traj_x');
            expect(exportResult.results).toHaveProperty('traj_y');
        }, 30000); // 30 second timeout for this test
    });

})