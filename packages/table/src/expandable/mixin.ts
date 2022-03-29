/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 10:27:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 19:27:33
 */
import { deepGetRowkey } from '../utils';
import { warn } from '../../../_utils/error';
import config from '../config';

import type { Nullable } from '../../../_utils/types';
import type { IDerivedColumn } from '../table/types';

const expandableMixin = {
  methods: {
    // 创建展开列
    createExpandableColumn(options): Nullable<IDerivedColumn> {
      if (!options?.expandedRowRender) {
        return null;
      }
      return {
        dataIndex: config.expandableColumn,
        title: '',
        width: config.selectionColumnWidth,
        fixed: 'left',
        type: 'expand',
      };
    },
    // 展开行，已展开的 keys
    createRowExpandedKeys(): string[] {
      const { expandable, selectionKeys, allRowKeys, highlightKey, isTreeTable } = this;
      if (isTreeTable && expandable?.expandedRowRender) {
        warn('Table', '树结构表格不能再设置展开行的 `expandedRowRender` 参数');
      }
      const { defaultExpandAllRows, expandedRowKeys = [] } = expandable || {};
      // 树结构
      if (isTreeTable) {
        const mergedRowKeys = [...selectionKeys, ...expandedRowKeys];
        if (highlightKey) {
          mergedRowKeys.unshift(highlightKey);
        }
        let result: string[] = [];
        mergedRowKeys.forEach((key) => {
          result.push(...(deepGetRowkey(this.deriveRowKeys, key)?.slice(0, -1).reverse() || []));
        });
        result = defaultExpandAllRows && !expandedRowKeys.length ? allRowKeys : [...new Set([...expandedRowKeys, ...result])];
        return result.filter((key) => !this.flattenRowKeys.includes(key));
      }
      // 展开行
      if (expandable) {
        return defaultExpandAllRows && !expandedRowKeys.length ? allRowKeys.slice(0) : [...expandedRowKeys];
      }
      return [];
    },
  },
};

export default expandableMixin;
