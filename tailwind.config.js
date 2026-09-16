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
          darkest: '#131518',     // Warm charcoal dark background
          panel: '#181b20',       // Warm slate panel
          surface: '#20242b',     // Warm gray surface
          surfaceHover: '#282e37',
          border: '#2a303a',      // Soft, calm border
          borderLight: '#38414e',
          textMuted: '#8b94a0',   // Calm readable muted text
          textPrimary: '#e2e6ec', // Warm off-white, anti-glare
          accent: '#14b8a6',      // Soft teal (foco / selección)
          accentHover: '#0d9488',
          accentMuted: '#134e4a',
          amber: '#d97706',       // Soft amber (warnings)
          amberMuted: '#78350f',
          danger: '#b94a3b',      // Soft terracotta (bloqueantes / errores)
          dangerMuted: '#5c221b',
          success: '#4d8b68',     // Soft moss green (validado / confirmado)
          successMuted: '#1c3b28',
          purple: '#71717a',      // Slate neutral
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
