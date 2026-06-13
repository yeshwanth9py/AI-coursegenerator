module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          200: "#c4b5fd",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Manrope", "DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.25)",
      },
    },
  },
  plugins: [],
};
