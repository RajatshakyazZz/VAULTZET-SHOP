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
          bg: "#f8fafc",
          text: "#0f172a",
          muted: "#64748b",
          purple: "#2563eb",
          "purple-light": "#38bdf8",
          "purple-dark": "#1d4ed8",
          "purple-soft": "#eff6ff",
          pink: "#f97316",
          green: "#10b981",
          "green-soft": "#ecfdf5",
          line: "#e2e8f0",
          card: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 14px 40px rgba(15, 23, 42, 0.06)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.04)",
        btn: "0 10px 24px rgba(37, 99, 235, 0.25)",
        dock: "0 16px 40px rgba(15, 23, 42, 0.14)",
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
