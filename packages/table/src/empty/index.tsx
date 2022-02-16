/*
 * @Author: 焦质晔
 * @Date: 2020-03-08 14:47:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:55:17
 */
import { defineComponent, CSSProperties } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import type { JSXNode } from '../../../_utils/types';

import Empty from '../../../empty';

export default defineComponent({
  name: 'EmptyContent',
  inject: ['$$table'],
  computed: {
    styles(): CSSProperties {
      const { layout } = this.$$table;
      return {
        top: `${layout.headerHeight}px`,
        height: `${layout.viewportHeight}px`,
      };
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}--empty`} style={this.styles}>
        <Empty />
      </div>
    );
  },
});
