/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'secondary': '#10b981',
        'background': '#0f172a',
        'surface': '#1e293b',
        'editor-bg': '#0f172a',
        'editor-text': '#f8fafc',
        'editor-line': '#334155',
        'editor-selection': 'rgba(59, 130, 246, 0.3)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}