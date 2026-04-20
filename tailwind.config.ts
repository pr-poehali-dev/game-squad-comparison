import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./1776537566594707285.html"
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: { '2xl': '1400px' }
		},
		extend: {
			fontFamily: {
				'display':  ['"Cinzel Decorative"', 'serif'],
				'serif':    ['"Cormorant Garamond"', 'serif'],
				'sans':     ['"Manrope"', 'system-ui', 'sans-serif'],
				'mono-data':['"JetBrains Mono"', 'monospace'],

				/* legacy aliases */
				'fell':      ['"Cormorant Garamond"', 'serif'],
				'fell-sc':   ['"Cormorant Garamond"', 'serif'],
				'fraktur':   ['"Cinzel Decorative"', 'serif'],
				'garamond':  ['"Cormorant Garamond"', 'serif'],
				'cinzel':      ['"Cormorant Garamond"', 'serif'],
				'cinzel-deco': ['"Cinzel Decorative"', 'serif'],
				'rajdhani':    ['"Manrope"', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				crimson: 'hsl(var(--crimson))',
				gold:    'hsl(var(--gold))',
				slate2:  'hsl(var(--slate2))',
				parchment: {
					DEFAULT: 'hsl(var(--parchment))',
					dark: 'hsl(var(--parchment-dark))',
				},
				oxblood: 'hsl(var(--oxblood))',
				copper:  'hsl(var(--copper))',
				soot:    'hsl(var(--soot))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
				'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(14px)' },
					to:   { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to:   { opacity: '1' },
				},
				'gold-pulse': {
					'0%,100%': { boxShadow: '0 0 0 0 hsl(42 78% 55% / 0)' },
					'50%':     { boxShadow: '0 0 32px 4px hsl(42 78% 55% / 0.35)' },
				},
				'shimmer': {
					'0%':   { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up':   'accordion-up 0.2s ease-out',
				'slide-up':   'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
				'fade-in':    'fade-in 0.4s ease forwards',
				'gold-pulse': 'gold-pulse 3s ease-in-out infinite',
				'shimmer':    'shimmer 2.5s linear infinite',
			},
			backgroundImage: {
				'brass':     'linear-gradient(135deg, hsl(42 72% 62%) 0%, hsl(36 64% 48%) 50%, hsl(30 56% 38%) 100%)',
				'crimson':   'linear-gradient(135deg, hsl(355 68% 48%) 0%, hsl(350 60% 36%) 100%)',
				'slate-deep':'linear-gradient(180deg, hsl(222 16% 11%) 0%, hsl(224 18% 7%) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
