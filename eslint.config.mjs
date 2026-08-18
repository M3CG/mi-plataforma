import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    files: ["**/entities/**/*.ts", "**/entities/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "Entities must be UI/framework agnostic.",
            },
            {
              name: "react-dom",
              message: "Entities must be UI/framework agnostic.",
            },
            {
              name: "next",
              message: "Entities must not depend on Next.js.",
            },
            {
              name: "next/navigation",
              message: "Entities must not depend on Next.js navigation.",
            },
            {
              name: "next/link",
              message: "Entities must not depend on Next.js Link.",
            },
            {
              name: "next/image",
              message: "Entities must not depend on Next.js Image.",
            },
          ],
          patterns: [
            "@/app/*",
            "@/features/*",
            "@/widgets/*",
            "@/lib/api/*",
            "@/lib/queries/*",
            "@/lib/routes",
          ],
        },
      ],
    },
  },

  {
    files: ["**/shared/**/*.ts", "**/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/entities/*",
            "@/features/*",
            "@/widgets/*",
            "@/app/*",
            "@/lib/api/*",
            "@/lib/queries/*",
            "@/lib/routes",
            "@/lib/url/*",
          ],
        },
      ],
    },
  },

  {
    files: ["**/features/**/*.ts", "**/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/app/*",
            "@/widgets/composition/*",
            "@/widgets/Header/*",
          ],
        },
      ],
    },
  },

  {
    files: [
      "**/widgets/movie-card/**/*.ts",
      "**/widgets/movie-card/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/features/*",
            "@/app/*",
            "@/widgets/composition/*",
            "@/widgets/Header/*",
          ],
        },
      ],
    },
  },

  {
    files: ["**/lib/api/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/app/*",
            "@/features/*",
            "@/widgets/*",
          ],
        },
      ],
    },
  },

  {
    files: ["**/lib/queries/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/app/*",
            "@/features/*",
            "@/widgets/*",
            "@/lib/api/strapi/*",
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
