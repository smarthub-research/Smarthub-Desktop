const calculationUtils = require('../calculationUtils')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const testUtils = require("./testUtils")

describe('getDisplacement', () => {
    beforeEach(() => {
    // Initialize test state before each test
        calculationUtils.resetState();
    });
    
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
        testUtils.assertArraysClose(dist, expected, 12, 'getDisplacement-small')
    })

    test("with all smoothed data", () => {
        const t = testData.elapsed_time_s
        let left = testData.gyro_left_smoothed
        let right = testData.gyro_right_smoothed

        right = right.map((val) => {return val * 1.12})
        left = left.map((val) => {return val * 1.13})

        const dist = calculationUtils.getDisplacement(t, left, right);
        const expected = testData.displacement_m
        testUtils.assertArraysClose(dist, expected, 12, 'getDisplacement-full', 10)
    })

    test("with all smoothed data 1.125", () => {
        const t = testData125.elapsed_time_s
        let left = testData125.gyro_left_smoothed
        let right = testData125.gyro_right_smoothed

        right = right.map((val) => {return val * 1.125})
        left = left.map((val) => {return val*1.125})

        const dist = calculationUtils.getDisplacement(t, left, right);
        const expected = testData125.displacement_m
        testUtils.assertArraysClose(dist, expected, 12, 'getDisplacement-full-125', 10)
    })
});

