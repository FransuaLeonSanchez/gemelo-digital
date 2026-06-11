import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#04060C",
        bg: "#090D17",
        bg2: "#0E1422",
        card: "#131A2C",
        card2: "#1A2336",
        line: "#222C42",
        txt: "#F1F5FD",
        sub: "#94A0B8",
        hint: "#5D6883",
        brand: {
          blue: "#60A5FA",
          sky: "#38BDF8",
          teal: "#2DD4BF",
          amber: "#FBBF24",
          red: "#FB7185",
          purple: "#A78BFA",
          green: "#4ADE80",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 28px rgba(0,0,0,0.4)",
        glow: "0 0 28px rgba(96,165,250,0.35)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.55)",
        fab: "0 12px 26px -6px rgba(99,124,246,0.55)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3D7BF6 0%, #7C5CF6 100%)",
      },
      keyframes: {
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        float: {
          "0%,100%": { transform: "translateY(-4px)" },
          "50%": { transform: "translateY(4px)" },
        },
        auraPulse: {
          "0%,100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.08)" },
        },
        blink: {
          "0%,92%,100%": { transform: "scaleY(1)" },
          "96%": { transform: "scaleY(0.1)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
        flash: {
          "0%": { opacity: "0" },
          "10%": { opacity: "0.9" },
          "100%": { opacity: "0" },
        },
        grow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 3.4s ease-in-out infinite",
        float: "float 4.2s ease-in-out infinite",
        aura: "auraPulse 3.6s ease-in-out infinite",
        blink: "blink 4s ease-in-out infinite",
        twinkle: "twinkle 2.2s ease-in-out infinite",
        flash: "flash 0.4s ease-out",
        fadeUp: "fadeUp 320ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
