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
          darkest: '#1B1916',      // Fondo general cálido
          panel: '#24211D',        // Fondo secundario / paneles
          surface: '#24211D',      // Panel surface
          surfaceHover: '#2B2722', // Superficie elevada
          elevated: '#2B2722',     // Superficie elevada
          border: '#3A352E',       // Bordes suaves y tenues
          borderLight: '#4B453D',  // Borde interactivo
          textMuted: '#8F887E',    // Texto tenue
          textSecondary: '#BEB6AA',// Texto secundario (perla secundario)
          textPrimary: '#D8D1C5',  // Texto principal (perla primario)
          pearl: '#D8D1C5',        // Perla primario
          pearlSecondary: '#BEB6AA',// Perla secundario
          focus: '#C8BDAA',        // Focus / select
          strongFocus: '#E0D5C3',  // Strong focus
          champagne: '#B79D72',    // Champagne accent
          accent: '#B79D72',       // Champagne accent principal
          accentHover: '#C8BDAA',  // Champagne hover
          accentMuted: '#3A352E',  // Muted background
          accentWave: '#B9AA94',   // Área seleccionada / onda activa
          waveBg: '#211E1A',       // Fondo waveform
          waveBar: '#777066',      // Barra onda normal
          wavePeak: '#999084',     // Picos destacados
          playhead: '#D6C7AE',     // Playhead perla / champagne
          amber: '#C18B52',        // Warning cálido
          warning: '#C18B52',      // Warning cálido
          danger: '#B96852',       // Terracota suave / error
          error: '#B96852',        // Terracota suave / error
          success: '#D8D1C5',      // Estado correcto en tono neutro/perla (sin verde)
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
