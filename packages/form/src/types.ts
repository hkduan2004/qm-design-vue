/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 13:02:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-13 08:39:51
 */
import { CSSProperties, PropType, Component } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { isNumber } from '../../_utils/util';
import { isValidWidthUnit, isValidComponentSize } from '../../_utils/validators';
import { noop } from './utils';
import type { JSXNode, AnyFunction, Nullable, ComponentSize, AnyObject, ValueOf } from '../../_utils/types';

export const DEFAULT_ROWS = 1;
export const DEFAULT_COL_WIDTH = 300;
export const DEFAULT_TRUE_VALUE = '1';
export const DEFAULT_FALSE_VALUE = '0';

export type IFormType = 'default' | 'search' | 'onlyShow';

export type ISecretType = 'finance' | 'name' | 'phone' | 'IDnumber' | 'bankNumber';

export type IDateType =
  | 'date'
  | 'datetime'
  | 'exactdate'
  | 'daterange'
  | 'datetimerange'
  | 'exactdaterange'
  | 'week'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange';

export type IFormItemType =
  | 'BREAK_SPACE'
  | 'INPUT'
  | 'RANGE_INPUT'
  | 'INPUT_NUMBER'
  | 'RANGE_INPUT_NUMBER'
  | 'TREE_SELECT'
  | 'MULTIPLE_TREE_SELECT'
  | 'CASCADER'
  | 'MULTIPLE_CASCADER'
  | 'SELECT'
  | 'MULTIPLE_SELECT'
  | 'REGION_SELECT'
  | 'CITY_SELECT'
  | 'SWITCH'
  | 'RADIO'
  | 'CHECKBOX'
  | 'MULTIPLE_CHECKBOX'
  | 'TEXT_AREA'
  | 'SEARCH_HELPER'
  | 'IMMEDIATE'
  | 'DATE'
  | 'RANGE_DATE'
  | 'RANGE_DATE_EL'
  | 'TIME'
  | 'RANGE_TIME'
  | 'TIME_SELECT'
  | 'RANGE_TIME_SELECT'
  | 'UPLOAD_IMG'
  | 'UPLOAD_FILE'
  | 'TINYMCE';

export const ARRAY_TYPE: IFormItemType[] = [
  'RANGE_INPUT',
  'RANGE_INPUT_NUMBER',
  'MULTIPLE_TREE_SELECT',
  'MULTIPLE_CASCADER',
  'MULTIPLE_SELECT',
  'MULTIPLE_CHECKBOX',
  'RANGE_DATE',
  'RANGE_DATE_EL',
  'RANGE_TIME',
  'RANGE_TIME_SELECT',
  'UPLOAD_IMG',
  'UPLOAD_FILE',
];
export const FORMAT_TYPE: IFormItemType[] = ['RANGE_INPUT', 'RANGE_INPUT_NUMBER', 'RANGE_DATE', 'RANGE_DATE_EL', 'RANGE_TIME', 'RANGE_TIME_SELECT'];
export const UNFIX_TYPE: IFormItemType[] = ['TEXT_AREA', 'MULTIPLE_CHECKBOX', 'UPLOAD_IMG', 'UPLOAD_FILE', 'TINYMCE'];

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

export type IDictDeep = IDict & {
  children?: Array<IDict> | Nullable<undefined>;
};

export type IFormData = Record<string, string | number | Array<string | number> | undefined>;

