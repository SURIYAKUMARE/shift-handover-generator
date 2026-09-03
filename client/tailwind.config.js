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
        canvas: {
          DEFAULT: '#0A0D12',        // Deep obsidian canvas with faint blue-gray undertone
          card: '#12171F',           // Matte console card surface
          elevated: '#18202C',       // Elevated console tier
          hover: '#1D2635',          // Interactive hover surface
        },
        boundary: {
          subtle: '#1E2633',         // Crisp 1px structural boundary
          DEFAULT: '#283446',        // Active border
          focus: '#3B82F6',          // Focus ring
        },
        ink: {
          primary: '#F8FAFC',        // High-contrast, crisp text (WCAG AAA)
          secondary: '#94A3B8',      // Secondary metadata & descriptions
          muted: '#64748B',          // Muted labels, timestamps
        },
        ops: {
          amber: '#F59E0B',          // Blockers & Escalations
          amberSubtle: 'rgba(245, 158, 11, 0.08)',
          amberBorder: 'rgba(245, 158, 11, 0.28)',

          blue: '#3B82F6',           // In Progress
          blueSubtle: 'rgba(59, 130, 246, 0.08)',
          blueBorder: 'rgba(59, 130, 246, 0.28)',

          emerald: '#10B981',        // Completed
          emeraldSubtle: 'rgba(16, 185, 129, 0.08)',
          emeraldBorder: 'rgba(16, 185, 129, 0.28)',

          slate: '#94A3B8',          // Watch-list
          slateSubtle: 'rgba(148, 163, 184, 0.08)',
          slateBorder: 'rgba(148, 163, 184, 0.22)',

          crimson: '#EF4444',        // Stale unresolved escalation alert
          crimsonSubtle: 'rgba(239, 68, 68, 0.12)',
          crimsonBorder: 'rgba(239, 68, 68, 0.35)',

          primary: '#2563EB',        // Confident primary action
          primaryHover: '#1D4ED8',
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
        xl: '10px',
      },
      boxShadow: {
        console: '0 1px 3px 0 rgba(0, 0, 0, 0.35), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        dock: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
