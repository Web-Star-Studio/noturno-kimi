import { config as baseConfig } from "@noturno/eslint-config/base";
import { convexConfig } from "@noturno/eslint-config/convex";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...baseConfig,
  convexConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  }
);
