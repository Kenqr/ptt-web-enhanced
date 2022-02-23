// https://eslint.org/docs/user-guide/configuring

/* global module */
module.exports = {
  extends: 'eslint:recommended',
  env: {
    browser: true,
    es2020: true,
    webextensions: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-var': 'warn',
  },
};
