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
        page: "#05070C",
        bg: "#0B0E14",
        bg2: "#11151F",
        card: "#161B27",
        card2: "#1C2230",
        line: "#262D3D",
        txt: "#EAF0FA",
        sub: "#8A95AC",
        hint: "#5C6678",
        brand: {
          blue: "#4DA3FF",
          teal: "#1FD0A3",
          amber: "#FFB23E",
          red: "#FF5E6C",
          purple: "#A78BFA",
          green: "#37D67A",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 28px rgba(0,0,0,0.35)",
        glow: "0 0 28px rgba(77,163,255,0.35)",
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
      },
      animation: {
        breathe: "breathe 3.4s ease-in-out infinite",
        float: "float 4.2s ease-in-out infinite",
        aura: "auraPulse 3.6s ease-in-out infinite",
        blink: "blink 4s ease-in-out infinite",
        twinkle: "twinkle 2.2s ease-in-out infinite",
        flash: "flash 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
