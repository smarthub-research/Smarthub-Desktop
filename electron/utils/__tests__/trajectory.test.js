const calculationUtils = require('../calculationUtils')
const testData = require('./testing.json')
const testData125 = require('./test125.json')
const testUtils = require("./testUtils")

describe('getTraj', () => {
    beforeEach(() => {
        // Initialize test state before each test
        calculationUtils.resetState();
    });
        
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

        // check lengths and compare with concise helper to avoid huge diffs
        expect(traj.y.length).toStrictEqual(expectedY.length - 1)
        testUtils.assertArraysClose(traj.y, expectedY.slice(0, -1), 12, 'traj.y')
        testUtils.assertArraysClose(traj.x, expectedX.slice(0, -1), 12, 'traj.x')
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
        testUtils.assertArraysClose(traj.y, expectedY.slice(0, -1), 12, 'traj.y-125')
        testUtils.assertArraysClose(traj.x, expectedX.slice(0, -1), 12, 'traj.x-125')
    });
});