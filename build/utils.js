/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 08:44:40
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-07-26 07:53:02
 */
const path = require('path');

exports.library = 'QmDesign';

exports.resolve = (dir) => {
  return path.join(__dirname, '..', dir);
};
