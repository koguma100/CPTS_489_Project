/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./js/**/*.{js,html}",
    "./pages/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        "blaze-orange": "#F75C03",
        "berry-lipstick": "#D90368",
        "royal-plum": "#820263",
        "midnight-violet": "#291720",
        "jungle-green": "#04A777",
      }
    }
  }
}