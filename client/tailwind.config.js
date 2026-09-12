/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aec: {
          50: '#f4f7fa',
          100: '#e5ecf3',
          200: '#cedcfa',
          300: '#a3beeb',
          400: '#7199dd',
          500: '#4775ce',
          600: '#3259b3',
          700: '#284693',
          800: '#1b2f64',
          900: '#0f1c3d',
          950: '#091026',
        },
        slateDark: '#0b0f19',
        panelDark: '#131927',
        borderDark: '#1e293b'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      }
    },
  },
  plugins: [],
}
