import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const deprecatedImportPatterns = [
  "@/types",
  "@/entities/movie/config/filterParams",
  "@/entities/movie/lib/createMovieCardViewModel",
  "@/features/search/infrastructure/*",
  "@/lib/utils/format",
];

function createNoRestrictedImportsRule({ paths = [], patterns = [] } = {}) {
  return [
    "error",
    {
      paths,
      patterns: [...deprecatedImportPatterns, ...patterns],
    },
  ];
}

const frameworkAgnosticPaths = [
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
    message: "This layer must not depend on Next.js.",
  },
  {
    name: "next/navigation",
    message: "This layer must not depend on Next.js navigation.",
  },
  {
    name: "next/link",
    message: "This layer must not depend on Next.js Link.",
  },
  {
    name: "next/image",
    message: "This layer must not depend on Next.js Image.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Evitar regresiones globales a rutas deprecadas.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule(),
    },
  },

  // Entities: dominio puro.
  {
    files: ["**/entities/**/*.ts", "**/entities/**/*.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        paths: frameworkAgnosticPaths,
        patterns: [
          "@/app/*",
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
          "@/lib/api/*",
          "@/lib/queries/*",
          "@/lib/routes",
          "@/lib/url/*",
          "@/lib/config/*",
          "@/lib/validation/*",
          "@/lib/scroll/*",
          "@/lib/utils/*",
        ],
      }),
    },
  },

  // Shared: genérico, sin negocio.
  {
    files: ["**/shared/**/*.ts", "**/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/entities/*",
          "@/features/*",
          "@/widgets/*",
          "@/app/*",
          "@/lib/api/*",
          "@/lib/queries/*",
          "@/lib/routes",
          "@/lib/url/*",
          "@/lib/config/*",
          "@/lib/validation/*",
        ],
      }),
    },
  },

  // Features: casos de uso, no infraestructura directa.
  {
    files: ["**/features/**/*.ts", "**/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/widgets/composition/*",
          "@/widgets/Header/*",
          "@/lib/api/repositories/*",
          "@/lib/api/http/*",
          "@/lib/api/strapi/*",
        ],
      }),
    },
  },

  // Widget presentacional movie-card.
  {
    files: [
      "**/widgets/movie-card/**/*.ts",
      "**/widgets/movie-card/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/features/*",
          "@/app/*",
          "@/widgets/composition/*",
          "@/widgets/Header/*",
          "@/lib/api/*",
          "@/lib/queries/*",
          "@/lib/url/*",
          "@/lib/validation/*",
          "@/lib/config/*",
          "@/lib/scroll/*",
        ],
      }),
    },
  },

  // Widgets de composición.
  {
    files: [
      "**/widgets/composition/**/*.ts",
      "**/widgets/composition/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/widgets/Header/*",
          "@/lib/api/repositories/*",
          "@/lib/api/http/*",
          "@/lib/api/strapi/*",
          "@/lib/queries/*",
        ],
      }),
    },
  },

  // Header es composición, pero no debe depender de app ni de otros compositions.
  {
    files: ["**/widgets/Header/**/*.ts", "**/widgets/Header/**/*.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/widgets/composition/*",
          "@/lib/api/repositories/*",
          "@/lib/api/http/*",
          "@/lib/api/strapi/*",
          "@/lib/queries/*",
        ],
      }),
    },
  },

  // lib/api: acceso a datos, sin UI ni features.
  {
    files: ["**/lib/api/**/*.ts"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
          "@/lib/url/*",
          "@/lib/queries/*",
        ],
      }),
    },
  },

  // lib/queries: cache para server components.
  {
    files: ["**/lib/queries/**/*.ts"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
          "@/lib/api/strapi/*",
          "@/lib/api/http/*",
          "@/lib/url/*",
        ],
      }),
    },
  },

  // lib/url: URL y dominio, sin UI ni API.
  {
    files: ["**/lib/url/**/*.ts"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
          "@/lib/api/*",
          "@/lib/queries/*",
          "@/lib/validation/*",
        ],
      }),
    },
  },

  // lib/validation: contratos de payload independientes.
  {
    files: ["**/lib/validation/**/*.ts"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/app/*",
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
          "@/entities/*",
          "@/lib/api/*",
          "@/lib/queries/*",
          "@/lib/url/*",
        ],
      }),
    },
  },

  // BFF: no UI.
  {
    files: ["**/app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/features/*",
          "@/widgets/*",
          "@/shared/*",
        ],
      }),
    },
  },

  // Páginas: no acceso directo a datos crudos.
  {
    files: ["**/app/**/page.tsx"],
    rules: {
      "no-restricted-imports": createNoRestrictedImportsRule({
        patterns: [
          "@/lib/api/repositories/*",
          "@/lib/api/http/*",
          "@/lib/api/strapi/*",
        ],
      }),
    },
  },
]);

export default eslintConfig;
