import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals"),
    {
        rules: {
            // TypeScript rules are handled by Next.js default config

            // React
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react/jsx-no-target-blank": "error",
            "react/no-unescaped-entities": "off",
            
            // Next.js
            "@next/next/no-img-element": "warn",
            "@next/next/no-html-link-for-pages": "error",
            
            // Best Practices
            "no-console": ["warn", { allow: ["warn", "error", "info"] }],
            "no-debugger": "warn",
            "prefer-const": "error",
            "no-var": "error",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            "curly": "off",
            
            // Code Style
            "semi": ["error", "always"],
            "quotes": ["warn", "double", { avoidEscape: true }],
            "indent": "off",
            "comma-dangle": ["warn", "always-multiline"],
        },
    },
    {
        files: ["**/*.test.ts", "**/*.test.tsx"],
        rules: {
            "no-console": "off",
        },
    },
];

export default eslintConfig;
