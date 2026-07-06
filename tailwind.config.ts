import type { Config } from "tailwindcss";

// Warm (orange-based) palette. `brand` is an alias to the same warm values so
// existing components using `brand-600` etc. continue to work while migrating.
const warm = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
} as const;

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm,
        // Alias so existing `brand-*` usages resolve to warm (orange) values.
        brand: warm,
      },
    },
  },
  plugins: [],
};

export default config;
