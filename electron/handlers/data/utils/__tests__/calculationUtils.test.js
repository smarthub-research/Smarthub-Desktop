// Unit tests for calculationUtils.js
// We mock config/constants and services/calibrationService to control values.
// Use absolute resolved paths so the mock matches the module required by the SUT.
const path = require('path');
const constantsAbs = require.resolve(path.join(__dirname, '../../../../config/constants'));
const calibrationSvcAbs = require.resolve(path.join(__dirname, '../../../../services/calibrationService'));

jest.mock(constantsAbs, () => ({
  IN_TO_M: 0.0254,
  WHEEL_DIAM_IN: 24, // 4 inch wheel
}), { virtual: false });

jest.mock(calibrationSvcAbs, () => ({
  calibration: {
    wheel_distance: 26, // inches
  },
}), { virtual: false });

const {
  decodeSensorData,
  calc,
  getDisplacement,
  getVelocity,
  getHeading,
  getTraj,
} = require('../calculationUtils');

describe('calculationUtils', () => {
  beforeEach(() => {
    // Reset persistent state in calculationUtils
    const calcUtils = require('../calculationUtils');
    calcUtils.resetState();
  });
  describe('decodeSensorData', () => {
    test('decodes unsigned values without sign bits (all positive)', () => {
      // Prepare a frame with 4 accel and 4 gyro readings
      // accel sign bits (byte 0): 0 -> all positive
      // gyro sign bits  (byte 1): 0 -> all positive
      const data = new Array(18).fill(0);
      data[0] = 0b0000;
      data[1] = 0b0000;
      // accel values LSB first: [1000, 2000, 3000, 4000] -> [1,2,3,4] after /1000
  data[2] = 232; data[3] = 3;   // 1000 -> 1
      data[4] = 208; data[5] = 7;   // 2000
      data[6] = 184; data[7] = 11;  // 3000
      data[8] = 160; data[9] = 15;  // 4000
      // gyro values LSB first: [100, 200, 300, 400] -> [1,2,3,4] after /100
      data[10] = 100; data[11] = 0; // 100 -> +1
  data[12] = 200; data[13] = 0; // 200 -> 2
      data[14] = 44;  data[15] = 1; // 300 -> +3
      data[16] = 144; data[17] = 1; // 400 -> -4 after sign

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([1, 2, 3, 4]);
      expect(gyro).toEqual([1, 2, 3, 4]);
    });

    test('applies per-bit sign for accel and gyro', () => {
      // accel sign bits 0b0001: only first accel negative
      // gyro sign bits  0b1010: 2nd and 4th gyro negative
      const data = new Array(18).fill(0);
      data[0] = 0b0001;
      data[1] = 0b1010;
      // accel 1000..4000
      data[2] = 232; data[3] = 3;
      data[4] = 208; data[5] = 7;
      data[6] = 184; data[7] = 11;
      data[8] = 160; data[9] = 15;
      // gyro 100..400
      data[10] = 100; data[11] = 0;
      data[12] = 200; data[13] = 0;
      data[14] = 44;  data[15] = 1;
      data[16] = 144; data[17] = 1;

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([-1, 2, 3, 4]);
      expect(gyro).toEqual([1, -2, 3, -4]);
    });
  });

  describe('getDisplacement', () => {
    test('integrates velocity from rotations over time', () => {
      const t = [0, 1];
      const rot_l = [1, 2];
      const rot_r = [1, 2];
      const dist = getDisplacement(t, rot_l, rot_r);
      expect(dist[0]).toBe(0);
      expect(dist[1]).toBeCloseTo(0.3048);
    });

    test('if only 1 point of data', () => {
      const t = [0];
      const rot_l = [1];
      const rot_r = [1];
      const dist = getDisplacement(t, rot_l, rot_r);
      expect(dist[0]).toBe(0);
    });

    test('if only 4 point of data', () => {
      const t = [0, 1, 2, 3];
      const rot_l = [1, 2, -1, 12];
      const rot_r = [1, 2, 3, 8];
      const dist = getDisplacement(t, rot_l, rot_r);
      expect(dist[0]).toBe(0);
      expect(dist[1]).toBeCloseTo(0.3048);
      expect(dist[2]).toBeCloseTo(0.9144);
      expect(dist[3]).toBeCloseTo(1.524);
    });
  });

  describe('getVelocity', () => {
    test('computes average wheel linear velocity', () => {
      const rot_l = [1, 2, -1, 12];
      const rot_r = [1, 2, 3, 8];
      const vel = getVelocity(rot_l, rot_r);
      expect(vel[0]).toBeCloseTo(0.3048);
      expect(vel[1]).toBeCloseTo(0.6096);
      expect(vel[2]).toBeCloseTo(0.3048);
      expect(vel[3]).toBeCloseTo(3.048);
    });
  });

  describe('getHeading', () => {
    test('integrates heading based on differential velocity', () => {
      const t = [0, 1, 2, 3];
      const rot_l = [1, 2, 1, 5];
      const rot_r = [2, 2, 4, 5];
      const heading = getHeading(t, rot_l, rot_r);
      expect(heading[0]).toBe(0);
      expect(heading[1]).toBeCloseTo(26.4442, 4);
      expect(heading[2]).toBeCloseTo(26.4442, 4);
      expect(heading[3]).toBeCloseTo(105.7768, 4);
    });
  });

  describe('getTraj', () => {
    test('integrates x,y from velocity and heading', () => {
      const v = [1, 1, 1]; // m/s
      const heading = [0, 0, 0]; // deg
      const t = [0, 1, 2];
      const traj = getTraj(v, heading, t);
      expect(traj.x).toEqual([0, 1, 2]);
      expect(traj.y).toEqual([0, 0, 0]);
    });

    test('handles non-zero heading', () => {
      const v = [1, 1, 1];
      const heading = [0, 90, 90];
      const t = [0, 1, 2];
      const traj = getTraj(v, heading, t);
      expect(traj.x[1]).toBeCloseTo(1, 4);
      expect(traj.y[1]).toBeCloseTo(0, 4);
      // second step uses heading 90 deg -> dy += 1, x unchanged
      expect(traj.x[2]).toBeCloseTo(1, 4);
      expect(traj.y[2]).toBeCloseTo(1, 4);
    });

    test('handles negative velocity and heading', () => {
      const v = [1, -1, 2, 4];
      const heading = [0, 90, 180, 270];
      const t = [0, 1, 2, 3];
      const traj = getTraj(v, heading, t);
      expect(traj.x[0]).toBeCloseTo(0, 4);
      expect(traj.y[0]).toBeCloseTo(0, 4);

      expect(traj.x[1]).toBeCloseTo(1, 4);
      expect(traj.y[1]).toBeCloseTo(0, 4);

      expect(traj.x[2]).toBeCloseTo(1, 4);
      expect(traj.y[2]).toBeCloseTo(-1, 4);

      expect(traj.x[3]).toBeCloseTo(-1, 4);
      expect(traj.y[3]).toBeCloseTo(-1, 4);
    });
  });

  describe('calc', () => {
    test('produces all outputs with sliced first sample', () => {
      const t = [0, 1, 2];
      const rot_l = [1, 1, 1];
      const rot_r = [1, 1, 1];
      const acc_l = [0, 0, 0];
      const acc_r = [0, 0, 0];
      const res = calc(t, rot_l, rot_r, acc_l, acc_r);
      expect(res.gyro_left).toEqual([1,1, 1]);
      expect(res.gyro_right).toEqual([1,1, 1]);
      expect(res.accel_left).toEqual([0,0, 0]);
      expect(res.accel_right).toEqual([0,0, 0]);
      expect(res.velocity.length).toBe(3);
      expect(res.displacement.length).toBe(3);
      expect(res.heading.length).toBe(3);
      expect(res.trajectory_x.length).toBe(3);
      expect(res.trajectory_y.length).toBe(3);
      expect(res.timeStamp).toEqual([0, 1, 2]);
    });
  });
});
