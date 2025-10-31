const calculationUtils = require('../calculationUtils')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const testUtils = require("./testUtils")
const dataService = require('../../services/dataService')

describe("getDistance", () => {
    beforeEach(() => {
        // Initialize test state before each test
        calculationUtils.resetState();
    });

    test("with all smoothed data", () => {
        const t = testData.elapsed_time_s
        let left = testData.gyro_left_smoothed
        let right = testData.gyro_right_smoothed

        right = right.map((val) => {return val * 1.12})
        left = left.map((val) => {return val * 1.13})

        const dist = calculationUtils.getDistance(t, left, right);
        const expected = testData.distance_m
        testUtils.assertArraysClose(dist, expected, 12, 'getDistance-full', 10)
    })

    test("with all smoothed data 1.125", () => {
        const t = testData125.elapsed_time_s
        let left = testData125.gyro_left_smoothed
        let right = testData125.gyro_right_smoothed

        right = right.map((val) => {return val * 1.125})
        left = left.map((val) => {return val*1.125})

        const dist = calculationUtils.getDistance(t, left, right);
        const expected = testData125.distance_m
        testUtils.assertArraysClose(dist, expected, 12, 'getDistance-full-125', 10)
    })

    test("full integration", async () => {
        const t = testData.elapsed_time_s
        let left = testData.gyro_left
        let right = testData.gyro_right

        const smoothedData = await dataService.smoothData(left, right, t)
            
        // Create copies to avoid mutation issues
        const gyroLeftSmoothed = [...smoothedData.gyro_left_smoothed];
        const gyroRightSmoothed = [...smoothedData.gyro_right_smoothed];

        const gainedVals = dataService.applyGain(gyroLeftSmoothed, gyroRightSmoothed)

        const dist = calculationUtils.getDistance(t, gainedVals.left, gainedVals.right);
        const expected = testData.distance_m
        testUtils.assertArraysClose(dist, expected, 2, 'getDistance-integration', 10)
        expect(dist.at(-1)).toStrictEqual(expected.at(-1))
    })

    test("full integration 125", async () => {
        const t = testData125.elapsed_time_s
        let left = testData125.gyro_left
        let right = testData125.gyro_right

        const smoothedData = await dataService.smoothData(left, right, t)
            
        // Create copies to avoid mutation issues
        const gyroLeftSmoothed = [...smoothedData.gyro_left_smoothed];
        const gyroRightSmoothed = [...smoothedData.gyro_right_smoothed];

        const gainedVals = dataService.applyGain(gyroLeftSmoothed, gyroRightSmoothed)

        const dist = calculationUtils.getDistance(t, gainedVals.left, gainedVals.right);
        const expected = testData125.distance_m

        testUtils.assertArraysClose(dist, expected, 2, 'getDistance-integration', 10)
        expect(dist.at(-1)).toStrictEqual(expected.at(-1))
    })
})