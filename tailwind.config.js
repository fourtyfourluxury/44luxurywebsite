/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#fcf9f3',
        'matte-black': '#1c1c18',
        black: '#1c1c18',
        burgundy: {
          900: '#2c000b',
          800: '#4b0e1e',
        },
        concrete: '#5f5e5e',
        gold: '#D4AF37',
        surface: {
          container: '#f1eee7',
          low: '#f6f3ed',
          lowest: '#ffffff',
        },
        'deep-burg': '#2c000b',
      },
      fontFamily: {
        unica: ['"Unica One"', 'cursive'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        plex: ['"IBM Plex Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02em',
        wide: '0.08em',
        wider: '0.13em',
        widest: '0.3em',
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        luxury: '0 32px 64px rgba(44, 0, 11, 0.06)',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
}
