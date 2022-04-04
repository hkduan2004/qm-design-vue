/*
 * @Author: 焦质晔
 * @Date: 2020-03-30 15:59:26
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 19:39:30
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import type { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'AllExpandable',
  inject: ['$$table'],
  data() {
    return {
      expanded: this.initialExpand(),
    };
  },
  watch: {
    expanded(val: boolean): void {
      const { allRowKeys, flattenRowKeys, isTreeTable } = this.$$table;
      this.$$table.rowExpandedKeys = val ? allRowKeys.filter((key) => !(isTreeTable && flattenRowKeys.includes(key))) : [];
    },
  },
  methods: {
    initialExpand(): boolean {
      return this.$$table.expandable?.defaultExpandAllRows || false;
    },
    clickHandle(ev: MouseEvent): void {
      ev.stopPropagation();
      this.expanded = !this.expanded;
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('expand');
    const cls = {
      [`${prefixCls}--icon`]: true,
      expanded: this.expanded,
      collapsed: !this.expanded,
    };
    return <span class={cls} onClick={this.clickHandle} />;
  },
});
