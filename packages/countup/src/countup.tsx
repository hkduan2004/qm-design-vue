/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:38:34
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { CountUp } from 'countup.js';
import { isFunction } from '../../_utils/util';
import { useSize } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, ComponentSize, AnyFunction } from '../../_utils/types';

export default defineComponent({
  name: 'QmCountup',
  componentName: 'QmCountup',
  emits: ['ready'],
  props: {
    endValue: PropTypes.number.isRequired,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    delay: PropTypes.number.def(0),
    options: PropTypes.object.def({}),
  },
  data() {
    return {};
  },
  watch: {
    endValue(value: number): void {
      if (this.instance && isFunction(this.instance.update)) {
        this.instance.update(value);
      }
    },
  },
  mounted() {
    this.create();
  },
  unmounted() {
    this.instance = null;
  },
  methods: {
    create(): void {
      this.instance = new CountUp(this.$refs.countup, this.endValue, this.options) || { error: true };
      if (this.instance.error) return;
      setTimeout(() => {
        this.instance.start(() => {
          this.$emit('ready', this.instance, CountUp);
        });
      }, this.delay);
    },
    printValue(value): void {
      if (this.instance && isFunction(this.instance.printValue)) {
        return this.instance.printValue(value);
      }
    },
    start(callback: AnyFunction<void>): void {
      if (this.instance && isFunction(this.instance.start)) {
        return this.instance.start(callback);
      }
    },
    pauseResume(): void {
      if (this.instance && isFunction(this.instance.pauseResume)) {
        return this.instance.pauseResume();
      }
    },
    reset(): void {
      if (this.instance && isFunction(this.instance.reset)) {
        return this.instance.reset();
      }
    },
    update(newEndVal): void {
      if (this.instance && isFunction(this.instance.update)) {
        return this.instance.update(newEndVal);
      }
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('countup');
    const { $size } = useSize(this.$props);
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };
    return <span ref="countup" class={cls} />;
  },
});
