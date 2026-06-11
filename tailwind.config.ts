import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0D1117",
        "bg-secondary": "#0F1923",
        "bg-tertiary": "#151F2E",
        border: "#1E2D40",
        "accent-green": "#00FF87",
        "accent-cyan": "#00D4FF",
        danger: "#FF4444",
        warning: "#FFB800",
        "text-primary": "#E8EFF7",
        "text-secondary": "#8899AA",
        "text-muted": "#4A5568",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        terminal: "4px",
      },
    },
  },
  plugins: [],
} satisfies Config;
