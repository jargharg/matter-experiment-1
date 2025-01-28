module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'vue/multi-word-component-names': 0,
    'no-unused-vars': 1,
    'comma-dangle': [1, 'always-multiline'],
    'import/no-named-as-default': 0,
    'vue/no-setup-props-destructure': 1,
  },
  globals: {
    ...require('./.eslintGlobals.js'),
    useCookieControl: true,
  },
}
