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
        console: {
          base: '#0D1117',            // Deep maritime slate-black (low eye-strain)
          surface: '#161B22',         // Matte console surface
          surfaceRaised: '#21262D',   // Raised console tier
          border: '#30363D',          // Crisp mechanical boundary
          borderMuted: '#21262D',
          hover: '#1C2128',
        },
        ink: {
          primary: '#F0F6FC',         // High contrast crisp text
          secondary: '#8B949E',       // Secondary telemetry / metadata
          muted: '#6E7681',           // Faint labels / boundaries
        },
        baton: {
          amber: '#D29922',           // Blockers & Escalations
          amberTint: 'rgba(210, 153, 34, 0.1)',
          amberBorder: 'rgba(210, 153, 34, 0.25)',

          blue: '#58A6FF',            // In Progress
          blueTint: 'rgba(88, 166, 255, 0.1)',
          blueBorder: 'rgba(88, 166, 255, 0.25)',

          green: '#3FB950',           // Completed
          greenTint: 'rgba(63, 185, 80, 0.1)',
          greenBorder: 'rgba(63, 185, 80, 0.25)',

          slate: '#8B949E',           // Watch-list
          slateTint: 'rgba(139, 148, 158, 0.1)',
          slateBorder: 'rgba(139, 148, 158, 0.25)',

          action: '#238636',          // Primary relay handover green
          actionHover: '#2EA043',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '8px',
      },
    },
  },
  plugins: [],
}
