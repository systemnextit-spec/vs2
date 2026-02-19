/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "black-4": "var(--black-4)",
        "variable-collection-black": "var(--variable-collection-black)",
      },
    },
  },
  plugins: [],
};
