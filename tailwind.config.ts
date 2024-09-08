import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Enables dark mode based on a class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // Add custom colors for dark mode
        dark: {
          bg: '#1a1a1a',
          text: '#e0e0e0',
          primary: '#4a90e2',
        },
        light: {
          bg: '#ffffff',
          text: '#000000',
          primary: '#007bff',
        },
      },
    },
  },
  plugins: [],
}

export default config
