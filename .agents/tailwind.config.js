/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        base: {
          950: "#070a0f",
          900: "#0b0f17",
          850: "#0f1521",
          800: "#141b29",
          700: "#1e2839",
          600: "#2a3650",
        },
        accent: {
          600: "#0e7490",
          500: "#06b6d4",
          400: "#22d3ee",
          300: "#67e8f9",
        },
        ok: {
          600: "#15803d",
          500: "#22c55e",
          400: "#4ade80",
        },
        warn: {
          600: "#b45309",
          500: "#f59e0b",
          400: "#fbbf24",
        },
        danger: {
          600: "#b91c1c",
          500: "#ef4444",
          400: "#f87171",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 211, 238, 0.15)",
      },
    },
  },
  plugins: [],
};
