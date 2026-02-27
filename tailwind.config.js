/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Custom sizes authored against the 1920×1080 baseline canvas.
      // All sizing here assumes the FullscreenLayout scale transform is applied.
      spacing: {
        'kiosk-card-w': '320px',
        'kiosk-card-h': '240px',
        'kiosk-zone-w': '480px',
        'kiosk-btn': '120px',
      },
      fontSize: {
        'kiosk-title': ['96px', { lineHeight: '1.1' }],
        'kiosk-label': ['48px', { lineHeight: '1.2' }],
        'kiosk-body': ['32px', { lineHeight: '1.4' }],
      },
      colors: {
        // Drop zone category colors (shared across both themes)
        'zone-seatbelt': '#16a34a',
        'zone-distracted': '#dc2626',
        'zone-safe': '#2563eb',
        // Acusensus side theme (TBD — update with brand colors)
        'acusensus-primary': '#0f172a',
        'acusensus-accent': '#38bdf8',
        'acusensus-bg': '#1e293b',
        // Competitor side theme (TBD — update with brand colors)
        'competitor-primary': '#1c1917',
        'competitor-accent': '#fb923c',
        'competitor-bg': '#292524',
      },
    },
  },
  plugins: [],
}
