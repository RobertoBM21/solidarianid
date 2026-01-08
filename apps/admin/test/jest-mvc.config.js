module.exports = {
  ...require('./jest-e2e.config'),

  testEnvironment: 'jsdom',
  testRegex: '.mvc-spec.ts$',
  testMatch: null,
  setupFilesAfterEnv: ['<rootDir>/setup-mvc-tests.ts'],
};
