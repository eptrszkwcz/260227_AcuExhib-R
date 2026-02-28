/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ----------------------------------------------------------------
      // Font family — Anaheim is the global default for this project
      // ----------------------------------------------------------------
      fontFamily: {
        sans: ['Anaheim', 'sans-serif'],
      },

      // ----------------------------------------------------------------
      // Font sizes — SINGLE SOURCE OF TRUTH for Title, PrimaryText, SecondaryText.
      // All values authored against the 1920×1080 canvas.
      // ----------------------------------------------------------------
      fontSize: {
        // Page content hierarchy
        'title':          ['88px', { lineHeight: '1.1', fontWeight: '700' }], // 80pt Bold
        'primary-text':   ['44px',  { lineHeight: '1.2', fontWeight: '500' }], // 58px Medium
        'secondary-text': ['32px',  { lineHeight: '1.3', fontWeight: '500' }], // 44pt Medium
        // Button labels
        'btn-primary':    ['58px',  { lineHeight: '1.0', fontWeight: '600' }], // 72pt Semibold
        'btn-sorting':    ['44px',  { lineHeight: '1.2', fontWeight: '500' }], // 44px Medium
      },

      // ----------------------------------------------------------------
      // Colors
      // ----------------------------------------------------------------
      colors: {
        // Page background (both sides)
        'page-bg':              '#DAD9CE',

        // Panel colors — driven by side/theme
        'panel-acusensus':      '#2E81B8',
        'panel-competitor':     '#AC4CAC',

        // Default text (page background)
        'text-default':         '#20455F',
        // Default text inside panels
        'text-panel':           '#E4E4E4',

        // Secondary button surface
        'btn-secondary-bg':     '#DCDCDC',
        'btn-secondary-stroke': '#C2C2C2',

        // Sorting button surface
        'btn-sorting-bg':       '#E4E4E4',

        // Category: seatbelt violation & distracted driving (red family)
        'category-danger':      '#D23E3E',
        'category-danger-icon': '#E66060',

        // Category: safe driving (green family)
        'category-safe':        '#1C8854',
        'category-safe-icon':   '#38AB74',

        // Popup overlay
        'popup-bg':             '#DCDCDC',
      },

      // ----------------------------------------------------------------
      // Box shadows
      // ----------------------------------------------------------------
      boxShadow: {
        // Standard button drop shadow (all three button types)
        'btn': '-1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Primary button — acusensus theme (stroke + drop shadow combined)
        'btn-primary-acusensus':
          'inset 0 0 0 3px #2E81B8, -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Primary button — competitor theme
        'btn-primary-competitor':
          'inset 0 0 0 3px #AC4CAC, -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Secondary button (stroke + drop shadow)
        'btn-secondary':
          'inset 0 0 0 3px #C2C2C2, -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Sorting button — danger category (stroke at 30% opacity + drop shadow)
        'btn-sorting-danger':
          'inset 0 0 0 4px rgba(210,62,62,0.30), -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Sorting button — danger category ACTIVE (stroke at 100% opacity)
        'btn-sorting-danger-active':
          'inset 0 0 0 4px rgba(210,62,62,1.00), -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Sorting button — safe category (stroke at 30% opacity + drop shadow)
        'btn-sorting-safe':
          'inset 0 0 0 4px rgba(28,136,84,0.30), -1px 7px 12px 0px rgba(0,0,0,0.25)',

        // Sorting button — safe category ACTIVE (stroke at 100% opacity)
        'btn-sorting-safe-active':
          'inset 0 0 0 4px rgba(28,136,84,1.00), -1px 7px 12px 0px rgba(0,0,0,0.25)',
      },

      // ----------------------------------------------------------------
      // Border radius
      // ----------------------------------------------------------------
      borderRadius: {
        'ui': '16px', // panels, all button types, images, popups
      },

      // ----------------------------------------------------------------
      // Spacing — kiosk-specific component sizes
      // ----------------------------------------------------------------
      spacing: {
        'kiosk-card-w':   '320px',
        'kiosk-card-h':   '240px',
        'kiosk-zone-w':   '480px',
        'btn-sorting':    '216px', // sorting button is always 216×216
        'btn-secondary':  '64px',  // secondary button is always 64×64
      },
    },
  },
  plugins: [],
}
