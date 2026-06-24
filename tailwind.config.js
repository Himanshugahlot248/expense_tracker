/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          soft: "#13131c",
          card: "#181824",
        },
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#9d86ff",
          glow: "rgba(124,92,255,0.35)",
        },
        success: "#22c55e",
        danger: "#ef4444",
      },
      boxShadow: {
        glow: "0 0 24px var(--accent-glow, rgba(124,92,255,0.35))",
        card: "0 8px 30px rgba(0,0,0,0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
