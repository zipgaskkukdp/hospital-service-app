import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aicloudBlue: "#2563EB",
        inputBg: "#F1F5F9"
      }
    }
  },
  plugins: []
} satisfies Config;
