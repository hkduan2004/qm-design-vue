/*
 * @Author: 焦质晔
 * @Date: 2021-10-25 13:03:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-25 13:07:01
 */
import { createBEM } from './bem';
import { getPrefixCls } from './prefix';

export const createNamespace = (name) => {
  const prefixedName = getPrefixCls(name);
  return [prefixedName, createBEM(prefixedName)];
};
