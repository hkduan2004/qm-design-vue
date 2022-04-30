/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 12:36:24
 */
import { defineComponent, CSSProperties } from 'vue';
import { isEqual } from 'lodash-es';
import { isIE, isEmpty, deepToRaw, noop } from '../../../_utils/util';
import { warn } from '../../../_utils/error';
import { useSize } from '../../../hooks';
import { getScrollBarWidth } from '../../../_utils/scrollbar-width';
import { columnsFlatMap, createFlatRowKeys, convertToRows, getAllTableData, createOrderBy, parseHeight } from '../utils';
import { localeMixin } from '../../../mixins';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IDerivedRowKey, ITableSize, IFetchParams, IRecord, IRowKey } from './types';

import baseProps from './props';
import config from '../config';
import Store from '../store';
import TableManager from '../manager';
import columnsMixin from '../columns';
import expandableMixin from '../expandable/mixin';
import selectionMixin from '../selection/mixin';
import groupSubtotalMixin from '../group-subtotal';
import validateMixin from '../edit/validate';
import layoutMethods from './layout-methods';
import coreMethods from './core-methods';
import interfaceMethods from './interface-methods';
import renderMethods from './render-table';

const EMITS: string[] = ['change', 'dataChange', 'dataLoaded', 'rowClick', 'rowDblclick', 'rowEnter', 'scrollEnd'];

