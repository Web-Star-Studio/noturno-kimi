import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

import baseConfig from "./base.js";
import reactConfig from "./react.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

/**
 * @type {import("eslint").Linter.Config}
 */
const nextjsConfig = [
  ...reactConfig,
  ...compat.extends("plugin:@next/eslint-plugin-next/recommended"),
  {
    plugins: {
      "@next/next": compat.plugins("@next/next")[0].plugins["@next/next"],
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/require-await": "off",
    },
  },
];

export default nextjsConfig;
