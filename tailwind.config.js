// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["**/*.{html, php}"],
  safelist: [
    // adding this so if there is a problem
    // with how tailwind is finding each file,
    // bg-red is the only generated utility class.
    "bg-red",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
