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
        // Courtsapp brand colors - exact official palette
        brand: {
          primary: "#e1f700", // Bright yellow-lime (main brand color - rgb(225, 247, 0))
          secondary: "#0a4728", // Dark forest green (headers, backgrounds - rgb(10, 71, 40))
          accent: "#10B981", // Emerald green (success states, highlights)
          dark: "#1F2937", // Dark gray (text, borders)
          light: "#FFFFFF", // Pure white (backgrounds)
        },
      },
    },
  },
  plugins: [],
};
export default config;