export type IFormItem = {
  type: IFormItemType;
  fieldName: string;
  label: string;
  labelWidth?: number | string;
  description?: string;
  hidden?: boolean;
  noAuth?: boolean;
  invisible?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>[];
  selfCols?: number;
  offsetLeft?: number;
  offsetRight?: number;
  style?: CSSProperties;
  id?: string;
  options?: {
    itemList?: IDict[];
    secretType?: ISecretType;
    trueValue?: number | string;
    falseValue?: number | string;
    dateType?: IDateType;
    minDateTime?: string;
    maxDateTime?: string;
    defaultTime?: string;
    shortCuts?: boolean;
    unlinkPanels?: boolean;
    startDisabled?: boolean;
    endDisabled?: boolean;
    columns?: Record<string, string>[];
    itemRender?: AnyFunction<JSXNode>;
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    onlySelect?: boolean;
    limit?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    minlength?: number;
    maxlength?: number;
    prefixIcon?: Component;
    suffixIcon?: Component;
    rows?: number;
    maxrows?: number;
    showLimit?: boolean;
    password?: boolean;
    noInput?: boolean;
    toUpper?: boolean;
    toFinance?: boolean;
    filterable?: boolean;
    collapseTags?: boolean;
    openPyt?: boolean;
    onInput?: AnyFunction<any>;
    onClick?: AnyFunction<any>;
    onDblClick?: AnyFunction<any>;
    onEnter?: AnyFunction<any>;
    onFocus?: AnyFunction<any>;
    onBlur?: AnyFunction<any>;
  };
  searchHelper?: {
    name?: string;
    filters?: Array<IFormItem>;
    initialValue?: AnyObject<ValueOf<IFormData>>;
    showFilterCollapse?: boolean;
    table?: {
      fetch?: AnyObject<unknown>;
      columns?: Array<unknown>;
      rowKey?: string | AnyFunction<string | number>;
      webPagination?: boolean;
    };
    closeServerMatch?: boolean;
    filterAliasMap?: AnyFunction<string[]>;
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    getServerConfig?: AnyFunction<Promise<unknown>>;
    fieldsDefine?: Record<string, string>;
    beforeOpen?: AnyFunction<void | Promise<void> | boolean>;
    open?: AnyFunction<void | Promise<void> | boolean>;
    closed?: AnyFunction<void>;
  };
  request?: {
    fetchApi?: AnyFunction<any>;
    fetchStreetApi?: AnyFunction<any>;
    params?: Record<string, any>;
    dataKey?: string;
    valueKey?: string;
    textKey?: string;
  };
  upload?: {
    actionUrl: string;
    headers?: AnyObject<string>;
    params?: AnyObject<any>;
    fileTypes?: Array<string>;
    fileSize?: number;
    limit?: number;
    titles?: Array<string>;
    fixedSize?: Array<number>;
    isCalcHeight?: boolean;
  };
  collapse?: {
    defaultExpand?: boolean;
    showLimit?: number;
    remarkItems?: Array<{ fieldName: string; isLabel?: boolean }>;
    onCollapse?: AnyFunction<any>;
  };
  labelOptions?: IFormItem;
  descOptions?: {
    content?: string | JSXNode;
    style?: CSSProperties;
    isTooltip?: boolean;
  };
  placeholder?: string | [string, string];
  clearable?: boolean;
  readonly?: boolean;
  noResetable?: boolean;
  onChange?: AnyFunction<void>;
  render?: AnyFunction<JSXNode>;
};

export type IFormDesc = Record<string, string>;

export const props = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      fieldName: PropTypes.string,
    }).loose
  ).def([]),
  labelWidth: {
    type: [Number, String] as PropType<number | string>,
    default: '80px',
    validator: (val: number | string): boolean => {
      return isNumber(val) || isValidWidthUnit(val);
    },
  },
  formType: {
    type: String as PropType<IFormType>,
    default: 'default',
    validator: (val: string): boolean => {
      return ['default', 'search', 'onlyShow'].includes(val);
    },
  },
  initialValue: {
    type: Object as PropType<IFormData>,
    default: () => ({}),
  },
  size: {
    type: String as PropType<ComponentSize>,
    validator: isValidComponentSize,
  },
  uniqueKey: {
    type: String,
  },
  customClass: {
    type: String,
  },
  cols: {
    type: Number,
  },
  defaultRows: {
    type: Number,
    default: DEFAULT_ROWS,
  },
  authConfig: PropTypes.shape({
    fetch: PropTypes.shape({
      api: PropTypes.func.isRequired,
      params: PropTypes.object,
      dataKey: PropTypes.string,
    }),
  }),
  isFieldsDefine: PropTypes.bool,
  isCollapse: PropTypes.bool.def(true),
  isAutoFocus: PropTypes.bool.def(true),
  isSearchBtn: PropTypes.bool.def(true),
  isSubmitBtn: PropTypes.bool,
  fieldsChange: {
    type: Function as AnyFunction<void>,
    default: noop,
  },
};
