/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FBFAF7",
        surface: "#FFFFFF",
        "surface-2": "#F4F2EC",
        ink: "#24221E",
        "ink-2": "#5F5C55",
        "ink-3": "#918D84",
        border: "#E5E2DA",
        "border-strong": "#D0CCC2",
        purple: {
          DEFAULT: "#534AB7",
          bg: "#EEEDFE",
          ink: "#3C3489",
        },
        teal: {
          DEFAULT: "#0F6E56",
          bg: "#E1F5EE",
          ink: "#085041",
        },
        amber: {
          DEFAULT: "#BA7517",
          bg: "#FAEEDA",
          ink: "#633806",
        },
        coral: {
          DEFAULT: "#D85A30",
          bg: "#FAECE7",
          ink: "#712B13",
        },
      },
      borderRadius: {
        card: "14px",
      },
      fontFamily: {
        rubik: ["Rubik_400Regular"],
        "rubik-medium": ["Rubik_500Medium"],
        "rubik-bold": ["Rubik_700Bold"],
      },
    },
  },
  plugins: [],
};
