/*
 * @Author: 焦质晔
 * @Date: 2020-03-23 12:51:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:49:45
 */
import { isUndefined } from '../../../_utils/util';
import { prevent } from '../../../_utils/dom';
import { getAllTableData } from '../utils';
import TableManager from '../manager';
import config from '../config';

const keyboardMixin = {
  methods: {
    keyboardEvent(ev: KeyboardEvent): void {
      const { keyCode } = ev;
      if (this.$$table.getTableInstance().uid !== TableManager.getFocusInstance()?.id) return;
      // Esc
      if (keyCode === 27) {
        this.setClickedValues([]);
        this.setHighlightKey('');
      }
      // table-body 被点击，获得焦点
      if (!this.clicked.length) return;
      const { rowSelection, rowHighlight, getRowKey } = this.$$table;
      // Enter
      if (keyCode === 13) {
        prevent(ev);
        if (rowSelection?.type === 'radio' || rowHighlight) {
          const { tableData, selectionKeys, highlightKey } = this.$$table;
          const rowKey = selectionKeys[0] ?? highlightKey ?? null;
          const row = tableData.find((record) => getRowKey(record, record.index) === rowKey) ?? null;
          row && this.$$table.$emit('rowEnter', row, ev);
        }
      }
      // 上  下
      if (keyCode === 38 || keyCode === 40) {
        prevent(ev);
        const { layout, scrollYStore, scrollX, createTableList } = this.$$table;
        const { viewportHeight, gutterWidth } = layout;
        const pageTableData = getAllTableData(createTableList());
        const total = pageTableData.length;
        let index = pageTableData.findIndex((row) => getRowKey(row, row.index) === this.clicked[0]);
        const xIndex = keyCode === 38 ? (--index + total) % total : ++index % total;
        const row = pageTableData[xIndex];
        const rowKey = getRowKey(row, row.index);
        // 行单选
        if (rowSelection?.type === 'radio' && !rowSelection.disabled?.(row)) {
          this.setSelectionKeys([rowKey]);
        }
        // 行高亮
        if (rowHighlight && !rowHighlight.disabled?.(row)) {
          this.setHighlightKey(rowKey);
        }
        // 滚动条定位
        if (!this.rowInViewport(xIndex)) {
          if (keyCode === 38) {
            this.scrollYToRecord(rowKey, xIndex);
          }
          if (keyCode === 40) {
            const v = Math.floor((scrollX ? viewportHeight - gutterWidth : viewportHeight) / scrollYStore.rowHeight) - 1;
            this.scrollYToRecord(rowKey, xIndex - v < 0 ? 0 : xIndex - v);
          }
        }
        this.setClickedValues([rowKey, this.clicked[1]]);
      }
      // Tab
      if (keyCode === 9) {
        prevent(ev);
        // 非可编辑单元格
        if (!this.editableColumns.length) {
          return this.setClickedValues([]);
        }
        const total = this.editableColumns.length;
        let index = this.editableColumns.findIndex((x) => x.dataIndex === this.clicked[1]);
        const yIndex = ++index % total;
        const dataIndex = this.editableColumns[yIndex].dataIndex;
        this.setClickedValues([this.clicked[0], dataIndex]);
        this.scrollXToColumn(dataIndex);
      }
      // 左  右
      // if (keyCode === 37 || keyCode === 39) {
      //   prevent(ev);
      //   const total = this.editableColumns.length;
      //   let index = this.editableColumns.findIndex(x => x.dataIndex === this.clicked[1]);
      //   let yIndex = keyCode === 37 ? (--index + total) % total : ++index % total;
      //   const dataIndex = this.editableColumns[yIndex].dataIndex;
      //   this.setClickedValues([this.clicked[0], dataIndex]);
      //   this.scrollXToColumn(dataIndex);
      // }
    },
    rowInViewport(index: number): boolean {
      const { layout, scrollYStore, scrollX } = this.$$table;
      const { viewportHeight, gutterWidth } = layout;
      const st = index * scrollYStore.rowHeight;
      // 不在 tableBody 视口范围
      if (st < this.$el.scrollTop || st + scrollYStore.rowHeight > this.$el.scrollTop + (scrollX ? viewportHeight - gutterWidth : viewportHeight)) {
        return !1;
      }
      return !0;
    },
    scrollXToColumn(dataIndex: string, index: number): void {
      const { leftFixedColumns, elementStore } = this.$$table;
      const v = isUndefined(index) ? this.flattenColumns.findIndex((x) => x.dataIndex === dataIndex) : index;
      if (v < 0) return;
      const fixedWidth = leftFixedColumns.map((x) => x.width || x.renderWidth || config.defaultColumnWidth).reduce((prev, curr) => prev + curr, 0);
      this.$el.scrollLeft = elementStore[`$tableBody`].querySelectorAll('tbody > tr > td')[v].offsetLeft - fixedWidth;
    },
    scrollYToRecord(rowKey: string, index: number): void {
      const { scrollYStore, allRowKeys } = this.$$table;
      const v = isUndefined(index) ? allRowKeys.findIndex((x) => x === rowKey) : index;
      if (v < 0) return;
      this.$el.scrollTop = v * scrollYStore.rowHeight;
    },
    resetTableBodyScroll(): void {
      this.$el.scrollTop = 0;
      // this.$el.scrollLeft = 0;
    },
    createInputFocus(): void {
      const { tableFullData, getRowKey } = this.$$table;
      if (!this.editableColumns.length || !tableFullData.length) return;
      const firstRecord = tableFullData[0];
      const firstInputColumn = this.editableColumns.find((column) => {
        const options = column.editRender(firstRecord, column);
        return ['text', 'number', 'search-helper'].includes(options.type);
      });
      if (!firstInputColumn) return;
      const rowKey = getRowKey(firstRecord, firstRecord.index);
      const { dataIndex, editRender } = firstInputColumn;
      const { type } = editRender(firstRecord, firstInputColumn);
      const $$cellEdit = this.$refs[`${rowKey}-${dataIndex}`];
      if (!$$cellEdit) return;
      // 正处于编辑状态的单元格
      const { isEditing } = $$cellEdit;
      if (!isEditing) return;
      this.setClickedValues([rowKey, dataIndex]);
      $$cellEdit.$refs[`${type}-${rowKey}|${dataIndex}`]?.select();
    },
  },
};

export default keyboardMixin;
