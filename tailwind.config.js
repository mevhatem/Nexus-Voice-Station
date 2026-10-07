/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050608",
          card: "rgba(15, 17, 23, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          cyan: "#00f2fe",
          teal: "#00e5ff",
          purple: "#7928ca",
          pink: "#ff0080",
          textMuted: "#8a8f9d",
          textLight: "#f0f2f5",
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'sound-wave': 'soundWave 1.8s ease-in-out infinite',
        'pulse-cyan': 'pulseCyan 2s infinite ease-in-out',
        'glow-spin': 'glowSpin 6s linear infinite',
      },
      keyframes: {
        soundWave: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.15)', opacity: '0.9' },
        },
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 242, 254, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 242, 254, 0.8)' },
        },
        glowSpin: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
