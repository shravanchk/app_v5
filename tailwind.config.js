/** @type {import('tailwindcss').Config} */
module.exports = {
  // Align Tailwind's dark: variant with the site's existing body.dark-theme toggle.
  darkMode: ['class', '.dark-theme'],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Anchored on #1D4E89 — the navy already used by the elephant logo and
        // the theme-color meta — rather than Tailwind's default blue-600. Same
        // hue throughout, saturation tapered at the light end.
        // Contrast: 600 on white 8.39:1, 700 on white 10.65:1,
        // 300 on slate-900 9.17:1, 400 on slate-900 5.72:1.
        brand: {
          50: '#f3f7fc',
          100: '#e2ecf8',
          200: '#c6daf1',
          300: '#9cbde2',
          400: '#6495ce',
          500: '#326cae',
          600: '#1d4e89',
          700: '#153f6f',
          800: '#11335a',
          900: '#0f2948',
        },
        ink: {
          DEFAULT: '#0f2a43',
          soft: '#334155',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Manrope', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', '"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 42, 67, 0.04), 0 6px 24px -12px rgba(15, 42, 67, 0.12)',
        card: '0 1px 3px rgba(15, 42, 67, 0.05), 0 12px 32px -16px rgba(15, 42, 67, 0.18)',
        lift: '0 8px 30px -12px rgba(29, 78, 137, 0.25)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Subtle motion for the homepage guide-card illustrations.
        'gc-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'gc-grow': {
          '0%, 100%': { transform: 'scaleY(0.8)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'gc-drop': {
          '0%': { transform: 'translateY(-14px)', opacity: '0' },
          '15%, 70%': { opacity: '1' },
          '100%': { transform: 'translateY(22px)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'gc-float': 'gc-float 3.4s ease-in-out infinite',
        'gc-grow': 'gc-grow 3s ease-in-out infinite',
        'gc-drop': 'gc-drop 2.8s ease-in infinite',
      },
    },
  },
  plugins: [],
}
