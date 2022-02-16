/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 08:48:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:48:40
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import { isValidWidthUnit } from '../../_utils/validators';
import { getParserWidth, isNumber } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'QmSplitPane',
  componentName: 'QmSplitPane',
  inject: ['$$split'],
  props: {
    offset: {
      type: [Number, String] as PropType<number | string>,
    },
    min: {
      type: [Number, String] as PropType<number | string>,
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
  },
  render(): JSXNode {
    const { direction, dragging } = this.$$split;
    const prefixCls = getPrefixCls('split-pane');
    const property = direction === 'vertical' ? 'height' : 'width';
    const cls = {
      [prefixCls]: true,
      isLocked: dragging,
      horizontal: direction === 'horizontal',
      vertical: direction === 'vertical',
    };
    const styles: CSSProperties = typeof this.offset !== 'undefined' ? { [property]: getParserWidth(this.offset) } : { flex: 1 };
    return (
      <div class={cls} style={{ ...styles }}>
        {this.$slots.default?.()}
      </div>
    );
  },
});
