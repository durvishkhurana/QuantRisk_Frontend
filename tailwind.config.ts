import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0F172A",
        "bg-secondary": "#1E293B",
        "bg-tertiary": "#334155",
        border: "rgba(255, 255, 255, 0.08)",
        "accent-green": "#10B981",
        "accent-cyan": "#0EA5E9",
        danger: "#EF4444",
        warning: "#F59E0B",
        "text-primary": "#F8FAFC",
        "text-secondary": "#CBD5E1",
        "text-muted": "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        terminal: "8px",
        lg: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.5)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 0 6px rgba(16, 185, 129, 0)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
