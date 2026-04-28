import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/**",
      "out/**", 
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "*.config.js",
      "*.config.mjs"
    ]
  },
  {
    rules: {
      // Add any custom rules here
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
