// Setup file for Jest tests
// Mock browser environment for tests that run in Node

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock document
global.document = {
  getElementById: jest.fn()
};

// Mock window
global.window = {
  localStorage: global.localStorage
};