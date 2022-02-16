/*
 * @Author: 焦质晔
 * @Date: 2020-03-01 15:20:02
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 14:15:04
 */
import { ComponentInternalInstance } from 'vue';
import { get } from 'lodash-es';
import { difference, hasOwn, debounce, mapTableColumns, deepFindColumn, filterAttrs, getCellValue, setCellValue } from '../utils';
import { deepToRaw, isObject, isFunction } from '../../../_utils/util';
import { warn } from '../../../_utils/error';
import type { IRecord, ISuperFilter, IDerivedRowKey, IColumn, IPagination, IFetchParams, ICellSpan } from './types';
import config from '../config';

export default {
  // 表格初始化
  initialTable(): void {
    this.getTableAuth();
    if (this.isFetch) {
      this.getTableData();
    } else {
      this.createTableData(this.dataSource);
    }
  },
  // 创建表格数据
  createTableData(list: IRecord[]): void {
    const resetRowData = (arr: IRecord[]): IRecord[] => {
      return arr.map((record, index) => {
        if (Array.isArray(record.children) && record.children.length) {
          record.children = resetRowData(record.children);
        }
        // 数据索引
        record.index = index;
        // 分页索引
        record.pageIndex = this.createPageIndex(index);
        return record;
      });
    };
    const results: IRecord[] = this.createGroupData(resetRowData(list));
    // 设置表格数据
    this.setTableFullData(results);
    this.createTableOriginData(results);
    // 行选中 & 自动获得焦点
    this.$nextTick(() => {
      // 设置选择列
      this.selectionKeys = this.createSelectionKeys();
      // 设置展开行
      this.rowExpandedKeys = this.createRowExpandedKeys();
      // 滚动加载 & currentPage > 1
      if (this.isScrollPagination && this.pagination.currentPage > 1) return;
      this.selectFirstRow();
      // 解决热更新可能会报 `tableBodyRef` 空指针错误
      this.tableBodyRef?.createInputFocus();
      this.tableBodyRef?.resetTableBodyScroll();
    });
  },
  // 设置表格当前状态的全量数据
  setTableFullData(list: IRecord[]): void {
    this.tableFullData = list;
    this.loadTableData();
    if (!this.isFetch) {
      this.setRecordsTotal(list.length);
    }
    this.dataChangeHandle();
  },
  // 创建表格原始数据
  createTableOriginData(list: IRecord[]): void {
    this.tableOriginData = [...list];
    this.allRowKeysMap.clear();
    list.forEach((x, i) => this.allRowKeysMap.set(this.getRowKey(x, i), i));
  },
  // 服务端合计
  createSummation(data: Record<string, any>): void {
    if (!this.isServiceSummation) return;
    const dataKey = this.summation?.fetch?.dataKey ?? config.summationKey;
    const summationData = (dataKey ? get(data, dataKey) : data) ?? {};
    this.flattenColumns
      .filter((x) => !!x.summation?.dataKey)
      .forEach((x) => {
        setCellValue(this.summaries, x.dataIndex, Number(getCellValue(summationData, x.summation.dataKey)));
      });
  },
  // ajax 获取权限
  async getTableAuth(): Promise<void> {
    if (!this.authConfig?.fetch) return;
    const { api, params, columnDataKey, exportDataKey, printDataKey } = this.authConfig.fetch;
    try {
      const res = await api(params);
      if (res.code === 200) {
        if (columnDataKey) {
          // 返回不可见列的 dataIndex
          const fieldNames: string[] = get(res.data, columnDataKey) ?? [];
          // true 为反向，默认为正向，正向的意思是设置的字段 fieldNames 不可见
          const reverse = !!get(res.data, 'reverse');
          const columns = mapTableColumns(this.columns, (column: IColumn) => {
            const { dataIndex } = column;
            if (!reverse ? fieldNames.includes(dataIndex) : !fieldNames.includes(dataIndex)) {
              const originColumn = deepFindColumn(this.originColumns, dataIndex) as IColumn;
              column.noAuth = !0;
              originColumn.noAuth = !0;
            }
          });
          this.columnsChange?.(columns);
        }
        if (exportDataKey) {
          this.permission.export = !!get(res.data, exportDataKey);
        }
        if (printDataKey) {
          this.permission.print = !!get(res.data, printDataKey);
        }
      }
    } catch (err) {
      // ...
    }
  },
  // ajax 获取数据
  async getTableData(): Promise<void> {
    const { summation, fetch, fetchParams, pagination, isScrollPagination } = this;
    if (!fetch) return;
    const { beforeFetch = () => !0, xhrAbort = !1 } = fetch;
    if (!beforeFetch(fetchParams) || xhrAbort) return;
    // 是否为滚动加载
    const isScrollLoad: boolean =
      isScrollPagination &&
      fetchParams.currentPage > this.prevParams?.currentPage &&
      this.onlyPaginationChange(fetchParams, this.prevParams || pagination);
    // 是否为单独的合计接口
    const isSummationFetch = !!summation?.fetch?.api;
    // console.log(`ajax 请求参数：`, fetchParams);
    this.showLoading = true;
    try {
      const [res, sum] = !isSummationFetch
        ? [await fetch.api(fetchParams)]
        : await Promise.all([fetch.api(fetchParams), summation.fetch.api(fetchParams)]);
      const isSuccess = !isSummationFetch ? res.code === 200 : res.code === 200 && sum.code === 200;
      if (isSuccess) {
        const dataKey = fetch.dataKey ?? config.dataKey;
        const items = get(res.data, dataKey) ?? [];
        const total = get(res.data, dataKey.replace(/[^.]+$/, config.totalKey)) || items.length || 0;
        this.createTableData(isScrollLoad ? this.tableFullData.concat(items) : items);
        this.setRecordsTotal(total);
        this.createSummation(sum?.data || res.data);
        this.prevParams = fetchParams;
        fetch.callback?.(res.data, sum?.data);
      }
    } catch (err) {
      // ...
    } finally {
      this.dataLoadedHandle();
    }
    if (hasOwn(fetch, 'stopToFirst')) {
      this.fetch.stopToFirst = false;
    }
    this.showLoading = false;
  },
  // 滚动加载表格数据
  scrollLoadTableData(): void {
    if (!this.isScrollPagination || this.showLoading) return;
    const { currentPage, pageSize } = this.pagination;
    const pageCount: number = Math.ceil(this.total / pageSize);
    if (currentPage >= pageCount) return;
    this.pagerChangeHandle({ ...this.pagination, currentPage: currentPage + 1 });
  },
  // 加载表格数据
  loadTableData(): void {
    const { height, maxHeight, ellipsis } = this;
    // 是否开启虚拟滚动
    this.scrollYLoad = this.createScrollYLoad();
    if (this.scrollYLoad) {
      if (!(height || maxHeight)) {
        warn('Table', '必须设置组件参数 `height` 或 `maxHeight`');
      }
      if (!ellipsis) {
        warn('Table', '必须设置组件参数 `ellipsis`');
      }
    }
    this.updateScrollYData();
    // 重绘
    this.$nextTick(() => this.doLayout());
  },
  // 设置是否开启虚拟滚动
  createScrollYLoad(): boolean {
    return this.createTableList().length > config.virtualScrollY;
  },
  // 设置数据总数
  setRecordsTotal(total: number): void {
    this.total = total;
  },
  // 获取表格数据
  createTableList(): IRecord[] {
    return !this.isWebPagination ? this.tableFullData : this.createPageData();
  },
  // 创建内存分页的列表数据
  createPageData(): IRecord[] {
    const { currentPage, pageSize } = this.pagination;
    return this.tableFullData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  },
  // 处理渲染数据
  handleTableData(): void {
    const { scrollYLoad, scrollYStore } = this;
    const dataList = this.createTableList();
    // 处理显示数据
    this.tableData = scrollYLoad ? dataList.slice(scrollYStore.startIndex, scrollYStore.endIndex) : dataList;
  },
  // 更新 Y 方向数据
  updateScrollYData(): void {
    this.handleTableData();
    this.updateScrollYSpace();
  },
  // 纵向 Y 可视渲染处理 - 用于虚拟滚动
  loadScrollYData(scrollTop = 0): void {
    const { scrollYStore } = this;
    const { startIndex, endIndex, offsetSize, visibleSize, rowHeight } = scrollYStore;
    const toVisibleIndex = Math.floor(scrollTop / rowHeight);
    const offsetStartIndex = Math.max(0, toVisibleIndex - 1 - offsetSize);
    const offsetEndIndex = toVisibleIndex + visibleSize + offsetSize;
    if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
      if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
        scrollYStore.startIndex = offsetStartIndex;
        scrollYStore.endIndex = offsetEndIndex;
        this.updateScrollYData();
      }
    }
  },
  // 更新纵向 Y 可视渲染上下剩余空间大小
  updateScrollYSpace(): void {
    const { scrollYLoad, scrollYStore, elementStore } = this;
    const { startIndex, rowHeight } = scrollYStore;
    const dataList = this.createTableList();
    let marginTop = '';
    let ySpaceHeight = '';
    if (scrollYLoad) {
      marginTop = Math.max(0, startIndex * rowHeight) + 'px';
      ySpaceHeight = dataList.length * rowHeight + 'px';
    }
    elementStore[`$tableBody`].style.transform = marginTop ? `translateY(${marginTop})` : marginTop;
    elementStore[`$tableYspace`].style.height = ySpaceHeight;
  },
  // 纵向 Y 可视渲染事件处理
  triggerScrollYEvent(st: number): void {
    this.loadScrollYData(st);
  },
  // 表格单元格合并
  getSpan(row: IRecord, column: IColumn, rowIndex: number, columnIndex: number, tableData: IRecord[]): ICellSpan {
    let rowspan = 1;
    let colspan = 1;
    const fn = this.spanMethod;
    if (isFunction(fn)) {
      const result = fn({ row, column, rowIndex, columnIndex, tableData });
      if (Array.isArray(result)) {
        rowspan = result[0];
        colspan = result[1];
      } else if (isObject(result)) {
        rowspan = result.rowspan;
        colspan = result.colspan;
      }
    }
    return { rowspan, colspan };
  },
  // 格式化 表头筛选 和 高级检索 参数
  formatFiltersParams(filters, superFilters): ISuperFilter[] {
    const result: ISuperFilter[] = [];
    // 表头筛选
    if (Object.keys(filters).length) {
      for (const key in filters) {
        const type = config.showFilterType ? key.split('|')[0] : '';
        const fieldName = config.showFilterType ? key.split('|')[1] : key;
        const target = filters[key];
        Object.keys(target).forEach((k) => {
          result.push({
            type,
            bracketLeft: '',
            fieldName,
            expression: k,
            value: target[k],
            bracketRright: '',
            logic: 'and',
          });
        });
      }
    }
    // 高级检索
    if (superFilters.length) {
      superFilters.forEach((x) => {
        result.push({
          type: config.showFilterType ? x.fieldType : '', // 筛选器类型
          bracketLeft: x.bracket_left, // 左括号
          fieldName: x.fieldName, // 字段名
          expression: x.expression, // 运算符号
          value: x.condition, // 值
          bracketRright: x.bracket_right, // 右括号
          logic: x.logic, // 逻辑符号
        });
      });
    }
    // 移除最后的 逻辑符号
    if (result.length) {
      result[result.length - 1].logic = '';
    }
    return deepToRaw(result);
  },
  // 创建派生的 rowKeys for treeTable
  createDeriveRowKeys(tableData: IRecord[], key: string): IDerivedRowKey[] {
    return tableData.map((row) => {
      const rowKey = this.getRowKey(row, row.index);
      const item: IDerivedRowKey = { rowKey };
      if (row.children) {
        item.children = this.createDeriveRowKeys(row.children, rowKey);
      }
      return key ? Object.assign({}, item, { parentRowKey: key }) : item;
    });
  },
  // 获取所有后代节点 rowKeys
  getAllChildRowKeys(deriveRowKeys): string[] {
    const results: string[] = [];
    for (let i = 0; i < deriveRowKeys.length; i++) {
      if (Array.isArray(deriveRowKeys[i].children)) {
        results.push(...this.getAllChildRowKeys(deriveRowKeys[i].children));
      }
      results.push(deriveRowKeys[i].rowKey);
    }
    return results;
  },
  // 获取祖先节点 rowKeys
  findParentRowKeys(deriveRowKeys, key): string[] {
    const results: string[] = [];
    deriveRowKeys.forEach((x) => {
      if (x.children) {
        results.push(...this.findParentRowKeys(x.children, key));
      }
      if (x.rowKey === key && x.parentRowKey) {
        results.push(x.parentRowKey);
      }
    });
    if (results.length) {
      results.push(...this.findParentRowKeys(deriveRowKeys, results[results.length - 1]));
    }
    return results;
  },
  // 数据加载事件
  dataLoadedHandle(): void {
    this.$emit('dataLoaded', [...this.tableFullData]);
  },
  // 数据变化事件
  dataChangeHandle(): void {
    this.$emit('dataChange', [...this.tableFullData]);
  },
  // 分页事件
  pagerChangeHandle({ currentPage, pageSize }): void {
    this.pagination.currentPage = currentPage;
    this.pagination.pageSize = pageSize;
    if (!this.isWebPagination) return;
    this.loadTableData();
    this.tableBodyRef.resetTableBodyScroll();
  },
  // 创建分页索引
  createPageIndex(index: number): number {
    return !this.isFetch || this.isScrollPagination ? index : (this.pagination.currentPage - 1) * this.pagination.pageSize + index;
  },
  // 设置高级检索的条件
  createSuperSearch(val): void {
    this.superFilters = val;
  },
  // 设置列汇总条件
  createColumnSummary(): string {
    return this.flattenColumns
      .filter((x) => x.summation?.dataKey)
      .map((x) => `sum|${x.dataIndex}`)
      .join(',');
  },
  // 是否仅有分页参数产生变化
  onlyPaginationChange(next: IFetchParams, prev: IFetchParams): boolean {
    const diff = Object.keys(difference(next, prev));
    return diff.length === 1 && (diff.includes('currentPage') || diff.includes('pageSize'));
  },
  // 默认选中首行数据
  selectFirstRow(bool?: boolean): void {
    const { rowSelection, tableFullData } = this;
    const { type, defaultSelectFirstRow } = rowSelection || {};
    const isSelectFirstRow: boolean = defaultSelectFirstRow || bool || false;
    if (type !== 'radio' || !isSelectFirstRow || !tableFullData.length) return;
    const rowKey = this.getRowKey(tableFullData[0], tableFullData[0].index);
    this.tableBodyRef.setClickedValues([rowKey, config.selectionColumn]);
    this.selectionKeys = [rowKey];
  },
  // 获取组件实例
  getTableInstance(): ComponentInternalInstance {
    const { _: instance } = this;
    return instance;
  },
  // 获取分页设置
  getPaginationConfig(): Partial<IPagination> {
    const { global } = this.$DESIGN;
    return Object.assign({}, global['table']?.pagination, this.paginationConfig);
  },
  // 初始化分页
  initialPagination(): Pick<IPagination, 'currentPage' | 'pageSize'> {
    return Object.assign(
      {},
      { currentPage: config.pagination.currentPage, pageSize: config.pagination.pageSize },
      filterAttrs(this.getPaginationConfig(), ['currentPage', 'pageSize'])
    );
  },
  // 返回到第一页
  toFirstPage(): void {
    this.pagerChangeHandle({ ...this.pagination, currentPage: 1 });
  },
  // 前往最后一页
  toLastPage(): void {
    const { currentPage, pageSize } = this.pagination;
    const pageCount: number = Math.ceil(this.total / pageSize);
    if (currentPage < pageCount) {
      this.pagerChangeHandle({ currentPage: pageCount, pageSize });
    }
  },
  scrollBottom(ev: Event): void {
    this.scrollLoadTableData();
    this.$emit('scrollEnd', ev);
  },
  // 创建 debouncer
  createDebouncer(): void {
    this.getTableDataDebouncer = debounce(this.getTableData);
    this.resizeListenerDebouncer = debounce(this.resizeListener, 20);
    this.scrollBottomDebouncer = debounce(this.scrollBottom);
  },
  // 清空列选中
  clearRowSelection(): void {
    if (!this.selectionKeys.length) return;
    this.selectionKeys = [];
  },
  // 清空行高亮
  clearRowHighlight(): void {
    this.highlightKey = '';
  },
  // 清空表头排序
  clearTableSorter(): void {
    this.$refs[`tableHeader`]?.clearTheadSorter();
  },
  // 清空表头筛选
  clearTableFilter(): void {
    this.$refs[`tableHeader`]?.clearTheadFilter();
  },
  // 清空高级检索的条件
  clearSuperSearch(): void {
    this.createSuperSearch([]);
  },
  // 清空表格各种操作记录
  clearTableLog(): void {
    this.store.clearAllLog();
  },
  // 移除选择列数据
  removeSelectionKey(rowKey: string): void {
    this.selectionKeys = this.selectionKeys.filter((x) => x !== rowKey);
  },
  // 移除展开行数据
  removeExpandableKey(rowKey: string): void {
    this.rowExpandedKeys = this.rowExpandedKeys.filter((x) => x !== rowKey);
  },
  // 析构方法
  destroy(): void {
    this.removeEvents();
    this.clearElements();
    this.store.destroy();
  },
};
