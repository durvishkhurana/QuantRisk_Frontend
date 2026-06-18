import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#030508",
        "bg-secondary": "#0a0e14",
        "bg-tertiary": "#121722",
        border: "rgba(255, 255, 255, 0.05)",
        "accent-green": "#10b981",
        "accent-cyan": "#2563eb",
        "accent-gold": "#dfc399",
        danger: "#dc2626",
        warning: "#f59e0b",
        "text-primary": "#f1f5f9",
        "text-secondary": "#cbd5e1",
        "text-muted": "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        terminal: "4px",
        lg: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.02)",
        gold: "0 0 15px rgba(223, 195, 153, 0.05)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)", boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)", boxShadow: "0 0 0 4px rgba(16, 185, 129, 0)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
