/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:41:31
 */
import { defineComponent, PropType, isVNode } from 'vue';
import { isString, isNull } from '../../_utils/util';
import { useSize } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import type { ComponentSize, JSXNode } from '../../_utils/types';

import DividerExpand from './divider-expand';

export default defineComponent({
  name: 'QmDivider',
  componentName: 'QmDivider',
  provide() {
    return {
      $$divider: this,
    };
  },
  props: {
    label: {
      type: String,
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    extra: {
      type: [String, Object] as PropType<string | JSXNode>,
      default: null,
      validator: (val: unknown): boolean => {
        return isVNode(val) || isString(val);
      },
    },
    collapse: {
      type: Boolean,
      default: null,
    },
  },
  emits: ['update:collapse', 'change'],
  methods: {
    doToggle(val: boolean): void {
      // template -> v-model:collapse="this.expand"   JSX -> v-model={[this.expand, 'collapse']}
      this.$emit('update:collapse', val);
      this.$emit('change', val);
    },
  },
  render(): JSXNode {
    const { label, extra, collapse } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('divider');
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };
    return (
      <div class={cls}>
        <span class={`${prefixCls}__title`}>{label}</span>
        <div class={`${prefixCls}__extra`}>{extra}</div>
        {!isNull(collapse) && (
          <span class={`${prefixCls}__collapse`}>
            {/* 受控组件 */}
            <DividerExpand expand={collapse} />
          </span>
        )}
      </div>
    );
  },
});
