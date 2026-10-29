import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rb: {
          bg: "#faf9ff",
          text: "#182247",
          muted: "#6e7696",
          purple: "#6c3cf0",
          "purple-light": "#8f46ff",
          "purple-dark": "#5126c9",
          "purple-soft": "#f1edff",
          pink: "#ff4fb3",
          green: "#078860",
          "green-soft": "#ecfdf5",
          line: "#e9e4fb",
          card: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 14px 40px rgba(58, 42, 120, 0.08)",
        soft: "0 8px 24px rgba(48, 32, 85, 0.055)",
        btn: "0 10px 24px rgba(108, 60, 240, 0.28)",
        dock: "0 16px 40px rgba(39, 25, 76, 0.19)",
      },
      animation: {
        marquee: "marquee 35s linear infinite",
        "marquee-reverse": "marquee-reverse 35s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
