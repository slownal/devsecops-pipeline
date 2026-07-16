/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0F1115',
        cardBg: '#1C1F26',
        primaryText: '#E2E8F0',
        secondaryText: '#94A3B8',
        brandAccent: '#3B82F6',
        riskCritical: '#DC2626',
        riskHigh: '#F97316',
        riskMedium: '#EAB308',
        riskLow: '#22C55E'
      }
    },
  },
  plugins: [],
}
