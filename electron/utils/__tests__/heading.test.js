const calculationUtils = require('../calculationUtils')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const testUtils = require("./testUtils")

describe('getHeading', () => {
    beforeEach(() => {
        // Initialize test state before each test
        calculationUtils.resetState();
    });

    test('integrates heading based on differential velocity', () => {
        const t = testData.elapsed_time_s
        let left = testData.gyro_left_smoothed
        let right = testData.gyro_right_smoothed

        right = right.map((val) => {return val * 1.12})
        left = left.map((val) => {return val*1.13})

        const heading = calculationUtils.getHeading(t, left, right);
        const expected = testData.heading_deg
        testUtils.assertArraysClose(heading, expected, 12, 'getHeading')
    });

    test('integrates heading based on differential velocity 1.125', () => {
        const t = testData125.elapsed_time_s
        let left = testData125.gyro_left_smoothed
        let right = testData125.gyro_right_smoothed

        right = right.map((val) => {return val * 1.125})
        left = left.map((val) => {return val*1.125})

        const heading = calculationUtils.getHeading(t, left, right);
        const expected = testData125.heading_deg
        testUtils.assertArraysClose(heading, expected, 12, 'getHeading-125')
    });
});