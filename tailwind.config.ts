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
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'fell': ['"IM Fell English"', 'serif'],
				'fell-sc': ['"IM Fell English SC"', 'serif'],
				'fraktur': ['"UnifrakturCook"', 'serif'],
				'garamond': ['"EB Garamond"', 'serif'],
				'mono-data': ['"JetBrains Mono"', 'monospace'],
				/* legacy aliases — чтобы не ломать оставшийся код */
				'cinzel': ['"IM Fell English SC"', 'serif'],
				'cinzel-deco': ['"UnifrakturCook"', 'serif'],
				'rajdhani': ['"EB Garamond"', 'serif'],
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
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'ember-flicker': {
					'0%, 100%': { opacity: '0.55', filter: 'brightness(0.95)' },
					'40%': { opacity: '0.85', filter: 'brightness(1.15)' },
					'70%': { opacity: '0.65', filter: 'brightness(1.05)' },
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(14px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'ink-seep': {
					from: { opacity: '0', filter: 'blur(6px)' },
					to:   { opacity: '1', filter: 'blur(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'ember-flicker': 'ember-flicker 2.8s ease-in-out infinite',
				'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
				'ink-seep': 'ink-seep 0.6s ease forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
