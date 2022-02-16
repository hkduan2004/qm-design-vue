// Preset ordering is reversed, so `@babel/typescript` will called first
// Do not put `@babel/typescript` before `@babel/env`, otherwise will cause a compile error
// See https://github.com/babel/babel/issues/12066
module.exports = {
  env: {
    lib: {
      presets: [['@babel/preset-env', { modules: false }], '@babel/preset-typescript'],
      plugins: ['@vue/babel-plugin-jsx', '@babel/plugin-proposal-class-properties'],
    },
    web: {
      presets: [['@babel/preset-env', { modules: false, corejs: 3, useBuiltIns: 'usage' }], '@babel/preset-typescript'],
      plugins: [
        '@vue/babel-plugin-jsx',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-runtime',
      ],
    },
  },
};
