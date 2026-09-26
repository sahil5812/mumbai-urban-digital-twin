import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "'JetBrains Mono'",
          "monospace",
        ],
        grotesk: [
          "var(--font-space-grotesk)",
          "'Space Grotesk'",
          "sans-serif",
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
