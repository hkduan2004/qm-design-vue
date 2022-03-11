/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-28 15:32:18
 */
import { defineComponent, VNode, ComponentInternalInstance, PropType } from 'vue';
import addEventListener from 'add-dom-event-listener';
import scrollIntoView from 'scroll-into-view-if-needed';
import PropTypes from '../../_utils/vue-types';
import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import { useSize } from '../../hooks';
import { getParserWidth, throttle, isNumber } from '../../_utils/util';
import { getOffsetTopDistance } from '../../_utils/dom';
import { getValidSlot, getInstanceFromSlot } from '../../_utils/instance-children';
import { getPrefixCls } from '../../_utils/prefix';
import type { ComponentSize, JSXNode, Nullable } from '../../_utils/types';

import AnchorNav from './anchor-nav';

const ANCHOR_ITEM_NAME = 'QmAnchorItem';
const prefixCls = getPrefixCls('anchor');

export default defineComponent({
  name: 'QmAnchor',
  componentName: 'QmAnchor',
  props: {
    labelList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
      })
    ),
    labelWidth: {
      type: [Number, String] as PropType<number | string>,
      default: 80,
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
  },
  data() {
    Object.assign(this, { state: 'ready' });
    return {
      activeKey: 0,
      anchorItemInstances: [],
    };
  },
  computed: {
    itemsTotal(): number {
      return this.labelList?.length ?? this.anchorItemInstances.length;
    },
  },
  mounted() {
    this.anchorItemInstances = this.getAnchorItems();
    this.scrollEvent = addEventListener(this.$refs[`scroll`], 'scroll', throttle(this.scrollHandle, 60));
  },
  beforeUnmount() {
    this.scrollEvent?.remove();
  },
  methods: {
    getAnchorItems(): Array<ComponentInternalInstance> {
      // this -> ctx 执行上下文
      // instance -> 组件实例，有 uid, subTree 属性
      // vnode -> 有 __v_isVNode, el 属性
      const { _: instance } = this;
      const { children } = instance.subTree;
      const content: Nullable<VNode> =
        Array.from(children as ArrayLike<VNode>).find(({ props }) => {
          return props?.class === `${prefixCls}__container`;
        }) ?? null;
      if (!content) {
        return [];
      }
      return getInstanceFromSlot(content, ANCHOR_ITEM_NAME);
    },
    createDistances(): Array<number> {
      return !this.labelList?.length
        ? this.anchorItemInstances.map((x) => getOffsetTopDistance(x.vnode.el, this.$refs[`scroll`]))
        : this.labelList.map((x) => getOffsetTopDistance(document.getElementById(x.id) as HTMLElement, this.$refs[`scroll`]));
    },
    findCurrentIndex(t: number): number {
      const top: number = Math.abs(t);
      const distances = this.createDistances();
      let index: number = -1;
      for (let i = 0; i < distances.length; i++) {
        const t1: number = distances[i];
        const t2: number = distances[i + 1] || 10000;
        if (top >= t1 - 1 && top < t2) {
          index = i;
        }
      }
      return index;
    },
    scrollHandle(ev: Event): void {
      if (this.state !== 'ready') return;
      const index: number = this.findCurrentIndex((ev.target as HTMLElement).scrollTop);
      if (index === -1) return;
      this.activeKey = index;
    },
    tabClickHandle(index: number): void {
      this.state = 'stop';
      this.timer && clearTimeout(this.timer);
      this.activeKey = index;
      const $el: HTMLElement = !this.labelList?.length ? this.anchorItemInstances[index].vnode.el : document.getElementById(this.labelList[index].id);
      scrollIntoView($el, {
        block: 'start',
        behavior: 'smooth',
        boundary: this.$refs[`scroll`],
      });
      this.timer = setTimeout(() => (this.state = 'ready'), 500);
    },
    // 公开方法
    SCROLL_TO_ITEM(index: number): void {
      index = index < 0 ? 0 : index;
      index = index > this.itemsTotal ? this.itemsTotal : index;
      this.tabClickHandle(index);
    },
  },
  render(): JSXNode {
    const { activeKey, labelList, labelWidth, anchorItemInstances } = this;
    const { $size } = useSize(this.$props);
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };
    return (
      <div class={cls}>
        <div class={`${prefixCls}__label`} style={{ width: getParserWidth(labelWidth) }}>
          <AnchorNav activeKey={activeKey} anchor-items={anchorItemInstances} label-list={labelList} onTabClick={this.tabClickHandle} />
        </div>
        <div ref="scroll" class={`${prefixCls}__container`}>
          {!labelList?.length ? getValidSlot(this.$slots.default?.(), ANCHOR_ITEM_NAME) : this.$slots.default?.()}
        </div>
      </div>
    );
  },
});
