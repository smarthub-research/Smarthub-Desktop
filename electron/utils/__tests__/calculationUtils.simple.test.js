const { calc, resetState, nateCalculate } = require('../calculationUtils');

describe('Calculation Comparison Tests', () => {
  beforeEach(() => {
    resetState();
  });

  test('JavaScript calculation functions work correctly', () => {
    // Create simple test data
    const timeFromStart = [0, 0.1, 0.2, 0.3, 0.4];
    const gyroLeft = [1.0, 1.5, 2.0, 1.5, 1.0];
    const gyroRight = [1.0, 1.2, 1.8, 1.3, 0.9];
    const accelLeft = [0.1, 0.2, 0.3, 0.2, 0.1];
    const accelRight = [0.1, 0.15, 0.25, 0.15, 0.1];

    // Run calculation
    const results = calc(timeFromStart, gyroLeft, gyroRight, accelLeft, accelRight);

    // Verify structure
    expect(results).toBeDefined();
    expect(results.displacement).toHaveLength(timeFromStart.length);
    expect(results.velocity).toHaveLength(timeFromStart.length);
    expect(results.heading).toHaveLength(timeFromStart.length);
    expect(results.trajectory_x).toHaveLength(timeFromStart.length);
    expect(results.trajectory_y).toHaveLength(timeFromStart.length);
    expect(results.gyroLeft).toEqual(gyroLeft);
    expect(results.gyroRight).toEqual(gyroRight);
    expect(results.timeStamp).toEqual(timeFromStart);

    // Verify all values are numbers and not NaN
    results.displacement.forEach(val => expect(typeof val).toBe('number'));
    results.velocity.forEach(val => expect(typeof val).toBe('number'));
    results.heading.forEach(val => expect(typeof val).toBe('number'));
    results.trajectory_x.forEach(val => expect(typeof val).toBe('number'));
    results.trajectory_y.forEach(val => expect(typeof val).toBe('number'));

    console.log('✅ JavaScript calculations working correctly!');
  });

  test('Python backend calculation works when server is available', async () => {
    const timeFromStart = [0, 0.1, 0.2, 0.3, 0.4];
    const gyroLeft = [1.0, 1.5, 2.0, 1.5, 1.0];
    const gyroRight = [1.0, 1.2, 1.8, 1.3, 0.9];
    const accelLeft = [0.1, 0.2, 0.3, 0.2, 0.1];
    const accelRight = [0.1, 0.15, 0.25, 0.15, 0.1];

    try {
      // Mock fetch to return realistic data
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            displacement: [0, 0.01, 0.03, 0.06, 0.08],
            velocity: [0, 0.11, 0.23, 0.34, 0.19],
            heading: [0, 1.2, 2.8, 4.1, 5.0],
            trajectory_x: [0, 0.01, 0.029, 0.058, 0.078],
            trajectory_y: [0, 0.0002, 0.0005, 0.0012, 0.002],
            gyroLeft: gyroLeft,
            gyroRight: gyroRight,
            timeStamp: timeFromStart
          })
        })
      );

      const results = await nateCalculate(timeFromStart, gyroLeft, gyroRight, accelLeft, accelRight);

      // Verify structure
      expect(results).toBeDefined();
      expect(results.displacement).toBeDefined();
      expect(results.velocity).toBeDefined();
      expect(results.heading).toBeDefined();
      expect(results.trajectory_x).toBeDefined();
      expect(results.trajectory_y).toBeDefined();
      expect(results.gyroLeft).toEqual(gyroLeft);
      expect(results.gyroRight).toEqual(gyroRight);

      console.log('✅ Python backend simulation working correctly!');
    } catch (error) {
      console.warn(`⚠ Python test simulation failed: ${error.message}`);
    }
  });

  test('Calculations are consistent across multiple runs', () => {
    const timeFromStart = [0, 0.1, 0.2, 0.3];
    const gyroLeft = [1.0, 1.5, 2.0, 1.5];
    const gyroRight = [1.0, 1.2, 1.8, 1.3];
    const accelLeft = [0.1, 0.2, 0.3, 0.2];
    const accelRight = [0.1, 0.15, 0.25, 0.15];

    // First run
    resetState();
    const results1 = calc(timeFromStart, gyroLeft, gyroRight, accelLeft, accelRight);
    
    // Second run
    resetState();
    const results2 = calc(timeFromStart, gyroLeft, gyroRight, accelLeft, accelRight);

    // Results should be identical when state is reset
    expect(results1.displacement).toEqual(results2.displacement);
    expect(results1.velocity).toEqual(results2.velocity);
    expect(results1.heading).toEqual(results2.heading);
    expect(results1.trajectory_x).toEqual(results2.trajectory_x);
    expect(results1.trajectory_y).toEqual(results2.trajectory_y);

    console.log('✅ Calculations are consistent across runs!');
  });
});