/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:56:01
 */
import { defineComponent, PropType, VNode } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { isVNode, isString } from '../../_utils/util';
import { useSize } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { getValidSlot } from '../../_utils/instance-children';
import { isValidComponentSize } from '../../_utils/validators';
import type { AnyFunction, ComponentSize, JSXNode } from '../../_utils/types';

type BeforeLeave = (newTabName: string, oldTabName: string) => void | Promise<void> | boolean;

const TAB_PANE_NAME = 'QmTabPane';

export default defineComponent({
  name: 'QmTabs',
  componentName: 'QmTabs',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: {
      type: String,
    },
    tabPosition: {
      type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
      default: 'top',
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    lazyLoad: PropTypes.bool.def(true),
    tabCustomClass: PropTypes.string,
    beforeLeave: {
      type: Function as PropType<BeforeLeave>,
    },
    extraNode: {
      type: [String, Object] as PropType<string | JSXNode>,
      default: null,
      validator: (val: unknown): boolean => {
        return isVNode(val) || isString(val);
      },
    },
  },
  methods: {
    renderTabPanes($slots: Array<VNode>): JSXNode[] {
      return $slots.map((vNode, index) => {
        const { label, name, disabled, lazy } = vNode.props || {};
        return (
          <el-tab-pane label={label} name={name ?? index.toString()} disabled={disabled} lazy={lazy ?? this.lazyLoad}>
            {vNode}
          </el-tab-pane>
        );
      });
    },
    doChangeHandle(val: string, cb: AnyFunction<any>): void {
      if (this.modelValue === val) return;
      if (this.beforeLeave) {
        const before = this.beforeLeave(val, this.modelValue);
        if (before && (before as Promise<void>).then) {
          (before as Promise<void>)
            .then(() => {
              cb(); // 执行回调
            })
            .catch(() => {});
        } else if (before !== false) {
          cb();
        }
      } else {
        cb();
      }
    },
  },
  render(): JSXNode {
    const { modelValue, tabPosition, beforeLeave, extraNode, $props } = this;

    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('tabs');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };

    const wrapProps = {
      class: $props.tabCustomClass,
      modelValue,
      tabPosition,
      beforeLeave,
      'onUpdate:modelValue': (val: string): void => {
        this.$emit('update:modelValue', val);
      },
      onTabClick: (tab): void => {
        this.doChangeHandle(tab.paneName, () => this.$emit('change', tab.paneName));
      },
    };

    return (
      <div class={cls}>
        {extraNode && tabPosition === 'top' ? <div class={`${prefixCls}__extra`}>{extraNode}</div> : null}
        <el-tabs {...wrapProps}>{this.renderTabPanes(getValidSlot(this.$slots.default?.(), TAB_PANE_NAME))}</el-tabs>
      </div>
    );
  },
});
