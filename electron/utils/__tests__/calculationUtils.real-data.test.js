const { calc, resetState } = require("../calculationUtils");
const http = require('http');

describe("CalculationUtils Integration Tests - Real Data Template", () => {
  let expectedResults;
  let testDataAvailable = false;

  beforeAll(async () => {
    const SENSOR_DATA_URL = "http://0.0.0.0:8000/db/tests/1136";

    try {
      const data = await fetchTestData(SENSOR_DATA_URL);
      expectedResults = extractSensorData(data);
      
      if (expectedResults?.gyro_left && expectedResults?.gyro_right) {
        testDataAvailable = true;
        console.log("✅ Using real sensor data from server");
        console.log("Data lengths:", {
          gyro_left: expectedResults.gyro_left.length,
          gyro_right: expectedResults.gyro_right.length,
          accel_left: expectedResults.accel_left?.length,
          accel_right: expectedResults.accel_right?.length,
          timeStamp: expectedResults.timeStamp?.length
        });
      } else {
        throw new Error("No sensor data found in response");
      }
    } catch (error) {
      console.warn(`⚠ Could not fetch sensor data: ${error.message}`);
      console.warn("Skipping integration tests - ensure your backend is running and the endpoint returns sensor data");
      expectedResults = null;
      testDataAvailable = false;
    }
  });

  function extractSensorData(apiResponse) {
    let data = apiResponse.data || apiResponse;
    
    // Handle different response structures:
    if (Array.isArray(data)) {
      data = data[0];
    }
    
    // If data is nested, extract it
    if (data?.sensor_data) {
      data = data.sensor_data;
    }
    
    // If data is in test_files array
    if (data?.test_files && data.test_files.length > 0) {
      data = data.test_files[0];
    }
    
    return data;
  }

  function fetchTestData(url) {
    return new Promise((resolve, reject) => {
      const request = http.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  beforeEach(() => {
    resetState();
  });

  test("should validate calculation results against known good data", () => {
    if (!testDataAvailable) {
      console.log("⏭️  Skipping test: No sensor data available");
      return;
    }

    const { gyro_left, gyro_right, accel_left, accel_right, timeStamp } = expectedResults;
    
    // Run the calculation
    const results = calc(timeStamp, gyro_left, gyro_right, accel_left, accel_right);

    // Basic structure validation
    expect(results).toBeDefined();
    expect(results.displacement).toBeDefined();
    expect(results.velocity).toBeDefined();
    expect(results.heading).toBeDefined();
    expect(results.trajectory_x).toBeDefined();
    expect(results.trajectory_y).toBeDefined();

    // Length validation (calc function slices first element)
    const expectedLength = timeStamp.length - 1;
    expect(results.displacement).toHaveLength(expectedLength);
    expect(results.velocity).toHaveLength(expectedLength);
    expect(results.heading).toHaveLength(expectedLength);
    expect(results.trajectory_x).toHaveLength(expectedLength);
    expect(results.trajectory_y).toHaveLength(expectedLength);

    // Compare against expected displacement
    if (expectedResults.expected_displacement) {
      results.displacement.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedResults.expected_displacement[index], 6);
      });
    }

    // Compare against expected velocity
    if (expectedResults.expected_velocity) {
      results.velocity.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedResults.expected_velocity[index], 6);
      });
    }

    // Compare against expected heading
    if (expectedResults.expected_heading) {
      results.heading.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedResults.expected_heading[index], 6);
      });
    }

    // Compare against expected trajectory
    if (expectedResults.expected_trajectory_x) {
      results.trajectory_x.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedResults.expected_trajectory_x[index], 6);
      });
    }

    if (expectedResults.expected_trajectory_y) {
      results.trajectory_y.forEach((value, index) => {
        expect(value).toBeCloseTo(expectedResults.expected_trajectory_y[index], 6);
      });
    }


    // Basic sanity checks
    expect(results.displacement.every(val => typeof val === 'number' && !isNaN(val))).toBe(true);
    expect(results.velocity.every(val => typeof val === 'number' && !isNaN(val))).toBe(true);
    expect(results.heading.every(val => typeof val === 'number' && !isNaN(val))).toBe(true);

    console.log("✅ Calculation validation completed successfully!");
    console.log(`📊 Processed ${results.displacement.length} data points`);
    console.log(`🎯 Final displacement: ${results.displacement[results.displacement.length - 1].toFixed(3)}m`);
    console.log(`🏁 Final heading: ${results.heading[results.heading.length - 1].toFixed(3)} rad`);
  });

  test("should produce consistent results across multiple runs", () => {
    if (!testDataAvailable) {
      console.log("⏭️  Skipping test: No sensor data available");
      return;
    }

    const { gyro_left, gyro_right, accel_left, accel_right, timeStamp } = expectedResults;

    // Run calculation twice
    const results1 = calc(timeStamp, gyro_left, gyro_right, accel_left, accel_right);
    resetState();
    const results2 = calc(timeStamp, gyro_left, gyro_right, accel_left, accel_right);

    // Results should be identical
    expect(results1.displacement).toEqual(results2.displacement);
    expect(results1.velocity).toEqual(results2.velocity);
    expect(results1.heading).toEqual(results2.heading);
    expect(results1.trajectory_x).toEqual(results2.trajectory_x);
    expect(results1.trajectory_y).toEqual(results2.trajectory_y);

    console.log("✅ Consistency validation passed!");
  });
});