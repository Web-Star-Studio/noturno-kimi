import { config as baseConfig } from "@noturno/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  }
);
