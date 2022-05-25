/*
 * @Author: 焦质晔
 * @Date: 2020-02-28 23:01:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 13:19:22
 */
import { defineComponent, CSSProperties } from 'vue';
import addEventListener from 'add-dom-event-listener';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { parseHeight, throttle, getCellValue, getVNodeText, deepFindRowKey, isArrayContain, deepGetRowkey } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop, isVNode, isFunction, isObject } from '../../../_utils/util';
import { getParentNode } from '../../../_utils/dom';
import { useLocale } from '../../../hooks';
import { warn } from '../../../_utils/error';
import type { JSXNode, AnyObject, Nullable } from '../../../_utils/types';
import type { IColumn, ICellSpan, IDict, IRecord } from '../table/types';

import config from '../config';
import formatMixin from './format';
import keyboardMixin from './keyboard';
import TableManager from '../manager';
import ClickOutside from '../../../directives/click-outside';

import { CopyIcon } from '../../../icons';
import Draggable from 'vuedraggable';
import Expandable from '../expandable';
import Selection from '../selection';
import CellEdit from '../edit';
import CopyToClipboard from '../../../copy-to-clipboard';

const trueNoop = (): boolean => !0;
const EMPTY_MIN_HEIGHT = 150;

export default defineComponent({
  name: 'TableBody',
  props: ['flattenColumns', 'tableData'],
  inject: ['$$table'],
  provide() {
    return {
      $$body: this,
    };
  },
  directives: { ClickOutside },
  mixins: [keyboardMixin, formatMixin],
  emits: ['rowClick', 'rowDblclick', 'rowEnter', 'scrollEnd'],
  data() {
    Object.assign(this, { prevST: 0, prevSL: 0 });
    return {
      clicked: [], // 被点击单元格的坐标
      checked: [], // 可选择列选中的 rowKey
    };
  },
  computed: {
    bodyWidth(): number {
      const { layout, scrollY } = this.$$table;
      const { tableBodyWidth, gutterWidth } = layout;
      return tableBodyWidth && scrollY ? tableBodyWidth - gutterWidth : tableBodyWidth;
    },
    wrapStyle(): CSSProperties {
      const { layout, height, minHeight, maxHeight, isTableEmpty } = this.$$table;
      const { headerHeight, viewportHeight, footerHeight, tableAutoHeight, tableFullHeight } = layout;
      const result: CSSProperties = {};
      if (isTableEmpty) {
        Object.assign(result, { minHeight: `${EMPTY_MIN_HEIGHT}px` });
      }
      if (minHeight) {
        Object.assign(result, { minHeight: `${(parseHeight(minHeight) as number) - headerHeight - footerHeight}px` });
      }
      if (maxHeight) {
        Object.assign(result, { maxHeight: `${(parseHeight(maxHeight) as number) - headerHeight - footerHeight}px` });
      }
      if (height || tableFullHeight || tableAutoHeight) {
        return { ...result, height: `${viewportHeight}px` };
      }
      return result;
    },
  },
  watch: {
    clicked(next: string[]): void {
      if (!next.length) return;
      TableManager.focus(this.$$table.getTableInstance().uid);
    },
  },
  mounted() {
    this.setElementStore();
    this.$$table[`tableBodyRef`] = this;
    this.event1 = addEventListener(this.$el, 'scroll', this.scrollEvent);
    this.event2 = addEventListener(document, 'keydown', throttle(this.keyboardEvent, 100));
  },
  beforeUnmount() {
    this.$$table[`tableBodyRef`] = null;
    this.event1.remove();
    this.event2.remove();
  },
  methods: {
    setElementStore(): void {
      const { elementStore } = this.$$table;
      elementStore[`$tableBody`] = this.$refs[`table-body`];
      elementStore[`$tableYspace`] = this.$refs[`y-space`];
    },
    scrollEvent(ev: Event): void {
      const {
        showHeader,
        showFooter,
        scrollYLoad,
        scrollY,
        layout,
        elementStore,
        isPingLeft,
        isPingRight,
        triggerScrollYEvent,
        scrollBottomDebouncer,
      } = this.$$table;
      const scrollBarWidth: number = scrollY ? layout.gutterWidth : 0;
      const { scrollTop: st, scrollLeft: sl } = ev.target as HTMLElement;
      if (sl !== this.prevSL) {
        if (showHeader) {
          elementStore[`$header`].scrollLeft = sl;
        }
        if (showFooter) {
          elementStore[`$footer`].scrollLeft = sl;
        }
        const _isPingLeft = sl > 0;
        const _isPingRight = Math.ceil(sl) + layout.tableWidth < layout.tableBodyWidth + scrollBarWidth;
        if (isPingLeft !== _isPingLeft) {
          this.$$table.isPingLeft = _isPingLeft;
        }
        if (isPingRight !== _isPingRight) {
          this.$$table.isPingRight = _isPingRight;
        }
      }
      if (scrollYLoad && st !== this.prevST) {
        triggerScrollYEvent(st);
      }
      if (scrollY && st !== this.prevST) {
        const outerHeight = elementStore[`$tableYspace`].offsetHeight || elementStore[`$tableBody`].offsetHeight;
        if (Math.ceil(st) + layout.viewportHeight - scrollBarWidth >= outerHeight) {
          scrollBottomDebouncer(ev);
        }
      }
      this.prevST = st;
      this.prevSL = sl;
    },
    cancelClickEvent($down: HTMLElement, $up: HTMLElement): void {
      if (!!getParentNode($up, 'table-editable__popper')) return;
      this.setClickedValues([]);
    },
    renderBodyXSpace(): JSXNode {
      return <div ref="x-space" class="body--x-space" style={{ width: this.bodyWidth ? `${this.bodyWidth}px` : '' }} />;
    },
    renderBodyYSpace(): JSXNode {
      return <div ref="y-space" class="body--y-space" />;
    },
    renderColgroup(): JSXNode {
      return (
        <colgroup>
          {this.flattenColumns.map((column: IColumn): JSXNode => {
            const { dataIndex, width, renderWidth } = column;
            return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
          })}
        </colgroup>
      );
    },
    renderRows(list: IRecord[], depth: number = 0): JSXNode[] {
      const { getRowKey, rowSelection, expandable, treeConfig, rowExpandedKeys } = this.$$table;
      const rows: JSXNode[] = [];
      list.forEach((row, rowIndex) => {
        // 行记录 rowKey
        const rowKey = getRowKey(row, row.index);
        // 普通行
        rows.push(this.renderRow(row, rowIndex, rowKey, depth));
        // 展开行
        if (expandable?.expandedRowRender) {
          const { expandedRowClassName, rowExpandable = trueNoop } = expandable;
          const expandColumnCls = [`body--column`];
          // 展开状态
          if (rowExpandable(row) && rowExpandedKeys.includes(rowKey)) {
            rows.push(
              <tr key={`expand_${rowKey}`} class="body--row-expanded">
                <td colspan={this.flattenColumns.length} class={expandColumnCls} style={{ paddingLeft: !rowSelection ? `50px` : `100px` }}>
                  <div class={classNames('cell', expandedRowClassName)}>{expandable.expandedRowRender(row, rowIndex)}</div>
                </td>
              </tr>
            );
          }
        }
        // 树表格
        if (!treeConfig?.virtual && this.isTreeNode(row)) {
          // 展开状态
          if (rowExpandedKeys.includes(rowKey)) {
            rows.push(...this.renderRows(row.children, depth + 1));
          }
        }
      });
      return rows;
    },
    renderRow(row: IRecord, rowIndex: number, rowKey: string, depth: number = 0): JSXNode {
      const { stripe, selectionKeys, highlightKey, isGroupSubtotal } = this.$$table;
      const cls = [
        `body--row`,
        {
          [`body--row-striped`]: stripe && rowIndex % 2 !== 0,
          [`body--row-selected`]: selectionKeys.includes(rowKey),
          [`body--row-current`]: highlightKey === rowKey,
          ...(isGroupSubtotal ? this.createGroupRowCls(row._group) : null),
        },
      ];
      return (
        <tr key={rowKey} data-row-key={rowKey} class={cls}>
          {this.flattenColumns.map((column, columnIndex) => this.renderColumn(column, columnIndex, row, rowIndex, rowKey, depth))}
        </tr>
      );
    },
    renderColumn(column: IColumn, columnIndex: number, row: IRecord, rowIndex: number, rowKey: string, depth: number): Nullable<JSXNode> {
      const { leftFixedColumns, rightFixedColumns, getStickyLeft, getStickyRight, ellipsis, sorter, rowStyle, cellStyle, isGroupSubtotal, isIE } =
        this.$$table;
      const { dataIndex, fixed, align, className = '' } = column;
      const { rowspan, colspan } = this.getSpan(row, column, rowIndex, columnIndex);
      const isEllipsis = column.ellipsis ?? ellipsis;
      if (!rowspan || !colspan) {
        return null;
      }
      const cls = [
        `body--column`,
        {
          [`col--ellipsis`]: isEllipsis,
          [`col--center`]: align === 'center',
          [`col--right`]: align === 'right',
          [`column--sort`]: Object.keys(sorter).includes(dataIndex),
          [`cell-fix-left`]: !isIE && fixed === 'left',
          [`cell-fix-right`]: !isIE && fixed === 'right',
          [`cell-fix-left-last`]: !isIE && fixed === 'left' && leftFixedColumns[leftFixedColumns.length - 1].dataIndex === dataIndex,
          [`cell-fix-right-first`]: !isIE && fixed === 'right' && rightFixedColumns[0].dataIndex === dataIndex,
          [className]: !!className,
        },
      ];
      const stys = !isIE
        ? {
            left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
            right: fixed === 'right' ? `${getStickyRight(dataIndex)}px` : '',
          }
        : null;
      const trExtraStys = rowStyle ? (isFunction(rowStyle) ? rowStyle(row, rowIndex) : rowStyle) : null;
      const tdExtraStys = cellStyle ? (isFunction(cellStyle) ? cellStyle(row, column, rowIndex, columnIndex) : cellStyle) : null;
      const groupStys = isGroupSubtotal ? this.getGroupStyles(row._group) : null;
      const cellText: string = this.renderCellTitle(column, row, rowIndex, columnIndex);
      return (
        <td
          key={dataIndex}
          title={isEllipsis ? cellText : undefined}
          rowspan={rowspan}
          colspan={colspan}
          class={cls}
          style={{ ...stys, ...groupStys, ...trExtraStys, ...tdExtraStys }}
          onClick={(ev) => this.cellClickHandle(ev, row, column)}
          onDblclick={(ev) => this.cellDbclickHandle(ev, row, column)}
          onContextmenu={(ev) => this.cellContextmenuHandle(ev, row, column)}
        >
          <div class="cell">{this.renderCell(column, row, rowIndex, columnIndex, cellText, rowKey, depth)}</div>
        </td>
      );
    },
    renderCell(
      column: IColumn,
      row: IRecord,
      rowIndex: number,
      columnIndex: number,
      cellText: string,
      rowKey: string,
      depth: number
    ): Nullable<JSXNode> | JSXNode[] {
      const { expandable, treeConfig, selectionKeys, firstDataIndex, isTreeTable } = this.$$table;
      const { dataIndex, canCopy, editRender, render } = column;
      const { t } = useLocale();
      const text = getCellValue(row, dataIndex);
      if (dataIndex === config.expandableColumn) {
        const { rowExpandable = trueNoop } = expandable;
        // Expandable -> 受控组件
        return rowExpandable(row) ? <Expandable record={row} rowKey={rowKey} /> : null;
      }
      if (dataIndex === config.selectionColumn) {
        // Selection -> 受控组件
        return <Selection selectionKeys={selectionKeys} column={column} record={row} rowKey={rowKey} />;
      }
      if (editRender) {
        // CellEdit -> UI 组件，无状态组件
        return <CellEdit ref={`${rowKey}-${dataIndex}`} column={column} record={row} rowKey={rowKey} columnKey={dataIndex} clicked={this.clicked} />;
      }
      // Content Node
      const vNodeText = render ? render(text, row, column, rowIndex, columnIndex) : this.renderText(text, column, row);
      // Tree Expandable + vNodeText
      if (isTreeTable && dataIndex === firstDataIndex) {
        return [
          this.renderIndent(!treeConfig?.virtual ? depth : row._level),
          <Expandable record={row} rowKey={rowKey} style={this.isTreeNode(row) ? null : { visibility: 'hidden' }} />,
          vNodeText,
        ];
      }
      if (canCopy) {
        return (
          <div class={`cell--copy`}>
            <span class={`text`}>{vNodeText}</span>
            {cellText && (
              <CopyToClipboard text={cellText}>
                <span class={`icon`} title={t('qm.table.config.copyText')} onClick={(ev) => ev.stopPropagation()}>
                  <CopyIcon class={`svgicon`} />
                </span>
              </CopyToClipboard>
            )}
          </div>
        );
      }
      return vNodeText;
    },
    renderText(text: string | number, column: IColumn, row: IRecord): string | number {
      const { dictItems, precision, formatType, editRender } = column;
      const dicts: IDict[] = dictItems || editRender?.(row, column)?.items || [];
      const target = dicts.find((x) => x.value == text);
      let result = target?.text ?? text ?? '';
      // 数据是数组的情况
      if (Array.isArray(text)) {
        result = text
          .map((x) => {
            let target = dicts.find((k) => k.value == x);
            return target?.text ?? x;
          })
          .join(',');
      }
      // 处理数值精度
      if ((precision as number) >= 0 && result !== '') {
        result = Number(result).toFixed(precision);
      }
      // 处理换行符
      if (typeof result === 'string') {
        result = result.replace(/[\r\n]/g, '');
      }
      // 处理数据格式化
      if (formatType) {
        const render = this[`${formatType}Format`];
        if (!render) {
          warn('Table', '字段的格式化类型 `formatType` 配置不正确');
        } else {
          result = render(result);
        }
      }
      return result;
    },
    renderIndent(level: number): Nullable<JSXNode> {
      return level ? <span class={`cell--indent indent-level-${level}`} style={{ paddingLeft: `${level * config.treeTable.textIndent}px` }} /> : null;
    },
    getSpan(row: IRecord, column: IColumn, rowIndex: number, columnIndex: number): ICellSpan {
      let rowspan = 1;
      let colspan = 1;
      const fn = this.$$table.spanMethod;
      if (isFunction(fn)) {
        const result = fn({ row, column, rowIndex, columnIndex, tableData: this.tableData });
        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (isObject(result)) {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
        // 内存分页 或 虚拟滚动 支持动态合并行
        if (row === this.tableData[0] && rowspan === 0) {
          rowspan = 1;
          for (let i = 1; i < this.tableData.length; i++) {
            const { rowspan: rowSpan } = this.getSpan(this.tableData[i], column, this.tableData[i].index, columnIndex);
            if (rowSpan > 0) break;
            rowspan++;
          }
        }
      }
      return { rowspan, colspan };
    },
    createGroupRowCls(dataIndex: string): AnyObject<boolean> {
      const level: number = this.$$table.summation.groupItems.findIndex((x) => x.dataIndex === dataIndex);
      return {
        [`body--row-group_${level + 1}`]: level >= 0 ? true : false,
      };
    },
    getGroupStyles(dataIndex: string): CSSProperties {
      const { backgroundColor, color } = this.$$table.summation.groupItems.find((x) => x.dataIndex === dataIndex) ?? {};
      return { backgroundColor, color };
    },
    renderCellTitle(column: IColumn, row: IRecord, rowIndex: number, columnIndex: number): string {
      const { dataIndex, render } = column;
      if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) {
        return '';
      }
      let title: string = '';
      const text = getCellValue(row, dataIndex);
      if (typeof render === 'function') {
        const result = render(text, row, column, rowIndex, columnIndex);
        if (isVNode(result)) {
          title = getVNodeText(result).join('');
        } else {
          title = result as string;
        }
      } else {
        title = this.renderText(text, column, row);
      }
      return title;
    },
    createSelectionKeys(rowKey: string): void {
      const { rowSelection = {}, selectionKeys, isTreeTable } = this.$$table;
      const { type, checkStrictly = !0 } = rowSelection;
      if (type === 'radio') {
        this.setSelectionKeys([rowKey]);
      }
      if (type === 'checkbox') {
        if (isTreeTable && !checkStrictly) {
          this.setTreeSelectionKeys(rowKey, selectionKeys);
        } else {
          this.setSelectionKeys(!selectionKeys.includes(rowKey) ? [...selectionKeys, rowKey] : selectionKeys.filter((x) => x !== rowKey));
        }
      }
    },
    cellClickHandle(ev: MouseEvent, row: IRecord, column: IColumn): void {
      const { getRowKey, rowSelection = {}, selectionKeys, rowHighlight, isTreeTable } = this.$$table;
      const { dataIndex } = column;
      if ([config.expandableColumn, config.operationColumn].includes(dataIndex)) return;
      const rowKey = getRowKey(row, row.index);
      // 设置 clicked 坐标
      this.setClickedValues([rowKey, dataIndex]);
      // 判断单元格是否可编辑
      const options = column.editRender?.(row, column);
      const isEditable = options && !options.disabled;
      // 正处于编辑状态的单元格
      // const isEditing = this.$refs[`${rowKey}-${dataIndex}`]?.isEditing;
      // 行选中
      const { type, selectByClickRow = !0, disabled = noop } = rowSelection;
      if (type && !disabled(row) && !isEditable) {
        if (selectByClickRow || dataIndex === config.selectionColumn) {
          this.createSelectionKeys(rowKey);
        }
      }
      // 单击 展开列、可选择列、操作列 不触发行单击事件
      if ([config.selectionColumn].includes(dataIndex)) return;
      // 行高亮
      if (rowHighlight && !rowHighlight.disabled?.(row) && !isEditable) {
        this.$$table.highlightKey = rowKey;
      }
      // 行单击
      this.$$table.$emit('rowClick', row, column, ev);
    },
    cellDbclickHandle(ev: MouseEvent, row: IRecord, column: IColumn): void {
      const { dataIndex } = column;
      if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
      this.$$table.$emit('rowDblclick', row, column, ev);
    },
    cellContextmenuHandle(ev: MouseEvent, row: IRecord, column: IColumn): void {
      const { dataIndex } = column;
      if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
      this.$$table.$emit('rowContextmenu', row, column, ev);
    },
    setClickedValues(arr: string[]): void {
      if (isEqual(arr, this.clicked)) return;
      this.clicked = arr;
    },
    setSelectionKeys(arr: string[]): void {
      this.$$table.selectionKeys = arr;
    },
    setTreeSelectionKeys(key: string, arr: string[]): void {
      // on(选中)  off(取消)
      const state = !arr.includes(key) ? 'on' : 'off';
      const selectedKeys = this.createTreeSelectionKeys(key, arr, state);
      this.setSelectionKeys(selectedKeys);
    },
    createTreeSelectionKeys(key: string, arr: string[], state: string): string[] {
      const { deriveRowKeys, getAllChildRowKeys, findParentRowKeys } = this.$$table;
      const target = deepFindRowKey(deriveRowKeys, key);
      let result: string[] = [];
      // 后代节点 rowKeys
      const childRowKeys = getAllChildRowKeys(target?.children || []);
      // 祖先节点 rowKeys
      // const parentRowKeys = findParentRowKeys(deriveRowKeys, key);
      const parentRowKeys = deepGetRowkey(deriveRowKeys, key)?.slice(0, -1).reverse() || [];
      // 处理后代节点
      if (state === 'on') {
        result = [...new Set([...arr, key, ...childRowKeys])];
      } else {
        result = arr.filter((x) => ![key, ...childRowKeys].includes(x));
      }
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
    setHighlightKey(key: string): void {
      this.$$table.highlightKey = key;
    },
    isTreeNode(row: IRecord): boolean {
      return Array.isArray(row.children) && row.children.length > 0;
    },
  },
  render(): JSXNode {
    const { tableFullData, rowDraggable, getRowKey } = this.$$table;
    const { bodyWidth, wrapStyle, tableData } = this;
    const prefixCls = getPrefixCls('table');
    const dragProps = {
      modelValue: tableData,
      itemKey: (row: IRecord) => getRowKey(row, row.index),
      animation: 200,
      tag: 'tbody',
      'onUpdate:modelValue': (list: IRecord[]): void => {
        const records: IRecord[] = [];
        tableFullData.forEach((row: IRecord): void => {
          if (tableData.includes(row)) {
            records.push(list.shift() as IRecord);
          } else {
            records.push(row);
          }
        });
        this.$$table.setTableFullData(records);
      },
    };
    return (
      <div class={`${prefixCls}--body-wrapper`} style={{ ...wrapStyle }}>
        {this.renderBodyYSpace()}
        {this.renderBodyXSpace()}
        <table
          ref="table-body"
          class={`${prefixCls}--body`}
          cellspacing="0"
          cellpadding="0"
          style={{ width: bodyWidth ? `${bodyWidth}px` : '' }}
          v-click-outside={($down, $up) => this.cancelClickEvent($down, $up)}
        >
          {this.renderColgroup()}
          {!rowDraggable ? (
            <tbody>{this.renderRows(tableData)}</tbody>
          ) : (
            <Draggable
              {...dragProps}
              v-slots={{ item: ({ element: row, index }): JSXNode => this.renderRow(row, index, getRowKey(row, row.index)) }}
            />
          )}
        </table>
      </div>
    );
  },
});
