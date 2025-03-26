/** @type {import('jest').Config} */
const config = {
  // Indicate that we're running in a Node.js environment
  testEnvironment: 'node',
  
  // Disable source maps
  transform: {},
  
  // Only look for tests in the tests directory
  roots: ['<rootDir>/tests'],
  
  // Set up files before tests are run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Show verbose output
  verbose: true
};

module.exports = config;