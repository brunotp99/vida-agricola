import nextConfig from "eslint-config-next/core-web-vitals"
import prettierConfig from "eslint-config-prettier"

const config = [
  ...nextConfig,
  prettierConfig,
  {
    settings: {
      react: { version: "19" },
    },
  },
  {
    ignores: [
      "lib/generated/**",
      ".next/**",
      "node_modules/**",
      "prisma/seed.ts",
      "components/ui/**",
      "hooks/use-mobile.ts",
    ],
  },
]

export default config
