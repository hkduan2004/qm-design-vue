/*
 * @Author: 焦质晔
 * @Date: 2020-04-14 16:03:27
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-07 18:58:50
 */
import { intersection } from 'lodash-es';
import { isObject, isFunction } from '../../../_utils/util';
import { getCellValue, setCellValue } from '../utils';
import { IRowKey } from './types';
import type { AnyFunction, AnyObject } from '../../../_utils/types';

import config from '../config';

type ITableLog = {
  required: Array<Record<string, unknown>>;
  validate: Array<Record<string, unknown>>;
  inserted: Array<Record<string, unknown>>;
  updated: Array<Record<string, unknown>>;
  removed: Array<Record<string, unknown>>;
};

type IRecord = {
  index: number;
  pageIndex: number;
  [key: string]: unknown;
};

export default {
  // 计算表格高度
  CALCULATE_HEIGHT(): void {
    this.$nextTick(() => this.calcTableHeight());
  },
  // 刷新表格数据
  async DO_REFRESH(callback?: AnyFunction<void>): Promise<void> {
    this.clearRowHighlight();
    if (this.rowSelection?.clearableAfterFetched) {
      this.clearRowSelection();
    }
    await this.getTableData();
    callback?.();
  },
  // 获取表格操作记录
  GET_LOG(): ITableLog {
    const { required, validate, inserted, updated, removed } = this.store.state;
    // 求 inserted, removed 的交集
    const intersections = intersection(inserted, removed);
    return {
      required: required.map((item) => ({ rowKey: item.x, dataIndex: item.y, text: item.text })),
      validate: validate.map((item) => ({ rowKey: item.x, dataIndex: item.y, text: item.text })),
      inserted: inserted.filter((row) => !intersections.includes(row)),
      updated: updated.filter((row) => ![...intersection(updated, inserted), ...intersection(updated, removed)].includes(row)),
      removed: removed.filter((row) => !intersections.includes(row)),
    };
  },
  // 获取表格的查询参数
  GET_FETCH_PARAMS(): AnyObject<unknown> {
    const params = {};
    for (const key in this.fetchParams) {
      // 过滤分页参数
      if (Object.keys(this.pagination).includes(key)) continue;
      params[key] = this.fetchParams[key];
    }
    return params;
  },
  // 打开单元格搜索帮助面板
  OPEN_SEARCH_HELPER(rowKey: IRowKey, dataIndex: string): void {
    const editableCell = this.tableBodyRef.$refs[`${rowKey}-${dataIndex}`];
    if (!editableCell) return;
    editableCell.shVisible = !0;
  },
  // 清空表格数据
  CLEAR_TABLE_DATA(): void {
    if (this.isFetch) {
      this.setRecordsTotal(0);
    } else {
      // 清空列选中
      this.clearRowSelection();
      // 清空行高亮
      this.clearRowHighlight();
      // 清空表头排序
      this.clearTableSorter();
      // 清空表头筛选
      this.clearTableFilter();
      // 清空高级检索
      this.clearSuperSearch();
      // 清空表格操作记录
      this.clearTableLog();
    }
    this.createTableData([]);
  },
  // 清空表格操作记录
  CLEAR_LOG(): void {
    this.clearTableLog();
  },
  // 选中首行数据
  SELECT_FIRST_RECORD(): void {
    this.selectFirstRow(true);
  },
  // 清空表格焦点
  CLEAR_TABLE_FOCUS(): void {
    this.tableBodyRef.setClickedValues([]);
  },
  // 滚动到指定数据行
  SCROLL_TO_RECORD(rowKey: IRowKey): void {
    this.tableBodyRef.scrollYToRecord(rowKey);
  },
  // 滚动到指定表格列
  SCROLL_TO_COLUMN(dataIndex: string): void {
    this.tableBodyRef.scrollXToColumn(dataIndex);
  },
  // 表格数据插入
  INSERT_RECORDS<T extends IRecord>(records: T | T[]): void {
    const rows = (Array.isArray(records) ? records : [records]).filter((x) => isObject(x));
    const lastIndex = this.tableOriginData[this.tableOriginData.length - 1]?.index ?? -1;
    if (!rows.length) return;
    rows.forEach((row, index) => {
      const curIndex = lastIndex + index + 1;
      // 初始化数据
      this.flattenColumns.forEach((column) => {
        const { dataIndex } = column;
        if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
        setCellValue(row, dataIndex, getCellValue(row, dataIndex));
      });
      // 数据索引
      row.index = curIndex;
      // 分页索引
      row.pageIndex = this.createPageIndex(curIndex);
      // 添加表格操作记录
      this.store.addToInserted(row);
    });
    // 处理插入数据
    this.setTableFullData(this.tableFullData.concat(rows));
    this.createTableOriginData(this.tableFullData);
    // 滚动条定位
    const lastRowKey = this.getRowKey(rows[rows.length - 1], rows[rows.length - 1].index);
    this.$nextTick(() => {
      this.isWebPagination && this.toLastPage();
      this.tableBodyRef.scrollYToRecord(lastRowKey);
    });
  },
  // 删除数据
  REMOVE_RECORDS<T extends IRecord | IRowKey>(records: T | T[]): void {
    const rows = Array.isArray(records) ? records : [records];
    const rowKeys = rows.map((x) => (isObject(x) ? this.getRowKey(x, (x as IRecord).index) : x));
    const editableColumns = this.flattenColumns.filter((column) => isFunction(column.editRender));
    let isRemoved = false;
    for (let i = 0; i < this.tableFullData.length; i++) {
      const row = this.tableFullData[i];
      const rowKey = this.getRowKey(row, row.index);
      if (rowKeys.includes(rowKey)) {
        this.store.addToRemoved(row);
        // 移除表单校验记录
        editableColumns.forEach((column) => {
          const { dataIndex, editRender } = column;
          const options = editRender(row);
          if (!options) return;
          const { rules = [], disabled } = options;
          if (!disabled && rules.length) {
            this.store.removeFromRequired({ x: rowKey, y: dataIndex });
            this.store.removeFromValidate({ x: rowKey, y: dataIndex });
          }
        });
        // 移除选择列数据
        if (this.selectionKeys.includes(rowKey)) {
          this.removeSelectionKey(rowKey);
        }
        // 移除高亮行数据
        if (rowKey === this.highlightKey) {
          this.clearRowHighlight();
        }
        // 移除展开行数据
        if (this.rowExpandedKeys.includes(rowKey)) {
          this.removeExpandableKey(rowKey);
        }
        // 移除数据
        this.tableFullData.splice(i, 1);
        // 移动下标
        i = i - 1;
        isRemoved = true;
      }
    }
    if (isRemoved) {
      // 触发数据数据响应式
      this.setTableFullData(this.tableFullData.slice(0));
      this.createTableOriginData(this.tableFullData);
    }
  },
  // 表单校验
  FORM_VALIDATE(): Pick<ITableLog, 'required' | 'validate'> {
    const editableColumns = this.flattenColumns.filter((column) => isFunction(column.editRender));
    this.allTableData.forEach((record) => {
      editableColumns.forEach((column) => {
        const { dataIndex, editRender } = column;
        const options = editRender(record);
        if (!options) return;
        const { rules = [], disabled } = options;
        if (!disabled && rules.length) {
          this.createFieldValidate(rules, getCellValue(record, dataIndex), this.getRowKey(record, record.index), dataIndex);
        }
      });
    });
    const { required, validate } = this.GET_LOG();
    const result = [...required, ...validate];
    // 定位未通过校验的字段
    if (result.length) {
      this.tableBodyRef.scrollYToRecord(result[0].rowKey);
    }
    return { required, validate };
  },
};
