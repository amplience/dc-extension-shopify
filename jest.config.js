/* eslint-disable no-unused-vars */
const nextJest = require('next/jest')
const { compilerOptions } = require('./tsconfig.json')

const createJestConfig = nextJest({
    dir: '.',
})

const customJestConfig = {
    verbose: true,
    collectCoverage: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testEnvironment: 'jest-environment-jsdom',
    restoreMocks: true,
    coverageDirectory: '.coverage',
    collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
    coverageReporters: ['text', 'lcov', 'clover', 'html'],
    coveragePathIgnorePatterns: [
        'node_modules',
        'tests',
        '.next',
        '.coverage',
        'jest.setup.js',
        '.lintstagedrc.js',
    ],
    moduleNameMapper: {
        '^@/pages/(.*)$': '<rootDir>/pages/$1',
    },
}

module.exports = createJestConfig(customJestConfig)
