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
        noc: {
          bg: '#090D16',
          panel: '#0F1626',
          panelHover: '#141E33',
          card: '#162035',
          border: '#1E2D4A',
          borderLight: '#2A3C61',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#3B82F6',
          accentHover: '#2563EB',
        },
        status: {
          completed: '#10B981', // green
          progress: '#3B82F6',  // blue
          blocker: '#F59E0B',   // amber
          watch: '#8B5CF6',     // purple/violet
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
