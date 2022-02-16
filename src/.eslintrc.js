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
    'no-unused-vars': ['warn', {'args': 'none'}], //處理完成前暫時只警告
    'no-redeclare': 'warn', //處理完成前暫時只警告

    // 'no-var': 'warn', //預訂將開啟
  },
};
