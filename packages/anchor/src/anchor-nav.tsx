/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 10:41:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-04 18:07:31
 */
import { defineComponent, PropType, ComponentInternalInstance } from 'vue';
import { JSXNode } from '../../_utils/types';
import { getPrefixCls } from '../../_utils/prefix';

const prefixCls = getPrefixCls('anchor-nav');

const NOOP = (): void => {};

export default defineComponent({
  name: 'AnchorNav',
  props: {
    activeKey: {
      type: Number,
      default: 0,
    },
    anchorItems: {
      type: Array as PropType<ComponentInternalInstance[]>,
      default: () => [],
    },
    labelList: {
      type: Array,
      default: () => [],
    },
    onTabClick: {
      type: Function as PropType<(index: number, ev: Event) => void>,
      default: NOOP,
    },
  },
  emits: ['tab-click'],
  methods: {
    renderLabel(): Array<JSXNode> {
      const labels: string[] = !this.labelList.length
        ? this.anchorItems.map(({ props }, index) => props.label || index.toString())
        : this.labelList.map((x, index) => x.label || index.toString());
      return labels.map((x, i) => {
        const cls = {
          [`${prefixCls}__item`]: true,
          [`actived`]: i === this.activeKey,
        };
        return (
          <div key={i} class={cls} onClick={(ev: Event): void => this.$emit('tab-click', i, ev)}>
            <span>{x}</span>
          </div>
        );
      });
    },
  },
  render(): JSXNode {
    const cls = {
      [prefixCls]: true,
    };
    return <div class={cls}>{this.renderLabel()}</div>;
  },
});
