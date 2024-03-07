/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    colors: {
      'white-alternative': '#f0f0f0',
    },
  },
  plugins: [],
});

