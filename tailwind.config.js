module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],

  theme: {
    container: false,

    fontFamily: {
      mono: ['Fira Code', 'monospace'],
    },

    extend: {
      screens: {
        sm: '450px',
        '2xl': '1512px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
}
