/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:31
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-14 14:40:21
 */
import { Ref, toRaw, isVNode, Fragment, Comment, Text, VNode } from 'vue';
import { camelize } from '@vue/shared';
import { isArray, isPlainObject as isObject, isFunction, isString, isNumber, isUndefined, isNull, debounce, throttle } from 'lodash-es';
import isServer from './isServer';
import type { AnyFunction, AnyObject } from './types';

const TEMPLATE = 'template';

export { isObject, isArray, isFunction, isString, isNumber, isUndefined, isNull };

export const isIE = (): boolean => {
  return !isServer && /MSIE|Trident/.test(navigator.userAgent);
};

export const isEdge = (): boolean => {
  return !isServer && navigator.userAgent.indexOf('Edge') > -1;
};

export const isChrome = (): boolean => {
  return !isServer && navigator.userAgent.indexOf('Chrome') > -1 && !isEdge();
};

export const isFirefox = (): boolean => {
  return !isServer && !!navigator.userAgent.match(/firefox/i);
};

export const isSimpleValue = (x: unknown): boolean => {
  const simpleTypes = new Set(['undefined', 'boolean', 'number', 'string']);
  return x === null || simpleTypes.has(typeof x);
};

export { isVNode } from 'vue';

export const isFragment = (c: VNode): boolean => {
  return c && c.type === Fragment;
};

export const isText = (c: VNode): boolean => {
  return c && c.type === Text;
};

export const isComment = (c: VNode): boolean => {
  return c && c.type === Comment;
};

export const isTemplate = (c: VNode): boolean => {
  return c && c.type === TEMPLATE;
};

export const isValidElement = (c: VNode): boolean => {
  return c && isVNode(c) && typeof c.type !== 'symbol'; // remove text node
};

export const isEmptyElement = (c: VNode): boolean => {
  return isComment(c) || (isFragment(c) && !c.children?.length) || (isText(c) && (c.children as string).trim() === '');
};

export const filterEmptyElement = (children: Array<VNode> = []): Array<VNode> => {
  return children.filter((c) => !isEmptyElement(c));
};

export const hasOwn = <T extends AnyObject<unknown>>(obj: T, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export { camelize };

export const noop = (): void => {};

// 函数的 防抖 和 节流，使用 lodash 工具函数
export { debounce, throttle };

export const isEmpty = (val: unknown): boolean => {
  if ((!val && val !== 0) || (isArray(val) && !val.length) || (isObject(val) && !Object.keys(val as any).length)) {
    return true;
  }
  return false;
};

export const isValid = (val: string): boolean => {
  return val !== undefined && val !== null && val !== '';
};

export const getValueByPath = (obj: AnyObject<any>, paths = ''): unknown => {
  let ret = obj;
  paths.split('.').map((path) => {
    ret = ret?.[path];
  });
  return ret;
};

export const getParserWidth = (val: number | string): string => {
  if (isNumber(val)) {
    return `${val}px`;
  }
  return val.toString();
};

export const $ = <T>(ref: Ref<T>): unknown => {
  return ref.value;
};

/**
 * @description 深拷贝目标对象，同时把 Proxy 转成 普通对象
 * @param {object | array}} target 目标对象
 * @returns 转换后的对象
 */
export const deepToRaw = <T>(target: T): T => {
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  const clone: any = Array.isArray(target) ? [] : {};
  for (const [key, value] of Object.entries(target)) {
    if (hasOwn(target as any, key)) {
      clone[key] = deepToRaw(toRaw(value));
    }
  }
  return clone;
};

function forEach(array, iteratee) {
  let index = -1;
  const length = array.length;
  while (++index < length) {
    iteratee(array[index], index);
  }
  return array;
}

export const deepClone = (target: object, map = new WeakMap()) => {
  if (typeof target === 'object') {
    const isArray = Array.isArray(target);
    const cloneTarget = isArray ? [] : {};
    if (map.get(target)) {
      return target;
    }
    map.set(target, cloneTarget);
    const keys = isArray ? undefined : Object.keys(target);
    forEach(keys || target, (value, key) => {
      if (keys) {
        key = value;
      }
      cloneTarget[key] = deepClone(target[key], map);
    });
    return cloneTarget;
  } else {
    return target;
  }
};

/**
 * @description 延迟方法，异步函数
 * @param {number} delay 延迟的时间，单位 毫秒
 * @returns
 */
export const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * @description 捕获基于 Promise 操作的异常
 * @param {func} asyncFn 异步函数
 * @param {any} params 函数的参数
 * @returns {array} 错误前置
 */
export const errorCapture = async (asyncFn: AnyFunction<any>, ...params: any[]): Promise<any[]> => {
  try {
    const res = await asyncFn(...params);
    return [null, res];
  } catch (e) {
    return [e, null];
  }
};

/**
 * @description 合并组件参数的默认值
 * @param {object} propTypes 已声明的 propType
 * @param {object} defaultProps 默认值
 * @returns
 */
export const initDefaultProps = <T extends Record<string, unknown>>(
  propTypes: T,
  defaultProps: {
    [P in keyof T]?: unknown;
  }
): T => {
  Object.keys(defaultProps).forEach((k) => {
    if (propTypes[k]) {
      (propTypes[k] as any).def(defaultProps[k]);
    } else {
      throw new Error(`not have ${k} prop`);
    }
  });
  return propTypes;
};

function generateFlattenMap(source) {
  const map: Map<string, any> = new Map();
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value)) {
      const deepMap = generateFlattenMap(value);
      for (const [mapKey, mapValue] of deepMap.entries()) {
        map.set(`${key}.${mapKey}`, mapValue);
      }
    } else {
      map.set(key, value);
    }
  }

  return map;
}

export const flatJson = <T extends Record<string, any>>(jsonObject: T): T => {
  const map = generateFlattenMap(jsonObject);

  const flatten: any = {};
  for (const [key, value] of map.entries()) {
    flatten[key] = value;
  }

  return flatten;
};
