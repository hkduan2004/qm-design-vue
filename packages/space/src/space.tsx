/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-13 17:33:11
 */
import { defineComponent, PropType, VNode, CSSProperties } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { useSize } from '../../hooks';
import { isVNode, isValidElement, isString, isNumber } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import type { JSXNode, ComponentSize } from '../../_utils/types';

enum Align {
  top = 'flex-start',
  center = 'center',
  bottom = 'flex-end',
}

enum Arrange {
  left = 'flex-start',
  center = 'center',
  right = 'flex-end',
}

enum Space {
  large = 12,
  default = 10,
  small = 8,
}

export default defineComponent({
  name: 'QmSpace',
  componentName: 'QmSpace',
  props: {
    alignment: PropTypes.oneOf(['top', 'center', 'bottom']).def('center'),
    direction: PropTypes.oneOf(['vertical', 'horizontal']).def('horizontal'),
    arrangement: PropTypes.oneOf(['left', 'center', 'right']).def('left'),
    size: {
      type: [Number, String] as PropType<number | ComponentSize>,
      validator: (val: number | ComponentSize): boolean => {
        return isNumber(val) || isValidComponentSize(val as ComponentSize);
      },
    },
    wrap: PropTypes.bool,
    spacer: {
      type: [String, Object] as PropType<string | JSXNode>,
      default: null,
      validator: (val: unknown): boolean => {
        return isVNode(val) || isString(val);
      },
    },
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  computed: {
    align(): string {
      return Align[this.alignment];
    },
    arrange(): string {
      return Arrange[this.arrangement];
    },
  },
  render(): JSXNode {
    const { align, arrange, direction, spacer, size, wrap, containerStyle } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('space');
    const rsize = isNumber(size) ? size : Space[size || $size || 'default'];

    const cls = {
      [prefixCls]: true,
    };
    const wrapProps = {
      direction,
      alignment: align,
      size: rsize,
      spacer,
      wrap,
      style: { [direction === 'horizontal' ? 'marginRight' : 'marginBottom']: `-${rsize}px` },
    };

    const flexDirection = direction === 'horizontal' ? 'row' : 'column';
    const styleName = direction === 'horizontal' ? 'width' : 'height';
    const style = Object.assign({}, { flexDirection, justifyContent: arrange }, arrange !== 'flex-start' ? { [styleName]: '100%' } : null);

    const children: VNode[] = this.$slots.default?.() ?? [];

    return (
      <div class={cls} style={[style, containerStyle]}>
        <el-space {...wrapProps}>{children.filter((x) => isValidElement(x))}</el-space>
      </div>
    );
  },
});
