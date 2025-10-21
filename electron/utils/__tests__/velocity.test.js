const calculationUtils = require('../calculationUtils')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const testUtils = require("./testUtils")

describe('getVelocity', () => {
    beforeEach(() => {
        // Initialize test state before each test
        calculationUtils.resetState();
    });

    test('with real data', () => {
        const t = testData.elapsed_time_s
        let left = testData.gyro_left_smoothed
        let right = testData.gyro_right_smoothed

        right = right.map((val) => {return val * 1.12})
        left = left.map((val) => {return val*1.13})

        const vel = calculationUtils.getVelocity(left, right);
        const expected = testData.velocity
        testUtils.assertArraysClose(vel, expected, 12, 'getVelocity')
    });

    test('with real data 1.125', () => {
        const t = testData125.elapsed_time_s
        let left = testData125.gyro_left_smoothed
        let right = testData125.gyro_right_smoothed

        right = right.map((val) => {return val * 1.125})
        left = left.map((val) => {return val*1.125})

        const vel = calculationUtils.getVelocity(left, right);
        const expected = testData125.velocity
        testUtils.assertArraysClose(vel, expected, 12, 'getVelocity-125')
    });
});