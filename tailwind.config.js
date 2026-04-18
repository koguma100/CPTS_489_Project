/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./js/**/*.{js,html}",
    "./views/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        "blaze-orange": "#F75C03",
        "berry-lipstick": "#D90368",
        "royal-plum": "#820263",
        "midnight-violet": "#291720",
        "jungle-green": "#04A777",

        // Just in case, we can delete later if not used
        "blaze-orange-dim": "#d94f02",
        "berry-lipstick-dim": "#b80256",
        "royal-plum-dim": "#65014e",
        "midnight-violet-dim": "#1d1017",
        "jungle-green-dim": "#038a62",
      }
    }
  }
}