export default defineComponent({
  name: 'QmTable',
  componentName: 'QmTable',
  inheritAttrs: false,
  props: {
    ...baseProps,
  },
  provide() {
    return {
      $$table: this,
    };
  },
  mixins: [localeMixin, columnsMixin, expandableMixin, selectionMixin, groupSubtotalMixin, validateMixin] as any,
  emits: EMITS,
  data() {
    Object.assign(this, {
      // 原始列
      originColumns: [],
      // 原始数据
      tableOriginData: [],
      // 选中的行记录
      selectionRows: [],
      // 高级检索的条件
      superFilters: [],
      // dom 节点集合
      elementStore: {},
      // 存放纵向 Y 虚拟滚动相关信息
      scrollYStore: {
        startIndex: 0,
        endIndex: 0,
        offsetSize: 0,
        visibleSize: 0,
        rowHeight: 0,
      },
      // 响应式变化的状态
      resizeState: {
        width: 0,
        height: 0,
      },
      // 树表格缓存数据
      treeExpandList: [],
      treeExpandMap: new Map(),
      // 缓存数据
      allRowKeysMap: new Map(),
      // 是否是 IE11
      isIE: isIE(),
    });
    return {
      // 组件 store 仓库
      store: new Store(),
      // 渲染中的数据
      tableData: [],
      // 完整数据 - 重要
      tableFullData: [],
      // 表头筛选
      filters: {},
      // 表头排序
      sorter: {},
      // 服务端合计
      summaries: {},
      // 分页
      pagination: this.initialPagination(),
      // 记录总数
      total: 0,
      // 页面是否加载中
      showLoading: false,
      // 是否存在横向滚动条
      scrollX: false,
      // 是否存在纵向滚动条
      scrollY: false,
      // 是否启用了纵向 Y 可视渲染方式加载
      scrollYLoad: false,
      // 权限
      permission: {
        export: true,
        print: true,
      },
      // 表格布局相关参数
      layout: {
        // 滚动条宽度
        gutterWidth: getScrollBarWidth(),
        // 表格宽度
        tableWidth: 0,
        // 表格体宽度
        tableBodyWidth: 0,
        // 表格体内容高度
        tableBodyHeight: 0,
        // 表格体父容器（视口）高度
        viewportHeight: 0,
        // 头部高度
        headerHeight: 0,
        // 底部高度
        footerHeight: 0,
        // 自动计算的表格高度
        tableAutoHeight: 0,
        // 全屏的表格高度
        tableFullHeight: 0,
      },
      // 选择列，已选中行的 keys
      selectionKeys: this.rowSelection?.selectedRowKeys ?? [],
      // 行高亮，已选中的 key
      highlightKey: this.rowHighlight?.currentRowKey ?? '',
      // 已展开行的 keys
      rowExpandedKeys: this.expandable?.expandedRowKeys ?? [],
      // X 滚动条是否离开左边界
      isPingLeft: false,
      // X 滚动条是否离开右边界
      isPingRight: false,
      // 全屏样式
      isFullScreen: false,
    };
  },
  computed: {
    tableColumns(): IColumn[] {
      return this.createTableColumns(this.columns);
    },
    flattenColumns(): IColumn[] {
      return columnsFlatMap(this.tableColumns);
    },
    allTableData(): IRecord[] {
      return !this.isTreeTable ? this.tableFullData : getAllTableData(this.tableFullData);
    },
    currentDataSource(): IRecord[] {
      return this.createTableList();
    },
    allRowKeys(): IRowKey[] {
      return this.allTableData.map((row) => this.getRowKey(row, row.index));
    },
    deriveRowKeys(): IDerivedRowKey[] {
      return this.createDeriveRowKeys(this.tableFullData, '', '');
    },
    flattenRowKeys(): IRowKey[] {
      return createFlatRowKeys(this.deriveRowKeys);
    },
    firstDataIndex(): string {
      const _columns = this.flattenColumns.filter(
        (x) => ![config.expandableColumn, config.selectionColumn, config.operationColumn].includes(x.dataIndex)
      );
      return _columns.length ? _columns[0].dataIndex : '';
    },
    leftFixedColumns(): IColumn[] {
      return this.flattenColumns.filter((column) => column.fixed === 'left');
    },
    rightFixedColumns(): IColumn[] {
      return this.flattenColumns.filter((column) => column.fixed === 'right');
    },
    showSummary(): boolean {
      return this.flattenColumns.some((x) => !!x.summation);
    },
    showFooter(): boolean {
      return this.footRender || this.showSummary;
    },
    showPagination(): boolean {
      return (this.isFetch || this.isWebPagination) && !this.isScrollPagination;
    },
    bordered(): boolean {
      return this.border || this.isGroup;
    },
    isGroup(): boolean {
      return convertToRows(this.tableColumns).length > 1;
    },
    isHeadSorter(): boolean {
      return this.flattenColumns.some((column) => column.sorter);
    },
    isHeadFilter(): boolean {
      return this.flattenColumns.some((column) => column.filter);
    },
    isWebPagination(): boolean {
      return !this.isFetch && this.webPagination;
    },
    isScrollPagination(): boolean {
      return this.isFetch && this.scrollPagination;
    },
    isServiceSummation(): boolean {
      return this.flattenColumns.some((x) => !!x.summation?.dataKey);
    },
    isSelectCollection(): boolean {
      return this.showSelectCollection && this.rowSelection?.type === 'checkbox';
    },
    isSuperSearch(): boolean {
      return this.showSuperSearch && this.isHeadFilter;
    },
    isTableImport(): boolean {
      return !this.isFetch && !!this.showTableImport;
    },
    isFastSearch(): boolean {
      return !this.isFetch && this.showFastSearch && this.isHeadFilter;
    },
    isGroupSummary(): boolean {
      return this.flattenColumns.some((column) => !!column.groupSummary);
    },
    isGroupSubtotal(): boolean {
      return !!this.summation?.groupItems?.length;
    },
    isTreeTable(): boolean {
      return this.tableFullData.some((x) => Array.isArray(x.children) && x.children.length);
    },
    isTableEmpty(): boolean {
      return !this.tableData.length;
    },
    isFetch(): boolean {
      return !!this.fetch;
    },
    refParams(): IFetchParams {
      const orderby = createOrderBy(this.sorter);
      const query = this.formatFiltersParams(this.filters, this.superFilters);
      const params = this.isFetch ? this.fetch.params : null;
      const sorter = orderby ? { [config.sorterFieldName]: orderby } : null;
      const filter = query.length ? { [config.filterFieldName]: query } : null;
      return {
        ...sorter,
        ...filter,
        ...params,
        ...this.pagination,
      };
    },
    fetchParams(): IFetchParams {
      return Object.assign(
        {},
        this.refParams,
        this.isServiceSummation && this.refParams.usedJH !== 2
          ? {
              [config.groupSummary.summaryFieldName]: this.createColumnSummary(),
              usedJH: 1, // 普通合计 -> 1
            }
          : null
      );
    },
    tableSize(): ITableSize {
      const { $size } = useSize(this.$props);
      return $size || 'default';
    },
    shouldUpdateHeight(): boolean {
      return !!(this.height || this.minHeight || this.maxHeight);
    },
    tableStyles(): CSSProperties {
      const { height, minHeight, maxHeight, layout, isFullScreen } = this;
      const result: CSSProperties = {};
      if (minHeight) {
        Object.assign(result, { minHeight: `${parseHeight(minHeight)}px` });
      }
      if (maxHeight) {
        Object.assign(result, { maxHeight: `${parseHeight(maxHeight)}px` });
      }
      if (isFullScreen) {
        return { ...result, height: `${layout.tableFullHeight}px` };
      }
      if (height) {
        return { ...result, height: height !== 'auto' ? `${parseHeight(height)}px` : `${layout.tableAutoHeight}px` };
      }
      return result;
    },
  },
  watch: {
    dataSource(next: IRecord[]): void {
      // 不能使用 prev，会导致数据直接 push 不更新的 bug
      if (isEqual(next, this.tableFullData)) return;
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
      this.createTableData(next);
    },
    tableColumns(next: IColumn[], prev: IColumn[]): void {
      if (isEqual(next, prev)) return;
      this.$nextTick(() => this.doLayout());
    },
    filters(): void {
      this.$emit('change', this.pagination, this.filters, this.sorter, { currentDataSource: this.currentDataSource });
    },
    sorter(): void {
      this.$emit('change', this.pagination, this.filters, this.sorter, { currentDataSource: this.currentDataSource });
    },
    pagination: {
      handler(): void {
        this.$emit('change', this.pagination, this.filters, this.sorter, { currentDataSource: this.currentDataSource });
      },
      deep: true,
    },
    [`fetch.params`](): void {
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
    },
    refParams(next: IFetchParams, prev: IFetchParams): void {
      const isOnlyPageChange = this.onlyPaginationChange(next, prev);
      if (!isOnlyPageChange) {
        this.isFetch && this.rowSelection?.clearableAfterFetched && this.clearRowSelection();
      }
      if (!isOnlyPageChange && next.currentPage > 1 && !this.fetch?.stopToFirst) {
        this.toFirstPage();
      } else {
        this.isFetch && this.getTableDataDebouncer();
      }
    },
    selectionKeys(next: string[], prev: string[]): void {
      if (!this.rowSelection || isEqual(next, prev)) return;
      const { onChange = noop } = this.rowSelection;
      // 设置选中的行数据
      this.selectionRows = this.createSelectionRows(next);
      onChange(next, this.selectionRows);
    },
    [`rowSelection.selectedRowKeys`](next: string[]): void {
      if (this.rowSelection.type === 'radio') {
        this.tableBodyRef.setClickedValues(next.length ? [next[0], config.selectionColumn] : []);
      }
      this.selectionKeys = this.createSelectionKeys(next);
      if (this.isTreeTable) {
        this.rowExpandedKeys = this.createRowExpandedKeys();
      }
    },
    [`expandable.expandedRowKeys`](): void {
      this.rowExpandedKeys = this.createRowExpandedKeys();
    },
    rowExpandedKeys(next: string[], prev: string[]): void {
      if (this.isTreeTable && this.treeConfig?.virtual) {
        this.setTreeExpand();
        this.updateScrollYData();
      }
      if (!this.expandable || isEqual(next, prev)) return;
      const { onChange = noop } = this.expandable;
      onChange(
        next,
        next.map((x) => this.allTableData[this.allRowKeys.findIndex((k) => k === x)])
      );
    },
    highlightKey(next: string): void {
      const { onChange = noop } = this.rowHighlight || {};
      if (this.isTreeTable) {
        this.rowExpandedKeys = this.createRowExpandedKeys();
      }
      onChange(next, this.allTableData[this.allRowKeys.findIndex((x) => x === next)] ?? null);
    },
    [`rowHighlight.currentRowKey`](next: string): void {
      this.tableBodyRef.setClickedValues(!isEmpty(next) ? [next, 'index'] : []);
      this.highlightKey = this.rowHighlight?.currentRowKey ?? this.highlightKey;
    },
    scrollYLoad(next: boolean): void {
      this.$nextTick(() => (!next ? this.updateScrollYSpace() : this.loadScrollYData(this.tableBodyRef.prevST)));
    },
    scrollX(next: boolean): void {
      this.isPingRight = next;
    },
  },
  created() {
    TableManager.register(this.getTableInstance().uid, this.getTableInstance());
    this.originColumns = deepToRaw(this.columns);
    this.createDebouncer();
  },
  mounted() {
    this.setElementStore();
    this.bindEvents();
    this.doLayout();
    this.initialTable();
  },
  activated() {
    TableManager.focus(this.getTableInstance().uid);
    this.scrollYLoad && this.loadScrollYData(0);
    this.calcTableHeight();
  },
  beforeUnmount() {
    TableManager.deregister(this.getTableInstance().uid);
    this.destroy();
  },
  methods: {
    ...coreMethods,
    ...layoutMethods,
    ...renderMethods,
    ...interfaceMethods,
    getRowKey(row: IRecord, index: number): IRowKey {
      const { rowKey } = this;
      const key: IRowKey = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (key === undefined) {
        warn('Table', 'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.');
        return index;
      }
      return key;
    },
  },
  render(): JSXNode {
    return this.renderTable();
  },
});
