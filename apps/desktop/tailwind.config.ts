import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/renderer/**/*.{ts,tsx,html}", "./src/renderer/index.html"],
  theme: {
    extend: {
      colors: {
        navy: "#0F172A",
        platinum: "#F8FAFC",
        violet: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
        },
        mist: "#E2E8F0",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.03)",
        violet: "0 10px 30px -12px rgba(139, 92, 246, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
