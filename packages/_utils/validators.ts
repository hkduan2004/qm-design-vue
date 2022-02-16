/*
 * @Author: 焦质晔
 * @Date: 2021-02-20 10:51:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:37:17
 */
import { isNumber } from './util';

export const isValidWidthUnit = (val: string | number): boolean => {
  if (isNumber(val)) {
    return true;
  } else {
    return ['px', 'rem', 'em', 'vw', 'vh', '%'].some((unit) => (val as string).endsWith(unit)) || (val as string).startsWith('calc');
  }
};

export const isValidComponentSize = (val: string): boolean => ['', 'medium', 'small', 'mini'].includes(val);
