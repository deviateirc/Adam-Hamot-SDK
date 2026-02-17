import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: "tsconfig.test.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/"],
  },
);
