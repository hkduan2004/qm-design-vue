/*
 * @Author: 焦质晔
 * @Date: 2020-03-07 19:04:14
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-27 22:59:05
 */
import { defineComponent } from 'vue';
import { noop } from '../../../_utils/util';
import { prevent } from '../../../_utils/dom';
import { getNodeOffset } from '../utils';
import type { JSXNode } from '../../../_utils/types';

import config from '../config';

export default defineComponent({
  name: 'Resizable',
  props: ['column'],
  inject: ['$$table'],
  methods: {
    resizeMousedown(ev: MouseEvent): boolean {
      prevent(ev);

      const _this = this;
      const $dom = ev.target as HTMLElement;
      const { elementStore, columns, columnsChange = noop } = this.$$table;
      const target = elementStore[`$resizableBar`];

      const half = $dom.offsetWidth / 2;
      const disX = ev.clientX;
      const left = getNodeOffset($dom, elementStore[`$table`]).left - elementStore[`$tableBody`].parentNode.scrollLeft + half;

      elementStore[`$table`].classList.add('c--resize');
      target.style.left = `${left}px`;
      target.style.display = 'block';

      const renderWidth = this.column.width || this.column.renderWidth;
      let res = renderWidth;

      document.onmousemove = function (ev: MouseEvent) {
        if (typeof renderWidth !== 'number') return;

        let ml = ev.clientX - disX;
        let rw = renderWidth + ml;

        // 左边界限定
        if (rw < config.defaultColumnWidth) return;
        res = Math.floor(rw);

        target.style.left = `${ml + left}px`;
      };

      document.onmouseup = function () {
        elementStore[`$table`].classList.remove('c--resize');
        target.style.display = 'none';

        this.onmousemove = null;
        this.onmouseup = null;

        if (typeof res !== 'number') return;

        _this.column.renderWidth = res;
        _this.column.width = res;

        columnsChange([...columns]);
      };

      return false;
    },
  },
  render(): JSXNode {
    const { resizable, bordered } = this.$$table;
    const resizableCls = {
      [`resizable`]: true,
      [`is--line`]: resizable && !bordered,
    };
    return <div class={resizableCls} onMousedown={this.resizeMousedown} />;
  },
});
