/*
 * @Author: 焦质晔
 * @Date: 2020-02-28 23:01:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-28 12:53:49
 */
import { defineComponent } from 'vue';
import { pickBy } from 'lodash-es';
import { convertToRows, getCellValue, createWhereSQL } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { isEmpty, isFunction } from '../../../_utils/util';
import { stop } from '../../../_utils/dom';
import { useLocale } from '../../../hooks';
import type { JSXNode, Nullable } from '../../../_utils/types';
import type { IColumn, IDerivedColumn, IFilter, ISorter } from '../table/types';

import { where } from '../filter-sql';
import config from '../config';

import { CaretDownIcon, CaretUpIcon, InfoCircleIcon } from '../../../icons';
import Resizable from './resizable';
import AllSelection from '../selection/all';
import THeadFilter from '../filter';

export default defineComponent({
  name: 'TableHeader',
  props: ['tableColumns', 'flattenColumns'],
  provide() {
    return {
      $$header: this,
    };
  },
  inject: ['$$table'],
  data() {
    return {
      filters: {},
      sorter: {},
      ascend: config.sortDirections[0],
      descend: config.sortDirections[1],
    };
  },
  computed: {
    isClientSorter(): boolean {
      return !this.$$table.isFetch;
    },
    isClientFilter(): boolean {
      return !this.$$table.isFetch;
    },
    showSelectAll(): boolean {
      const { isFetch, rowSelection } = this.$$table;
      return isFetch ? !!rowSelection?.fetchAllRowKeys : !rowSelection?.hideSelectAll;
    },
  },
  watch: {
    filters(val: IFilter): void {
      this.filterHandle();
      // if (this.isClientFilter) return;
      this.$$table.filters = this.formatFilterValue(val);
    },
    sorter(val: ISorter) {
      this.sorterHandle();
      // if (this.isClientSorter) return;
      this.$$table.sorter = this.formatSorterValue(val);
    },
  },
  mounted() {
    this.setElementStore();
  },
  methods: {
    setElementStore(): void {
      const { elementStore } = this.$$table;
      elementStore[`$header`] = this.$refs[`header`];
    },
    renderColgroup(): JSXNode {
      const {
        layout: { gutterWidth },
        scrollY,
      } = this.$$table;
      return (
        <colgroup>
          {this.flattenColumns.map((column) => {
            const { dataIndex, width, renderWidth } = column;
            return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
          })}
          {scrollY && <col style={{ width: `${gutterWidth}px`, minWidth: `${gutterWidth}px` }} />}
        </colgroup>
      );
    },
    renderRows(columnRows: Array<IColumn[]>): JSXNode[] {
      const { scrollY, isIE, rightFixedColumns } = this.$$table;
      const cls = [
        `gutter`,
        {
          [`cell-fix-right`]: !!rightFixedColumns.length,
        },
      ];
      const stys = !isIE
        ? {
            right: rightFixedColumns.length ? 0 : '',
          }
        : null;
      return columnRows.map((columns, rowIndex) => (
        <tr key={rowIndex} class="header--row">
          {columns.map((column, columnIndex) => this.renderColumn(column, columnIndex, columns))}
          {scrollY && <th class={cls} style={{ ...stys }}></th>}
        </tr>
      ));
    },
    renderColumn(column: IColumn, columnIndex: number, columns: IColumn[]): Nullable<JSXNode> {
      const {
        getStickyLeft,
        getStickyRight,
        layout: { gutterWidth },
        resizable,
        scrollY,
        ellipsis,
        sorter,
        isIE,
      } = this.$$table;
      const { dataIndex, colSpan, rowSpan, fixed, align, sorter: isSorter, filter, required, headRender } = column;
      if (colSpan === 0) {
        return null;
      }
      const isEllipsis = column.ellipsis ?? ellipsis;
      const cls = [
        `header--column`,
        {
          [`col--ellipsis`]: isEllipsis,
          [`col--center`]: align === 'center',
          [`col--right`]: align === 'right',
          [`column--required`]: !!required,
          [`column-has-sorter`]: isSorter,
          [`column-has-filter`]: filter,
          [`column--sort`]: Object.keys(sorter).includes(dataIndex),
          [`cell-fix-left`]: !isIE && fixed === 'left',
          [`cell-fix-right`]: !isIE && fixed === 'right',
          [`cell-fix-left-last`]: !isIE && fixed === 'left' && !columns[columnIndex + 1]?.fixed,
          [`cell-fix-right-first`]: !isIE && fixed === 'right' && !columns[columnIndex - 1]?.fixed,
        },
      ];
      const stys = !isIE
        ? {
            left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
            right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
          }
        : null;
      const isResizable = resizable && ![config.expandableColumn, config.selectionColumn].includes(dataIndex);
      const { tableData, tableFullData } = this.$$table;
      return (
        <th key={dataIndex} class={cls} style={{ ...stys }} colspan={colSpan} rowspan={rowSpan} onClick={(ev) => this.thClickHandle(ev, column)}>
          <div class="cell--wrapper">
            {headRender ? (
              <div class="cell--text cell">{headRender(column, tableData, tableFullData)}</div>
            ) : (
              <>
                <div class="cell--text">{this.renderCell(column)}</div>
                {filter ? this.renderFilter(column) : null}
              </>
            )}
          </div>
          {isResizable && <Resizable column={column} />}
        </th>
      );
    },
    renderCell(column: IColumn): Nullable<JSXNode> | JSXNode[] {
      const { dataIndex, type, sorter, title, description } = column as IDerivedColumn;
      const { selectionKeys } = this.$$table;
      const { t } = useLocale();
      if (dataIndex === config.selectionColumn && type === 'checkbox') {
        if (type === 'checkbox') {
          return <div class="cell">{this.showSelectAll ? <AllSelection selectionKeys={selectionKeys} /> : t('qm.table.config.selectionText')}</div>;
        }
        if (type === 'radio') {
          return <div class="cell">{title}</div>;
        }
      }
      const vNodes: JSXNode[] = [];
      vNodes.push(
        <div key={0} class="cell" title={title}>
          {title}
        </div>
      );
      if (description) {
        vNodes.push(
          <el-tooltip key={1} effect="dark" placement="top" content={description}>
            <span class="tip svgicon" onClick={(ev) => stop(ev)}>
              <InfoCircleIcon />
            </span>
          </el-tooltip>
        );
      }
      if (sorter) {
        vNodes.push(this.renderSorter(this.sorter[dataIndex]));
      }
      return vNodes;
    },
    renderSorter(order: string): JSXNode {
      const { t } = useLocale();
      const ascCls = [
        `svgicon cell--sorter__asc`,
        {
          [`actived`]: order === this.ascend,
        },
      ];
      const descCls = [
        `svgicon cell--sorter__desc`,
        {
          [`actived`]: order === this.descend,
        },
      ];
      return (
        <div key={2} class="cell--sorter" title={t('qm.table.sorter.text')}>
          <span class={ascCls}>
            <CaretUpIcon />
          </span>
          <span class={descCls}>
            <CaretDownIcon />
          </span>
        </div>
      );
    },
    renderFilter(column: IColumn): JSXNode {
      return <THeadFilter column={column} filters={this.filters} />;
    },
    thClickHandle(ev: MouseEvent, column: IColumn): void {
      const { multipleSort } = this.$$table;
      const { sorter, dataIndex } = column;
      if (sorter) {
        const current = this.sorter[dataIndex];
        const order = current ? (current === this.descend ? null : this.descend) : this.ascend;
        // 设置排序值
        if (!multipleSort) {
          this.sorter = Object.assign({}, { [dataIndex]: order });
        } else {
          // 后点击的排序列，key 排在最后
          delete this.sorter[dataIndex];
          this.sorter = Object.assign({}, this.sorter, { [dataIndex]: order });
        }
      }
    },
    // 表头排序
    sorterHandle(): void {
      if (!this.isClientSorter) return;
      this.clientSorter();
    },
    // 客户端排序
    clientSorter(type: string): void {
      const validSorter = pickBy(this.sorter, (val) => val !== null);
      for (let key in validSorter) {
        let column = this.flattenColumns.find((column) => column.dataIndex === key);
        this.doSortHandle(column, validSorter[key]);
      }
      if (type === 'filter') return;
      // 还原排序数据
      if (!Object.keys(validSorter).length) {
        this.doSortHandle({ dataIndex: 'index' }, this.ascend);
      }
    },
    // 排序算法
    doSortHandle(column: IColumn, order: string): void {
      const { dataIndex, sorter } = column;
      const { tableFullData, createGroupData, getGroupValidData, isGroupSubtotal } = this.$$table;
      const sortFn = (a, b) => {
        let start = getCellValue(a, dataIndex);
        let end = getCellValue(b, dataIndex);
        if (!Number.isNaN(start - end)) {
          return order === this.ascend ? start - end : end - start;
        }
        return order === this.ascend ? start.toString().localeCompare(end.toString()) : end.toString().localeCompare(start.toString());
      };
      const result = !isGroupSubtotal
        ? tableFullData.sort(isFunction(sorter) ? sorter : sortFn)
        : createGroupData(getGroupValidData(tableFullData).sort(isFunction(sorter) ? sorter : sortFn));
      this.$$table.setTableFullData(result);
    },
    // 表头筛选
    filterHandle(): void {
      if (!this.isClientFilter) return;
      this.clientFilter();
    },
    // 客户端筛选
    clientFilter(): void {
      const { tableOriginData, superFilters, isTreeTable, isGroupSubtotal, createGroupData, getGroupValidData } = this.$$table;
      const sql = !superFilters.length ? createWhereSQL(this.filters) : createWhereSQL(superFilters);
      const result =
        sql !== ''
          ? !isGroupSubtotal
            ? where(tableOriginData, sql, isTreeTable)
            : createGroupData(where(getGroupValidData(tableOriginData), sql, isTreeTable))
          : tableOriginData.slice(0);
      this.$$table.setTableFullData(result);
      this.clientSorter('filter');
    },
    // 格式化排序参数
    formatSorterValue(sorter: ISorter): ISorter {
      const result = {};
      for (let key in sorter) {
        if (sorter[key] === null) continue;
        result[key] = sorter[key];
      }
      return result;
    },
    // 格式化筛选参数
    formatFilterValue(filters: IFilter): IFilter {
      const result = {};
      for (let key in filters) {
        if (!key.includes('|')) continue;
        let [type, property] = key.split('|');
        for (let mark in filters[key]) {
          if (isEmpty(filters[key][mark])) {
            delete filters[key][mark];
          }
        }
        // result[`${type}|${property}`]
        result[config.showFilterType ? `${type}|${property}` : property] = filters[key];
      }
      return result;
    },
    // 清空表头排序
    clearTheadSorter(): void {
      this.sorter = {};
    },
    // 清空表头筛选
    clearTheadFilter(): void {
      this.filters = {};
    },
  },
  render(): JSXNode {
    const { tableColumns } = this;
    const {
      layout: { tableBodyWidth },
    } = this.$$table;
    const prefixCls = getPrefixCls('table');
    const columnRows = convertToRows(tableColumns);
    return (
      <div ref="header" class={`${prefixCls}--header-wrapper`}>
        <table class={`${prefixCls}--header`} cellspacing="0" cellpadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
          {this.renderColgroup()}
          <thead>{this.renderRows(columnRows)}</thead>
        </table>
      </div>
    );
  },
});
