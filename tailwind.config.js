/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'rgb(249, 249, 249)',
        foreground: 'rgb(32, 32, 32)',
        card: 'rgb(252, 252, 252)',
        'card-foreground': 'rgb(32, 32, 32)',
        popover: 'rgb(252, 252, 252)',
        'popover-foreground': 'rgb(32, 32, 32)',
        primary: 'rgb(100, 74, 64)',
        'primary-foreground': 'rgb(255, 255, 255)',
        secondary: 'rgb(255, 223, 181)',
        'secondary-foreground': 'rgb(88, 45, 29)',
        muted: 'rgb(239, 239, 239)',
        'muted-foreground': 'rgb(100, 100, 100)',
        accent: 'rgb(232, 232, 232)',
        'accent-foreground': 'rgb(32, 32, 32)',
        destructive: 'rgb(229, 77, 46)',
        'destructive-foreground': 'rgb(255, 255, 255)',
        border: 'rgb(216, 216, 216)',
        input: 'rgb(216, 216, 216)',
        ring: 'rgb(100, 74, 64)',
      },
    },
  },
  plugins: [],
};
