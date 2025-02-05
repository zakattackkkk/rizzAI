import eslintGlobalConfig from "../../eslint.config.mjs";

export default [
    ...eslintGlobalConfig,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: "./tsconfig.json",
            },
        },
        rules: {
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
];
