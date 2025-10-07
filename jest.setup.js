// Jest setup file to add polyfills

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  // Try to use node-fetch if available, otherwise use a mock
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  } catch (error) {
    // Use a simple mock for fetch that simulates the Python backend response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          displacement: [],
          velocity: [],
          heading: [],
          trajectory_x: [],
          trajectory_y: [],
          gyro_left: [],
          gyro_right: [],
          timeStamp: []
        })
      })
    );
  }
}