/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        dark: "#111827",
        light: "#f3f4f6",
        card: "#1f2937",
        accent: "#10b981",
        alert: "#ef4444",
        warning: "#f59e0b"
      }
    },
  },
  plugins: [],
}
