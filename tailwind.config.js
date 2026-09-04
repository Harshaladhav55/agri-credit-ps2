/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pathcraft: {
          blue: '#0284C7',
          deepBlue: '#0369A1',
          lightBlue: '#F0F9FF',
          accent: '#EA580C',
          bgLight: '#F1F5F9',
          cardLight: '#FFFFFF',
          borderLight: '#E2E8F0',
          textMain: '#0F172A',
          textMuted: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          purple: '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}
