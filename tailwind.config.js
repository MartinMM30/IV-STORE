import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a", // negro base
        foreground: "#ededed", // gris claro
        accent: "#5c3aff",     // morado (puedes cambiar a dorado/beige)
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        serif: ["Cormorant Garamond", "serif"],
      },
    },
  },
  plugins: [],
};
