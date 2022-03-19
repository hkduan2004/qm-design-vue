/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 10:27:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:48:36
 */
import { deepFindRowKey, isArrayContain } from '../utils';
import type { Nullable } from '../../../_utils/types';
import type { IDerivedColumn, IRecord } from '../table/types';
import config from '../config';

const selectionMixin = {
  methods: {
    // 创建选择列
    createSelectionColumn(options): Nullable<IDerivedColumn> {
      if (!options) {
        return null;
      }
      const { type } = options;
      return {
        dataIndex: config.selectionColumn,
        title: type === 'radio' ? this.$t('qm.table.config.selectionText') : '',
        width: config.selectionColumnWidth,
        fixed: 'left',
        type,
      };
    },
    createTreeSelectionKeys(key: string, arr: string[]): string[] {
      const { deriveRowKeys } = this;
      const target = deepFindRowKey(deriveRowKeys, key);
      let result: string[] = [];
      if (!target) {
        return result;
      }
      const childRowKeys = this.getAllChildRowKeys(target?.children || []);
      const parentRowKeys = this.findParentRowKeys(deriveRowKeys, key);
      // 处理后代节点
      result = [...new Set([...arr, ...childRowKeys])];
      // 处理祖先节点
      parentRowKeys.forEach((x) => {
        const target = deepFindRowKey(deriveRowKeys, x);
        const isContain = isArrayContain(result, target?.children?.map((k) => k.rowKey) || []);
        if (isContain) {
          result = [...result, x];
        } else {
          result = result.filter((k) => k !== x);
        }
      });
      return result;
    },
    createSelectionRows(selectedKeys: string[]): IRecord[] {
      const { allTableData, allRowKeysMap, selectionRows, getRowKey, isFetch } = this;
      if (isFetch) {
        return [
          ...selectionRows.filter((row) => selectedKeys.includes(getRowKey(row, row.index))),
          ...allTableData.filter((row) => {
            let rowKey = getRowKey(row, row.index);
            return selectedKeys.includes(rowKey) && selectionRows.findIndex((row) => getRowKey(row, row.index) === rowKey) === -1;
          }),
        ];
      }
      const result: IRecord[] = [];
      for (let i = 0, len = selectedKeys.length; i < len; i++) {
        let key = selectedKeys[i];
        if (!allRowKeysMap.has(key)) continue;
        result.push(allTableData[allRowKeysMap.get(key)]);
      }
      return result;
    },
    // 选择列已选中 keys
    createSelectionKeys(keys?: string[]): string[] {
      const { rowSelection, selectionKeys, isTreeTable } = this;
      const { type, checkStrictly = !0 } = rowSelection || {};
      const rowSelectionKeys = Array.isArray(keys) ? keys : selectionKeys;
      let result: string[] = [];
      if (isTreeTable && !checkStrictly) {
        rowSelectionKeys.forEach((x) => {
          result.push(...this.createTreeSelectionKeys(x, rowSelectionKeys));
        });
      }
      const selectedKeys = type === 'radio' ? rowSelectionKeys.slice(0, 1) : [...new Set([...rowSelectionKeys, ...result])];
      this.selectionRows = this.createSelectionRows(selectedKeys);
      return selectedKeys;
    },
  },
};

export default selectionMixin;
