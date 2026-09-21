/** @type {import('tailwindcss').Config} */
// Warm sports palette: Shadow Grey canvas, Tuscan/Chocolate primary,
// Light Gold secondary. Token names (turf/gold/ice/night/panel/ink) are
// used across every page — change values in globals.css, not components.
// Syntax colours are a separate IDE set and do not follow these swatches.
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Each token resolves through a CSS variable holding an "r g b" channel
      // triplet, so `data-theme` on <html> flips the whole palette at once and
      // Tailwind's alpha modifiers (bg-turf/10, border-panel-border/60) still
      // compose. Values live in app/globals.css.
      colors: {
        night: {
          DEFAULT: "rgb(var(--c-night) / <alpha-value>)",
          50: "rgb(var(--c-night-50) / <alpha-value>)",
          100: "rgb(var(--c-night-100) / <alpha-value>)",
          200: "rgb(var(--c-night-200) / <alpha-value>)",
          300: "rgb(var(--c-night-300) / <alpha-value>)",
        },
        turf: {
          DEFAULT: "rgb(var(--c-turf) / <alpha-value>)",
          dim: "rgb(var(--c-turf-dim) / <alpha-value>)",
          glow: "rgb(var(--c-turf) / 0.15)",
        },
        gold: {
          DEFAULT: "rgb(var(--c-gold) / <alpha-value>)",
          dim: "rgb(var(--c-gold-dim) / <alpha-value>)",
          glow: "rgb(var(--c-gold) / 0.15)",
        },
        // Broadcast blue. Sits between turf and gold on the wheel and gives the
        // palette a cool anchor, so green and gold stop reading as a two-colour
        // sportsbook. Mostly structural — it lights the page (the room wash in
        // .bg-stadium, the middle of the .chrome hairline) and colours numbers
        // in the editor. Never use it for success or reward; that is turf's job.
        ice: {
          DEFAULT: "rgb(var(--c-ice) / <alpha-value>)",
          dim: "rgb(var(--c-ice-dim) / <alpha-value>)",
          glow: "rgb(var(--c-ice) / 0.15)",
        },
        ink: {
          muted: "rgb(var(--c-ink-muted) / <alpha-value>)",
          soft: "rgb(var(--c-ink-soft) / <alpha-value>)",
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
        },
        panel: {
          DEFAULT: "rgb(var(--c-panel) / <alpha-value>)",
          border: "rgb(var(--c-panel-border) / <alpha-value>)",
          hover: "rgb(var(--c-panel-hover) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        scoreboard: "0 0 0 1px rgb(var(--c-panel-border))",
        "scoreboard-turf": "0 0 0 1px rgb(var(--c-turf))",
        "scoreboard-gold": "0 0 0 1px rgb(var(--c-gold))",
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
