/** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    textColor: {
      primaryGreen: "#2BEE7F",
      secondary: "#ffed4a",
      danger: "#e3342f",
    },
    extend: {},
  },
  plugins: [],
};
