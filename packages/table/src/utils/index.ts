/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 08:28:55
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-01 09:34:48
 */
import type { VNode } from 'vue';
import { get, set, transform, intersection, cloneDeep, isEqual } from 'lodash-es';
import dayjs from 'dayjs';
import { hasOwn, isVNode, isObject } from '../../../_utils/util';
import { stringify, array_format } from '../filter-sql';
import type { IColumn, IDerivedColumn, IDerivedRowKey, IRecord, IRowKey } from '../table/types';
import type { AnyFunction, AnyObject, Nullable } from '../../../_utils/types';

export { hasOwn };

// 展平 columns
export const columnsFlatMap = (columns: IColumn[]): IColumn[] => {
  const result: IColumn[] = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push(...columnsFlatMap(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

// 筛选 columns
export const createFilterColumns = (columns: IColumn[]): IColumn[] => {
  return columns.filter((column) => {
    if (column.children) {
      column.children = createFilterColumns(column.children);
    }
    return !column.hidden && !column.noAuth;
  });
};

// 所有 columns
export const getAllColumns = (columns: IColumn[]): IColumn[] => {
  const result: IColumn[] = [];
  columns.forEach((column) => {
    result.push(column);
    if (column.children) {
      result.push(...getAllColumns(column.children));
    }
  });
  return result;
};

// 深度遍历 columns
export const mapTableColumns = (columns: IColumn[], callback?: (column: IColumn) => void): IColumn[] => {
  return columns.map((column) => {
    if (column.children) {
      column.children = mapTableColumns(column.children);
    }
    callback?.(column);
    return column;
  });
};

// 深度查找 column by dataIndex
export const deepFindColumn = (columns: IColumn[], mark: string): Nullable<IColumn> => {
  let result: Nullable<IColumn> = null;
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].children) {
      result = deepFindColumn(columns[i].children as IColumn[], mark);
    }
    if (result) {
      return result;
    }
    if (columns[i].dataIndex === mark) {
      return columns[i];
    }
  }
  return result;
};

// 查找最后一级的第一个 column
export const findFirstColumn = (column: IColumn): IColumn => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[0].children) {
      return findFirstColumn(childColumns[0]);
    }
    return childColumns[0];
  }
  return column;
};

// 查找最后一级的最后一个 column
export const findLastColumn = (column: IColumn): IColumn => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[childColumns.length - 1].children) {
      return findLastColumn(childColumns[childColumns.length - 1]);
    }
    return childColumns[childColumns.length - 1];
  }
  return column;
};

// 根据条件过滤 columns
export const filterTableColumns = (columns: IColumn[], marks: string[]): IColumn[] => {
  return columns.filter((x) => !marks.includes(x.dataIndex));
};

// 深度查找 rowKey
export const deepFindRowKey = (rowKeys: IDerivedRowKey[], mark: string): Nullable<IDerivedRowKey> => {
  let result: Nullable<IDerivedRowKey> = null;
  for (let i = 0; i < rowKeys.length; i++) {
    if (rowKeys[i].children) {
      result = deepFindRowKey(rowKeys[i].children as IDerivedRowKey[], mark);
    }
    if (result) {
      return result;
    }
    if (rowKeys[i].rowKey === mark) {
      return rowKeys[i];
    }
  }
  return result;
};

// 展平 tableData
export const tableDataFlatMap = (list: IRecord[]): IRecord[] => {
  const result: IRecord[] = [];
  list.forEach((record) => {
    if (record.children) {
      result.push(...tableDataFlatMap(record.children));
    } else {
      result.push(record);
    }
  });
  return result;
};

// 获取所有 tableData
export const getAllTableData = (list: IRecord[]): IRecord[] => {
  const result: IRecord[] = [];
  list.forEach((record) => {
    result.push(record);
    if (record.children) {
      result.push(...getAllTableData(record.children));
    }
  });
  return result;
};

// 表头分组
export const convertToRows = (columns: IColumn[]): IColumn[][] => {
  let maxLevel = 1;

  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }

    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        if (column.fixed) {
          subColumn.fixed = column.fixed;
        } else {
          delete subColumn.fixed;
        }
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = column.colSpan ?? 1;
    }
  };

  columns.forEach((column: IDerivedColumn) => {
    column.level = 1;
    traverse(column, null);
  });

  const rows: IColumn[][] = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(columns);

  allColumns.forEach((column: IDerivedColumn) => {
    if (!column.children) {
      column.rowSpan = maxLevel - (column.level as number) + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[(column.level as number) - 1].push(column);
  });

  return rows;
};

// 获取元素相对于 目标祖先元素 的位置
export const getNodeOffset = (el: Nullable<HTMLElement>, container: HTMLElement, rest = { left: 0, top: 0 }) => {
  if (el) {
    const parentElem = el.parentNode as Nullable<HTMLElement>;
    rest.top += el.offsetTop;
    rest.left += el.offsetLeft;
    if (parentElem && parentElem !== document.documentElement && parentElem !== document.body) {
      rest.top -= parentElem.scrollTop;
      rest.left -= parentElem.scrollLeft;
    }
    if (container && (el === container || el.offsetParent === container) ? 0 : el.offsetParent) {
      return getNodeOffset(el.offsetParent as HTMLElement, container, rest);
    }
  }
  return rest;
};

// 格式化 DOM 元素高度
export const parseHeight = (height: number | string): Nullable<number | string> => {
  if (typeof height === 'number') {
    return height;
  }
  if (typeof height === 'string') {
    if (/^\d+(?:px)?$/.test(height)) {
      return Number.parseInt(height, 10);
    } else {
      return height;
    }
  }
  return null;
};

