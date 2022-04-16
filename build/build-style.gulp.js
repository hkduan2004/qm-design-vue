/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 15:05:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-16 11:43:04
 */
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const { series, src, dest } = require('gulp');
const gulpSass = require('gulp-sass');
const dartSass = require('sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const utils = require('./utils');

function compile() {
  const sass = gulpSass(dartSass);
  return src(utils.resolve('packages/style/src/index.scss'))
    .pipe(sass.sync({ includePaths: [utils.resolve('node_modules')] }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('index.css'))
    .pipe(dest(utils.resolve('lib/style')))
    .pipe(cleanCSS({ level: { 1: { specialComments: '*' } }, format: { semicolonAfterLastProperty: true } }))
    .pipe(rename('index.min.css'))
    .pipe(dest(utils.resolve('lib/style')));
}

function copyfont() {
  return src(utils.resolve('packages/style/src/fonts/**')).pipe(dest(utils.resolve('lib/style/fonts')));
}

function copyscss() {
  return src(utils.resolve('packages/**/*.scss')).pipe(dest(utils.resolve('lib')));
}

exports.build = series(compile, copyfont, copyscss);
