/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests/unit'],
    testMatch: ['**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        'config/**/*.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true
};

module.exports = config;
