import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        void: '#05050A',
        'deep-space': '#0a0a14',
        'card-bg': 'rgba(10,8,20,0.6)',
        'card-border': 'rgba(212,175,55,0.12)',
        'hero-purple': '#7c3aed',
        'hero-violet': '#8b5cf6',
        'hero-glow': '#a78bfa',
        'hero-pink': '#ec4899',
        'hero-cyan': '#06b6d4',
        'hero-green': '#10b981',
        'gold-light': '#FFD700',
        'gold-mid': '#D4AF37',
        'gold-deep': '#A0762A',
        'gold-dim': '#6B4F1A',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #D4AF37 40%, #FFF8DC 60%, #D4AF37 80%, #A0762A 100%)',
        'gradient-royal': 'linear-gradient(135deg, #4A0E8F, #7c3aed, #D4AF37)',
        'grid-pattern': 'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)',
      },
      backgroundSize: { 'grid': '50px 50px' },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139,92,246,0.4)',
        'glow-gold':   '0 0 25px rgba(212,175,55,0.4)',
        'glow-pink':   '0 0 20px rgba(236,72,153,0.4)',
        'glow-sm':     '0 0 10px rgba(212,175,55,0.2)',
        'card':        '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'royal':       '0 0 40px rgba(212,175,55,0.15), 0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s infinite',
        'slide-up':    'slideUp 0.35s ease-out',
        'fade-in':     'fadeIn 0.7s ease-out forwards',
        'spin-slow':   'spin 8s linear infinite',
        'gold-pulse':  'goldPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float:     { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' }, '50%': { boxShadow: '0 0 50px rgba(212,175,55,0.7)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        goldPulse: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
export default config
