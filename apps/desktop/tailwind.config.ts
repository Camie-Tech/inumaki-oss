import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/renderer/**/*.{ts,tsx,html}", "./src/renderer/index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
