import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Courtsapp brand colors - sports/court themed
        brand: {
          primary: "#2563EB", // Blue (court/sports theme)
          secondary: "#F97316", // Orange (basketball/sports)
          accent: "#10B981", // Green (success states)
          dark: "#1E293B", // Dark slate
          light: "#F1F5F9", // Light gray
        },
      },
    },
  },
  plugins: [],
};
export default config;
