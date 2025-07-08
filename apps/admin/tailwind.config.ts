import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'admin-bg': '#0f172a',
        'admin-card': '#1e293b',
        'admin-border': '#334155',
        'admin-text': '#e2e8f0',
        'admin-primary': '#3b82f6',
        'admin-danger': '#ef4444',
        'admin-success': '#10b981',
      },
    },
  },
  plugins: [],
}
export default config