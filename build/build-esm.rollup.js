/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 09:22:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-10 08:52:03
 */
'use strict';

import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import vuePlugin from 'rollup-plugin-vue';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import jsx from 'acorn-jsx';
import pkg from '../package.json';

const utils = require('./utils');
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const deps = Object.keys(pkg.dependencies);

const env = process.env.NODE_ENV;

export default [
  {
    input: utils.resolve('packages/index.ts'),
    output: [
      {
        format: 'es',
        file: 'lib/index.esm.js',
      },
      {
        format: 'cjs',
        file: 'lib/index.js',
        exports: 'named',
      },
      // {
      //   format: 'umd',
      //   name: utils.library,
      //   file: 'lib/index.js',
      //   globals: {
      //     vue: 'Vue',
      //   },
      // },
    ],
    plugins: [
      json(),
      nodeResolve(),
      vuePlugin({
        target: 'browser',
        css: false,
        exposeFilename: false,
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions,
      }),
      typescript({
        outDir: 'lib',
        sourceMap: false,
        include: ['packages/**/*', 'typings/*.d.ts'],
        exclude: ['node_modules/**'],
      }),
      commonjs({
        extensions,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        // options
        preventAssignment: true,
      }),
      terser(),
    ],
    acornInjectPlugins: [jsx()],
    external(id) {
      return /^vue/.test(id) || deps.some((k) => new RegExp('^' + k).test(id));
    },
  },
];
