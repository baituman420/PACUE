/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        broadcast: {
          darkest: '#090a0c',
          panel: '#101216',
          surface: '#16191f',
          border: '#232832',
          borderLight: '#323946',
          textMuted: '#798394',
          textPrimary: '#e3e8f0',
          accent: '#00e5ff',     // Neon Cyan / Timecode
          accentHover: '#33ebff',
          amber: '#ffb300',      // Warnings / Attention
          danger: '#ff4b4b',     // Errors
          success: '#00e676',    // Confirmed / QC OK
          purple: '#b388ff',     // Speaker secondary
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
