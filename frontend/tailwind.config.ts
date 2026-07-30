import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1B1F",
          soft: "#26262C",
        },
        chalk: {
          DEFAULT: "#F6F4EF",
          dim: "#EAE7DF",
        },
        thread: {
          DEFAULT: "#B23A3F",
          light: "#D2585D",
          dark: "#8C2A2E",
        },
        brass: {
          DEFAULT: "#B8935B",
          light: "#D4B786",
        },
        denim: {
          DEFAULT: "#2F4159",
          light: "#425A79",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grain": "url('/images/grain.png')",
      },
      keyframes: {
        "stitch-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "stitch-draw": "stitch-draw 2.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
