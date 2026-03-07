/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf6",
          100: "#d7f8e8",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534"
        }
      }
    }
  },
  plugins: []
};
