/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../libs/ui-components/tailwind.preset.js')],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../libs/ui-components/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
