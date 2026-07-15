/** @type {import('tailwindcss').Config} */
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
          DEFAULT: "#0B0E14",
          50: "#1A1F2B",
          100: "#141820",
          200: "#10141C",
          300: "#0B0E14",
        },
        teal: {
          DEFAULT: "#4FD1C5",
          dim: "#3AA99F",
          glow: "rgba(79, 209, 197, 0.15)",
        },
        amber: {
          DEFAULT: "#E8A33D",
          dim: "#C4862E",
          glow: "rgba(232, 163, 61, 0.15)",
        },
        ink: {
          muted: "#8B93A7",
          soft: "#B8BFC9",
          DEFAULT: "#E8ECF4",
        },
        panel: {
          DEFAULT: "#12161F",
          border: "#1E2533",
          hover: "#252D3D",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        scoreboard: "0 0 0 1px #1E2533",
        "scoreboard-teal": "0 0 0 1px #4FD1C5",
        "scoreboard-amber": "0 0 0 1px #E8A33D",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "count-glow": "countGlow 1.2s ease-out forwards",
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
      },
    },
  },
  plugins: [],
};

export default config;
