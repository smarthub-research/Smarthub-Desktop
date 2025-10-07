/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Keep default transform off for CommonJS files in electron folder
  transform: {},
};