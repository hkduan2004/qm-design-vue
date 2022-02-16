/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:48:07
 */
import { defineComponent, PropType } from 'vue';
import { isNumber } from '../../_utils/util';
import { isValidWidthUnit } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import { getValidSlot } from '../../_utils/instance-children';
import { warn } from '../../_utils/error';
import type { JSXNode } from '../../_utils/types';

import ResizeBar from './resize-bar';

const SPLIT_PANE_NAME = 'QmSplitPane';

export default defineComponent({
  name: 'QmSplit',
  componentName: 'QmSplit',
  provide() {
    return {
      $$split: this,
    };
  },
  emits: ['change'],
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
      validator: (val: string): boolean => {
        return ['horizontal', 'vertical'].includes(val);
      },
    },
    initialValue: {
      type: [Number, String] as PropType<number | string>,
      default: '50%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    uniqueKey: {
      type: String as PropType<string>,
    },
  },
  data() {
    return {
      dragging: false,
      offset: this.initialValue,
    };
  },
  computed: {
    spliterKey(): string {
      return this.uniqueKey ? `split_${this.uniqueKey}` : '';
    },
  },
  watch: {
    dragging(next: boolean): void {
      if (next) return;
      localStorage.setItem(this.spliterKey, this.offset);
      this.saveSplitConfig(this.spliterKey, this.offset);
    },
  },
  created() {
    this.getLocalValue();
  },
  methods: {
    dragHandle(val: number): void {
      this.offset = val;
      this.$emit('change');
    },
    createMinValue(C: JSXNode): number {
      const val = Number.parseInt(C.props?.min || 0);
      return val >= 0 ? val : 0;
    },
    getLocalValue(): void {
      if (!this.spliterKey) return;
      // 本地存储
      const localValue = localStorage.getItem(this.spliterKey);
      // 服务端获取
      if (!localValue) {
        this.getSplitConfig(this.spliterKey)
          .then((result) => {
            localStorage.setItem(this.spliterKey, result || this.initialValue);
            this.getLocalValue();
          })
          .catch(() => {});
      } else {
        this.offset = Number(localValue) > 0 ? Number(localValue) : localValue;
      }
    },
    async getSplitConfig(key: string): Promise<unknown | void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {}
    },
    async saveSplitConfig(key: string, value): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { direction, offset } = this;
    const prefixCls = getPrefixCls('split');
    const [FirstComponent, LastComponent] = getValidSlot(this.$slots.default?.(), SPLIT_PANE_NAME) as any[];
    if (!(FirstComponent && LastComponent)) {
      warn('Split', `qm-split-pane 组件不正确`);
      return this.$slots.default?.();
    }
    const minValues = [this.createMinValue(FirstComponent), this.createMinValue(LastComponent)];
    const cls = {
      [prefixCls]: true,
      vertical: direction === 'vertical',
    };
    return (
      <div ref="split" class={cls}>
        <FirstComponent offset={offset} />
        <ResizeBar v-model={[this.dragging, 'dragging']} direction={direction} minValues={minValues} onDrag={this.dragHandle} />
        <LastComponent />
      </div>
    );
  },
});
