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
        brand: {
          bg: '#0A0A0B',
          panel: '#121215',
          panelHover: '#16161B',
          card: '#151518',
          cardHover: '#1A1A1F',
          border: 'rgba(255, 255, 255, 0.07)',
          borderHover: 'rgba(255, 255, 255, 0.14)',
          text: '#EDEDED',
          textMuted: '#A1A1AA',
          textSubtle: '#71717A',
          accent: '#3B82F6',       // Electric blue
          accentHover: '#2563EB',
          accentGlow: 'rgba(59, 130, 246, 0.15)',
        },
        semantic: {
          completed: '#10B981',    // Emerald
          completedTint: 'rgba(16, 185, 129, 0.08)',
          completedBorder: 'rgba(16, 185, 129, 0.2)',

          progress: '#3B82F6',     // Electric Blue
          progressTint: 'rgba(59, 130, 246, 0.08)',
          progressBorder: 'rgba(59, 130, 246, 0.2)',

          blocker: '#F59E0B',      // Amber
          blockerTint: 'rgba(245, 158, 11, 0.08)',
          blockerBorder: 'rgba(245, 158, 11, 0.2)',

          watch: '#94A3B8',        // Slate/Gray
          watchTint: 'rgba(148, 163, 184, 0.08)',
          watchBorder: 'rgba(148, 163, 184, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '14px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'accent-glow': '0 0 20px -4px rgba(59, 130, 246, 0.35)',
      },
    },
  },
  plugins: [],
}
