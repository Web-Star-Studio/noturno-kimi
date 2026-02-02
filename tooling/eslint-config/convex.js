import convexPlugin from "@convex-dev/eslint-plugin";

/**
 * @type {import("eslint").Linter.Config}
 */
export const convexConfig = {
  files: ["**/convex/**/*.ts"],
  plugins: {
    "@convex-dev": convexPlugin,
  },
  rules: {
    // Preferir sintaxe de objeto para funções registradas
    "@convex-dev/no-old-registered-function-syntax": "error",
    // Requerer validadores de argumentos
    "@convex-dev/require-argument-validators": "error",
    // Requerer nomes de tabela explícitos em operações de banco de dados
    "@convex-dev/explicit-table-ids": "error",
    // Prevenir importações de arquivos Node em arquivos Convex (experimental)
    "@convex-dev/import-wrong-runtime": "warn",
  },
};

export default convexConfig;
