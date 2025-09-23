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
      data[16] = 144; data[17] = 1; // 400 -> 4

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

    test('handles all negative accel and gyro values', () => {
      // All sign bits set (0b1111)
      const data = new Array(18).fill(0);
      data[0] = 0b1111; // All accel negative
      data[1] = 0b1111; // All gyro negative
      // accel values: [500, 1500, 2500, 3500] -> [0.5, 1.5, 2.5, 3.5] after /1000
      data[2] = 244; data[3] = 1;   // 500
      data[4] = 220; data[5] = 5;   // 1500
      data[6] = 196; data[7] = 9;   // 2500
      data[8] = 172; data[9] = 13;  // 3500
      // gyro values: [50, 150, 250, 350] -> [0.5, 1.5, 2.5, 3.5] after /100
      data[10] = 50; data[11] = 0;  // 50
      data[12] = 150; data[13] = 0; // 150
      data[14] = 250; data[15] = 0; // 250
      data[16] = 94; data[17] = 1;  // 350

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([-0.5, -1.5, -2.5, -3.5]);
      expect(gyro).toEqual([-0.5, -1.5, -2.5, -3.5]);
    });

    test('handles zero values correctly', () => {
      // Test with all zero data
      const data = new Array(18).fill(0);
      
      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([0, 0, 0, 0]);
      expect(gyro).toEqual([0, 0, 0, 0]);
    });

    test('handles maximum unsigned 16-bit values', () => {
      // Test with maximum values (65535)
      const data = new Array(18).fill(0);
      data[0] = 0b0000; // All positive
      data[1] = 0b0000;
      // Set all accel values to 65535 (0xFF 0xFF)
      for (let i = 0; i < 4; i++) {
        data[2 + i * 2] = 255;     // LSB
        data[2 + i * 2 + 1] = 255; // MSB
      }
      // Set all gyro values to 65535
      for (let i = 0; i < 4; i++) {
        data[10 + i * 2] = 255;     // LSB
        data[10 + i * 2 + 1] = 255; // MSB
      }

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([65.535, 65.535, 65.535, 65.535]); // 65535/1000
      expect(gyro).toEqual([655.35, 655.35, 655.35, 655.35]);  // 65535/100
    });

    test('handles mixed sign patterns correctly', () => {
      // Complex sign pattern: accel 0b1010 (2nd and 4th negative), gyro 0b0101 (1st and 3rd negative)
      const data = new Array(18).fill(0);
      data[0] = 0b1010;
      data[1] = 0b0101;
      // accel values: [1234, 2345, 3456, 4567]
      data[2] = 210; data[3] = 4;   // 1234
      data[4] = 41;  data[5] = 9;   // 2345
      data[6] = 128; data[7] = 13;  // 3456
      data[8] = 215; data[9] = 17;  // 4567
      // gyro values: [123, 234, 345, 456]
      data[10] = 123; data[11] = 0; // 123
      data[12] = 234; data[13] = 0; // 234
      data[14] = 89;  data[15] = 1; // 345
      data[16] = 200; data[17] = 1; // 456

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([1.234, -2.345, 3.456, -4.567]);
      expect(gyro).toEqual([-1.23, 2.34, -3.45, 4.56]);
    });

    test('handles individual bit patterns for sign bytes', () => {
      // Test each individual bit pattern
      const testCases = [
        { accelSign: 0b0001, gyroSign: 0b0001, desc: 'first bit only' },
        { accelSign: 0b0010, gyroSign: 0b0010, desc: 'second bit only' },
        { accelSign: 0b0100, gyroSign: 0b0100, desc: 'third bit only' },
        { accelSign: 0b1000, gyroSign: 0b1000, desc: 'fourth bit only' },
      ];

      testCases.forEach(({ accelSign, gyroSign, desc }) => {
        const data = new Array(18).fill(0);
        data[0] = accelSign;
        data[1] = gyroSign;
        
        // Use simple values: 1000, 2000, 3000, 4000 for accel and 100, 200, 300, 400 for gyro
        data[2] = 232; data[3] = 3;   // 1000
        data[4] = 208; data[5] = 7;   // 2000
        data[6] = 184; data[7] = 11;  // 3000
        data[8] = 160; data[9] = 15;  // 4000
        data[10] = 100; data[11] = 0; // 100
        data[12] = 200; data[13] = 0; // 200
        data[14] = 44;  data[15] = 1; // 300
        data[16] = 144; data[17] = 1; // 400

        const accel = [];
        const gyro = [];
        decodeSensorData(data, accel, gyro);

        // Check which values should be negative based on bit pattern
        const expectedAccel = [1, 2, 3, 4];
        const expectedGyro = [1, 2, 3, 4];
        
        for (let i = 0; i < 4; i++) {
          if (accelSign & (1 << i)) {
            expectedAccel[i] *= -1;
          }
          if (gyroSign & (1 << i)) {
            expectedGyro[i] *= -1;
          }
        }

        expect(accel).toEqual(expectedAccel);
        expect(gyro).toEqual(expectedGyro);
      });
    });

    test('handles LSB-first byte ordering correctly', () => {
      // Test specific byte ordering with known values
      const data = new Array(18).fill(0);
      data[0] = 0b0000; // All positive
      data[1] = 0b0000;
      
      // Test value 0x0102 (258) -> LSB=0x02, MSB=0x01
      data[2] = 0x02; data[3] = 0x01;  // Should be 258 -> 0.258
      // Test value 0x0304 (772) -> LSB=0x04, MSB=0x03
      data[4] = 0x04; data[5] = 0x03;  // Should be 772 -> 0.772
      // Test value 0x0506 (1286) -> LSB=0x06, MSB=0x05
      data[6] = 0x06; data[7] = 0x05;  // Should be 1286 -> 1.286
      // Test value 0x0708 (1800) -> LSB=0x08, MSB=0x07
      data[8] = 0x08; data[9] = 0x07;  // Should be 1800 -> 1.8

      // Similar for gyro
      data[10] = 0x0A; data[11] = 0x09; // 0x090A = 2314 -> 23.14
      data[12] = 0x0C; data[13] = 0x0B; // 0x0B0C = 2828 -> 28.28
      data[14] = 0x0E; data[15] = 0x0D; // 0x0D0E = 3342 -> 33.42
      data[16] = 0x10; data[17] = 0x0F; // 0x0F10 = 3856 -> 38.56

      const accel = [];
      const gyro = [];
      decodeSensorData(data, accel, gyro);

      expect(accel).toEqual([0.258, 0.772, 1.286, 1.8]);
      expect(gyro).toEqual([23.14, 28.28, 33.42, 38.56]);
    });

    test('modifies provided arrays in place', () => {
      // Test that function modifies the provided arrays rather than returning new ones
      const data = new Array(18).fill(0);
      data[0] = 0b0000;
      data[1] = 0b0000;
      
      // Simple test values
      data[2] = 232; data[3] = 3;   // 1000 -> 1
      data[4] = 208; data[5] = 7;   // 2000 -> 2
      data[6] = 184; data[7] = 11;  // 3000 -> 3
      data[8] = 160; data[9] = 15;  // 4000 -> 4
      data[10] = 100; data[11] = 0; // 100 -> 1
      data[12] = 200; data[13] = 0; // 200 -> 2
      data[14] = 44;  data[15] = 1; // 300 -> 3
      data[16] = 144; data[17] = 1; // 400 -> 4

      const accel = [];
      const gyro = [];
      const originalAccel = accel;
      const originalGyro = gyro;
      
      decodeSensorData(data, accel, gyro);

      // Verify arrays are the same reference (modified in place)
      expect(accel).toBe(originalAccel);
      expect(gyro).toBe(originalGyro);
      expect(accel.length).toBe(4);
      expect(gyro.length).toBe(4);
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
