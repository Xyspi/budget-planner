/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du Budget Planner Excel
        'budget-header': '#6c8e9c',
        'budget-light': '#a8c5d1',
        'budget-revenue': '#22c55e',
        'budget-expense': '#f97316',
        'budget-bill': '#ef4444',
        'budget-savings': '#3b82f6',
        'budget-gray': '#f3f4f6',
      }
    },
  },
  plugins: [],
}