/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--color-bg-primary)',
        'primary-text': 'var(--color-text-primary)',
        'secondary-bg': 'var(--color-bg-secondary)',
        'card-bg': 'var(--color-card-bg)',
        'border-color': 'var(--color-border)',
        'input-bg': 'var(--color-input-bg)',
        'input-text': 'var(--color-input-text)',
        'placeholder-text': 'var(--color-placeholder-text)',
        'accent': 'var(--color-accent)',
        'success': 'var(--color-success)',
        'danger': 'var(--color-danger)'
      },
    },
  },
  plugins: [],
};