// 比对两个对象的差异
export const difference = <T extends AnyObject<any>>(obj: T, base: T): T => {
  return transform(obj, (result: any, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
};

// 筛选指定的对象属性
export const filterAttrs = <T extends AnyObject<any>>(obj: T, arr: string[] = []): T => {
  const result = {} as T;
  for (const key in obj) {
    if (hasOwn(obj, key) && arr.includes(key)) {
      result[key] = cloneDeep(obj[key]); // 深拷贝
    }
  }
  return result;
};

// 判断数组的包含
export const isArrayContain = (targetArr: unknown[], arr: unknown[]): boolean => {
  return intersection(targetArr, arr).length === arr.length;
};

// 获取格式化后的数据
export const getCellValue = (record: IRecord, dataIndex: string): any => {
  return get(record, dataIndex) ?? '';
};

// 设置单元格的数据
export const setCellValue = (record: IRecord, dataIndex: string, val: unknown, precision?: number): void => {
  val = val ?? '';
  if ((precision as number) >= 0 && val !== '') {
    val = Number(val).toFixed(precision);
  }
  set(record, dataIndex, val);
};

// 函数防抖
export const debounce = <T extends AnyFunction<void> & { timer?: any }>(fn: T, delay = 0) => {
  return (...args: any[]): void => {
    fn.timer && clearTimeout(fn.timer);
    fn.timer = setTimeout(() => fn(...args), delay);
  };
};

// 函数截流
export const throttle = <T extends AnyFunction<void> & { lastTime?: number }>(fn: T, limit: number) => {
  return (...args: any[]): void => {
    const nowTime: number = +new Date();
    if (!fn.lastTime || nowTime - fn.lastTime > limit) {
      fn(...args);
      fn.lastTime = nowTime;
    }
  };
};

// 数字格式化
export const formatNumber = (value: number | string): string => {
  value = value.toString();
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
};

// 数值类型校验
export const validateNumber = (val: string): boolean => {
  const regExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
  return (!Number.isNaN(val) && regExp.test(val)) || val === '' || val === '-';
};

// 字符串转数值类型
export const stringToNumber = (input: string): number | '' => {
  if (!validateNumber(input)) return '';
  input = input === '-' ? '' : input;
  return input ? Number(input) : '';
};

// 转日期对象
export const toDate = (val: string): Date | undefined => {
  return val ? dayjs(val).toDate() : undefined;
};

// 转日期格式
export const dateFormat = (val: Date, vf: string): string => {
  return val ? dayjs(val).format(vf) : '';
};

// 获取 VNode 中的文本
export const getVNodeText = <T extends string | number>(val: VNode | T): T[] => {
  const result: T[] = [];
  if (isVNode(val)) {
    if (Array.isArray(val.children)) {
      val.children.forEach((c) => result.push(...getVNodeText(c as any)));
    } else if (val.children) {
      result.push(val.children as T);
    }
  } else {
    result.push(val);
  }
  return result;
};

// 生成 uuid key
export const createUidKey = (key = ''): string => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return key + uuid;
};

// 生成排序的 sql 片段
export const createOrderBy = (sorter: AnyObject<any>): string => {
  const result: string[] = [];
  Object.keys(sorter).forEach((dataIndex) => {
    if (sorter[dataIndex] !== null) {
      result.push(`${dataIndex}|${sorter[dataIndex]}`);
    }
  });
  return result.join(',');
};

// 生成查询条件的 sql 片段
export const createWhereSQL = (filters: any, showType = false): string => {
  let query_str = ``;
  if (!Array.isArray(filters)) {
    const cutStep = 5;
    for (const key in filters) {
      const property = key.includes('|') ? key.split('|')[1] : key;
      const type = key.includes('|') ? key.split('|')[0] : '';
      const filterVal = filters[key];
      for (const mark in filterVal) {
        // 用 ^ 替换字符串中的 空格
        const val = Array.isArray(filterVal[mark]) ? array_format(filterVal[mark]) : stringify(filterVal[mark], '^');
        if (val === "''" || val === '[]') continue;
        query_str += `${!showType ? property : `${property}|${type}`} ${mark} ${val} and `;
      }
    }
    query_str = query_str.slice(0, -1 * cutStep);
  } else {
    let cutStep = 0;
    for (let i = 0, len = filters.length; i < len; i++) {
      const x = filters[i];
      if (!x.fieldName) continue;
      const val = Array.isArray(x.condition) ? array_format(x.condition) : stringify(x.condition, '^');
      query_str += `${x.bracket_left} ${!showType ? x.fieldName : `${x.fieldName}|${x.fieldType}`} ${x.expression} ${val} ${x.bracket_right} ${
        x.logic
      } `;
      cutStep = x.logic.length;
    }
    query_str = query_str.slice(0, -1 * cutStep - 2);
  }
  // console.log('where:', query_str);
  return query_str.replace(/\s+/g, ' ').trim();
};

// 多列分组聚合
export const groupByProps = (array: IRecord[] = [], props: string[] = []): any[][] => {
  const fn = (x) => {
    const res: unknown[] = [];
    props.forEach((k) => res.push(getCellValue(x, k)));
    return res;
  };
  const groups: Record<string, any[]> = {};
  array.forEach((x) => {
    const group = JSON.stringify(fn(x));
    groups[group] = groups[group] || [];
    groups[group].push(x);
  });
  return Object.keys(groups).map((group) => {
    return groups[group];
  });
};

export const deepGetRowkey = (arr: any[], value: string): string[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].rowKey === value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deepGetRowkey(arr[i].children, value);
      if (temp) {
        return [arr[i].rowKey, temp].flat();
      }
    }
  }
};
