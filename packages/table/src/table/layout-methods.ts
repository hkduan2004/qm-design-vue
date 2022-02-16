/*
 * @Author: 焦质晔
 * @Date: 2020-02-29 22:17:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 10:28:46
 */
import addEventListener from 'add-dom-event-listener';
import { addResizeListener, removeResizeListener } from '../../../_utils/resize-event';
import { prevent } from '../../../_utils/dom';
import { DEFAULT_DISTANCE } from './types';
import config from '../config';

export default {
  setElementStore(): void {
    const { elementStore } = this;
    elementStore[`$table`] = this.$refs[`table`];
    elementStore[`$toper`] = this.$refs[`toper`];
    elementStore[`$resizableBar`] = this.$refs[`resizable-bar`];
  },
  updateElsHeight(): void {
    const { showHeader, showFooter, layout, elementStore, scrollYLoad, isFullScreen } = this;
    // 祖先元素有 display: none 时
    if (!elementStore[`$table`].offsetParent) return;
    const tableOuterHeight = elementStore[`$table`].offsetHeight;
    const headerHeight = showHeader ? elementStore[`$header`].offsetHeight : layout.headerHeight;
    const footerHeight = showFooter ? elementStore[`$footer`].offsetHeight : layout.footerHeight;
    // body 可视区高度
    const viewportHeight = tableOuterHeight - headerHeight - footerHeight;
    const tableBodyHeight = elementStore[`$tableBody`].offsetHeight;
    // 全屏高度计算
    let tableFullHeight = 0;
    if (isFullScreen) {
      const toperHeight = elementStore[`$toper`] ? elementStore[`$toper`].offsetHeight + DEFAULT_DISTANCE : 0;
      const pagerHeight = elementStore[`$pager`] ? elementStore[`$pager`].offsetHeight + DEFAULT_DISTANCE : 0;
      tableFullHeight = window.innerHeight - toperHeight - pagerHeight - DEFAULT_DISTANCE * 2;
    }
    const _viewportHeight = layout.viewportHeight;
    this.scrollY = scrollYLoad || tableBodyHeight > viewportHeight;
    this.layout = Object.assign({}, layout, {
      headerHeight,
      footerHeight,
      viewportHeight,
      tableBodyHeight,
      tableFullHeight,
    });
    if (viewportHeight !== _viewportHeight) {
      this.updateScrollYStore(viewportHeight);
    }
  },
  updateScrollYStore(viewportHeight: number): void {
    const { startIndex, endIndex } = this.scrollYStore;
    const rowYHeight = config.rowHeightMaps[this.tableSize];
    const visibleYSize = Math.max(8, Math.ceil(viewportHeight / rowYHeight) + 2);
    const offsetYSize = !this.isIE ? 0 : 5;
    Object.assign(this.scrollYStore, {
      visibleSize: visibleYSize,
      offsetSize: offsetYSize,
      endIndex: Math.max(startIndex + visibleYSize + offsetYSize, endIndex),
      rowHeight: rowYHeight,
    });
  },
  resizeListener(): void {
    if (this.shouldUpdateHeight && this.scrollYLoad) {
      this.loadTableData();
    } else {
      this.doLayout();
    }
  },
  resizeHandler(ev): void {
    prevent(ev);
    const { height: oldWinHeight } = this.resizeState;
    const winHeight = ev.target.innerHeight;
    const isYChange = winHeight !== oldWinHeight;
    if (isYChange) {
      this.calcTableHeight();
      Object.assign(this.resizeState, { height: winHeight });
    }
  },
  calcTableHeight(): void {
    if (this.height !== 'auto') return;
    const { elementStore, showPagination } = this;
    const pagerHeight = showPagination ? elementStore[`$pager`].offsetHeight + DEFAULT_DISTANCE : 0;
    this.layout.tableAutoHeight = window.innerHeight - elementStore[`$table`].getBoundingClientRect().top - pagerHeight - DEFAULT_DISTANCE;
    // 重绘
    this.doLayout();
  },
  bindEvents(): void {
    addResizeListener(this.elementStore[`$table`], this.resizeListenerDebouncer);
    if (this.height !== 'auto') return;
    this.resizeEvent = addEventListener(window, 'resize', this.resizeHandler);
    this.$nextTick(() => this.calcTableHeight());
  },
  removeEvents(): void {
    removeResizeListener(this.elementStore[`$table`], this.resizeListenerDebouncer);
    this.resizeEvent?.remove();
  },
  clearElements(): void {
    for (const key in this.elementStore) {
      this.elementStore[key] = null;
    }
  },
  doLayout(): void {
    this.updateElsHeight();
    this.updateColumnsWidth();
    this.$nextTick(() => this.updateElsHeight());
  },
};
