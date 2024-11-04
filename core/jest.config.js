/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    rootDir: "./src",
    testMatch: ["**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/test_resources/testSetup.ts"],
    testTimeout: 120000,
    globals: {
        __DEV__: true,
        __TEST__: true,
        __VERSION__: "0.0.1",
    },
    transform: {
        "^.+\\.(t|j)sx?$": [
            "@swc/jest",
            {
                jsc: {
                    target: "es2021",
                    parser: {
                        syntax: "typescript",
                        tsx: true,
                        decorators: true,
                    },
                },
            },
        ],
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transformIgnorePatterns: [
        "node_modules/(?!(string-width|strip-ansi|ansi-regex|cliui)/)",
    ],
};
