import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        card: '#111111',
        'card-hover': '#161616',
        border: '#1E1E1E',
        primary: {
          DEFAULT: '#FF3B30',
          hover: '#E03126',
          glow: 'rgba(255, 59, 48, 0.35)',
        },
        secondary: '#FFFFFF',
        accent: '#A1A1AA',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-inter)', 'sans-serif'],
        heading: ['Space Grotesk', 'var(--font-space-grotesk)', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(255, 59, 48, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 59, 48, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'red-glow': '0 0 25px rgba(255, 59, 48, 0.25)',
        'red-glow-lg': '0 0 50px rgba(255, 59, 48, 0.4)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;
