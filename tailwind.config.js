/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html"],
  theme: {
    extend: {},
  },
  safelist: [
    "bg-gray-600",
    "hover:bg-gray-700",
    "bg-blue-600",
    "hover:bg-blue-700",
  ],
  plugins: [],
};
