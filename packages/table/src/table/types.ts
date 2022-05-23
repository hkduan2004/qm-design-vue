/*
 * @Author: 焦质晔
 * @Date: 2021-03-06 15:11:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-15 11:20:54
 */
import type { AnyFunction, AnyObject, ComponentSize, JSXNode, Nullable } from '../../../_utils/types';

export const DEFAULT_TRUE_VALUE = '1';
export const DEFAULT_FALSE_VALUE = '0';
export const DEFAULT_DISTANCE = 10;

export type ITableSize = 'default' | ComponentSize;

export type IFixed = 'left' | 'right';

export type IAlign = 'left' | 'center' | 'right';

export type IFilterType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date';

export type IEditerType =
  | 'text'
  | 'number'
  | 'select'
  | 'select-multiple'
  | 'checkbox'
  | 'switch'
  | 'search-helper'
  | 'tree-helper'
  | 'date'
  | 'datetime'
  | 'time';

export type ISelectionType = 'checkbox' | 'radio';

export type IRowKey = string | number;

export enum EAlign {
  left = 'flex-start',
  right = 'flex-end',
}

export type IFormatType =
  | 'date'
  | 'datetime'
  | 'dateShortTime'
  | 'percent'
  | 'finance'
  | 'secret-name'
  | 'secret-phone'
  | 'secret-IDnumber'
  | 'secret-bankNumber';

export type ICellSpan = {
  rowspan: number;
  colspan: number;
};

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

export type IDictDeep = IDict & {
  children?: Array<IDict> | Nullable<undefined>;
};

export type IPagination = {
  currentPage: number;
  pageSize: number;
  pagerCount?: number;
  layout?: string;
  pageSizeOptions?: number[];
};

export type IRule = {
  required?: boolean;
  message?: string;
  validator?: AnyFunction<boolean>;
};

export type IFilter = {
  [key: string]: any;
};

export type ISorter = {
  [key: string]: string;
};

export type ISuperFilter = {
  type: string;
  bracketLeft: string;
  fieldName: string;
  expression: string;
  value: unknown;
  bracketRright: string;
  logic: string;
};

export type IEditerReturn = {
  type: IEditerType;
  items?: Array<IDict>;
  editable?: boolean;
  disabled?: boolean;
  extra?: {
    maxlength?: number;
    max?: number;
    min?: number;
    trueValue?: string | number;
    falseValue?: string | number;
    minDateTime?: string;
    maxDateTime?: string;
    text?: string;
    disabled?: boolean;
    clearable?: boolean;
    collapseTags?: boolean;
  };
  helper?: {
    filters?: AnyObject<any>;
    table?: AnyObject<any>;
    tree?: AnyObject<any>;
    remoteMatch?: boolean;
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    beforeOpen?: AnyFunction<void | Promise<void> | boolean>;
    opened?: AnyFunction<void>;
    beforeClose?: AnyFunction<void | Promise<void> | boolean>;
    closed?: AnyFunction<void>;
  };
  rules?: IRule[];
  onInput?: AnyFunction<void>;
  onChange?: AnyFunction<void>;
  onEnter?: AnyFunction<void>;
  onClick?: AnyFunction<void>;
};

export type IFetchFn = AnyFunction<Promise<any>>;

export type IFetchParams = AnyObject<unknown> & {
  currentPage: number;
  pageSize: number;
};

export type IFetch = {
  api: IFetchFn;
  params?: IFetchParams;
  beforeFetch?: AnyFunction<boolean>;
  xhrAbort?: boolean;
  stopToFirst?: boolean;
  dataKey?: string;
  callback?: AnyFunction<void>;
};

export type IColumn = {
  dataIndex: string;
  title: string;
  description?: string;
  colSpan?: number;
  rowSpan?: number;
  width?: number;
  renderWidth?: number | null;
  fixed?: IFixed;
  align?: IAlign;
  printFixed?: boolean;
  hidden?: boolean;
  noAuth?: boolean;
  ellipsis?: boolean;
  canCopy?: boolean;
  className?: string;
  children?: Array<IColumn> | Nullable<undefined>;
  sorter?: boolean | AnyFunction<void>;
  filter?: {
    type?: IFilterType;
    items?: Array<IDict>;
  };
  precision?: number;
  formatType?: IFormatType;
  required?: boolean;
  editRender?: AnyFunction<IEditerReturn>;
  dictItems?: Array<IDict>;
  summation?: {
    sumBySelection?: boolean;
    displayWhenNotSelect?: boolean;
    dataKey?: string;
    unit?: string;
    render?: AnyFunction<JSXNode>;
    onChange?: AnyFunction<void>;
  };
  groupSummary?: {
    dataKey?: string;
    unit?: string;
    render?: AnyFunction<JSXNode>;
  };
  headRender?: AnyFunction<JSXNode | string>;
  render?: AnyFunction<JSXNode | string | number>;
};

export type IDerivedColumn = IColumn & {
  type?: string;
  level?: number;
  parentDataIndex?: string;
};

export type IDerivedRowKey = {
  level: number;
  rowKey: IRowKey;
  rowKeyPath: string;
  parentRowKey?: IRowKey;
  children?: IDerivedRowKey[];
};

export type IRecord<T = any> = {
  [key: string]: T;
};
