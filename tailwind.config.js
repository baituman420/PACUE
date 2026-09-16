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
          darkest: '#1A1917',     // Fondo general cálido
          panel: '#201F1C',       // Fondo secundario
          surface: '#262420',     // Panel
          surfaceHover: '#2C2925',// Superficie elevada
          border: '#39352F',      // Bordes suaves y tenues
          borderLight: '#48433C',
          textMuted: '#817C74',   // Texto tenue
          textSecondary: '#AAA49A',// Texto secundario
          textPrimary: '#DDD8CF', // Texto principal cálido
          accent: '#568F87',      // Teal apagado (foco, playhead, selección activa)
          accentHover: '#467770',
          accentMuted: '#2B423F',
          accentWave: '#759E96',  // Onda seleccionada
          waveBg: '#201F1C',      // Fondo waveform
          waveBar: '#77736C',     // Barra onda normal
          amber: '#C28B38',       // Advertencia cálida
          danger: '#B85D43',      // Terracota suave
          success: '#628A5B',     // Verde musgo suave
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
