/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 10:24:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 11:53:35
 */
import { transform, isEqual } from 'lodash-es';
import { isObject } from '../../_utils/util';
import dayjs from 'dayjs';
import type { AnyObject, Nullable } from '../../_utils/types';

export const noop = (): void => {};

export const isEmptyValue = (value: unknown) => value === '' || value === undefined || value === null;

// 转日期对象
export const toDate = (val: string | string[]): Date | Date[] => {
  const vals: string[] = Array.isArray(val) ? val : [val];
  const result: Date[] = vals.map((x) => {
    return x ? dayjs(x).toDate() : undefined;
  }) as Date[];
  return Array.isArray(val) ? result : result[0];
};

// 转日期格式
export const dateFormat = (val: Date | Date[], vf: string): string | string[] => {
  const vals: Date[] = Array.isArray(val) ? val : [val];
  const result: string[] = vals.map((x) => {
    return x ? dayjs(x).format(vf) : undefined;
  }) as string[];
  return Array.isArray(val) ? result : result[0];
};

// 设置日期控件的禁用状态
export const setDisabledDate = (oDate: Date, [minDateTime, maxDateTime]): boolean => {
  const min = minDateTime ? dayjs(minDateTime).toDate().getTime() : 0;
  const max = maxDateTime ? dayjs(maxDateTime).toDate().getTime() : 0;
  if (min && max) {
    return !(oDate.getTime() >= min && oDate.getTime() <= max);
  }
  if (min) {
    return oDate.getTime() < min;
  }
  if (max) {
    return oDate.getTime() > max;
  }
  return false;
};

// 数值类型格式化
export const formatNumber = (value: string | number): string => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const parserNumber = (value: string): string => value.replace(/\$\s?|(,*)/g, '');

// 表单字段值加密
export const secretFormat = (value = '', type: string): string => {
  value += '';
  if (type === 'finance') {
    value = formatNumber(value);
  }
  if (type === 'name') {
    value = value.replace(/^([\u4e00-\u9fa5]{1}).+$/, '$1**');
  }
  if (type === 'phone') {
    value = value.replace(/^(\d{3}).+(\d{4})$/, '$1****$2');
  }
  if (type === 'IDnumber') {
    value = value.replace(/^(\d{3}).+(\w{4})$/, '$1***********$2');
  }
  if (type === 'bankNumber') {
    value = value.replace(/^(\d{4}).+(\w{3})$/, '$1************$2');
  }
  return value;
};

export const difference = <T extends AnyObject<any>>(object: T, base: T): T => {
  return transform(object, (result: any, value: any, key) => {
    if (!isEqual(value ?? '', base[key] ?? '')) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
};

export const deepFind = <T>(arr: T[], mark: string): Nullable<T> => {
  let res: Nullable<T> = null;
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray((arr[i] as any).children)) {
      res = deepFind((arr[i] as any).children, mark);
    }
    if (res) {
      return res;
    }
    if ((arr[i] as any).value === mark) {
      return arr[i];
    }
  }
  return res;
};

export const deepMapList = <T>(list: T[], valueKey: string, textKey: string): T[] => {
  return list.map((x: any) => {
    const item = { value: x[valueKey], text: x[textKey] } as any;
    x.disabled && (item.disabled = true);
    if (Array.isArray(x.children)) {
      item.children = deepMapList(x.children, valueKey, textKey);
    }
    return item;
  });
};

export const deepFindValues = <T>(arr: T[], str: string, depth = 0): T[] => {
  const result: T[] = [];
  arr.forEach((x: any) => {
    if (x.value == str.split(',')[depth]) {
      result.push(x);
    }
    if (Array.isArray(x.children)) {
      result.push(...deepFindValues<T>(x.children, str, depth + 1));
    }
  });
  return result;
};

export const deepGetPath = (arr: any[], value: string): string[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value == value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deepGetPath(arr[i].children, value);
      if (temp) {
        return [arr[i].value, temp].flat();
      }
    }
  }
};
