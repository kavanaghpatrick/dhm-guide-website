/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'behind': 'var(--z-index-behind)',
        'base': 'var(--z-index-base)',
        'dropdown': 'var(--z-index-dropdown)',
        'sticky': 'var(--z-index-sticky)',
        'fixed': 'var(--z-index-fixed)',
        'header': 'var(--z-index-header)',
        'comparison': 'var(--z-index-comparison)',
        'overlay': 'var(--z-index-overlay)',
        'modal': 'var(--z-index-modal)',
        'popover': 'var(--z-index-popover)',
        'notification': 'var(--z-index-notification)',
        'tooltip': 'var(--z-index-tooltip)',
      }
    }
  },
  plugins: [],
}