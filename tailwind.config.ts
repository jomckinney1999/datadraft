/** @type {import('tailwindcss').Config} */
// Fantasy-football palette: draft-night indigo darks, turf green primary,
// championship gold secondary. Token names (turf/gold/night/panel/ink) are
// used across every page — change values here, not in components.
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0C1022",
          50: "#1E2542",
          100: "#171C36",
          200: "#121629",
          300: "#0C1022",
        },
        turf: {
          DEFAULT: "#3FD973",
          dim: "#2FAD5C",
          glow: "rgba(63, 217, 115, 0.15)",
        },
        gold: {
          DEFAULT: "#F2C94C",
          dim: "#C9A032",
          glow: "rgba(242, 201, 76, 0.15)",
        },
        ink: {
          muted: "#8D95B5",
          soft: "#BEC5DE",
          DEFAULT: "#ECEFFA",
        },
        panel: {
          DEFAULT: "#141936",
          border: "#262E55",
          hover: "#2E3866",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        scoreboard: "0 0 0 1px #262E55",
        "scoreboard-turf": "0 0 0 1px #3FD973",
        "scoreboard-gold": "0 0 0 1px #F2C94C",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "count-glow": "countGlow 1.2s ease-out forwards",
        marquee: "marquee 42s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countGlow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
