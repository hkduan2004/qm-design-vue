/*
 * @Author: 焦质晔
 * @Date: 2020-07-11 10:51:46
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:53:06
 */
import sf from './lib/filter_string';
import vr from './lib/variables_replacement';
import { matchWhere } from './lib/operations';
import type { IRecord } from '../table/types';

(window as any).__query__ = (...rest: any[]): boolean => {
  return matchWhere(rest[0], rest[1], rest[2]);
};

export const stringify = sf.stringify;

export const array_format = sf.array_format;

export const isBracketBalance = vr.isBracketBalance;

export const where = <T extends IRecord>(array: T[], query: string): T[] => {
  const result: T[] = [];

  // replace AND, OR to &&, ||
  query = sf.replace_symbols(query);
  query = vr.replace_variables(query, 'array[i]');
  // console.log(`conditionals: `, query);

  for (let i = 0, len = array.length; i < len; i++) {
    if (eval(query)) {
      result.push(array[i]);
    }
  }

  return result;
};
