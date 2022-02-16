/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 14:27:23
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { useSize } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import type { ComponentSize, JSXNode } from '../../_utils/types';

const prefixCls = getPrefixCls('spin');

export default defineComponent({
  name: 'QmSpin',
  componentName: 'QmSpin',
  inheritAttrs: false,
  props: {
    spinning: PropTypes.bool.def(false),
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    mode: PropTypes.oneOf(['spin', 'normal']).def('spin'),
    delay: PropTypes.number.def(100),
    tip: PropTypes.string,
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  data() {
    return {
      sSpinning: this.spinning,
    };
  },
  watch: {
    spinning(val: boolean): void {
      this.stopTimer();
      if (!val) {
        this.sSpinning = val;
      } else {
        this.timer = setTimeout(() => (this.sSpinning = val), this.delay);
      }
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    stopTimer(): void {
      this.timer && clearTimeout(this.timer);
    },
    renderIndicator(): JSXNode {
      const cls = {
        [`${prefixCls}-dot`]: this.mode === 'spin',
        [`${prefixCls}-dot-spin`]: this.mode === 'spin',
        [`${prefixCls}-point`]: this.mode === 'normal',
      };
      return (
        <span class={cls}>
          <i />
          <i />
          <i />
          <i />
        </span>
      );
    },
  },
  render(): JSXNode {
    const { tip, containerStyle, ...restProps } = this.$props;
    const { sSpinning } = this;

    const { $size } = useSize(this.$props);

    const spinClassName = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
      [`${prefixCls}-spinning`]: sSpinning,
      [`${prefixCls}-show-text`]: !!tip,
    };

    const spinElement: JSXNode = (
      <div {...restProps} class={spinClassName}>
        {this.renderIndicator()}
        {tip ? <div class={`${prefixCls}-text`}>{tip}</div> : null}
      </div>
    );

    const children = this.$slots.default?.();

    if (children) {
      const containerClassName = {
        [`${prefixCls}-container`]: true,
        [`${prefixCls}-blur`]: sSpinning,
      };
      return (
        <div class={`${prefixCls}-nested-loading`} style={containerStyle}>
          {sSpinning && <div key="loading">{spinElement}</div>}
          <div key="container" class={containerClassName} style={containerStyle}>
            {children}
          </div>
        </div>
      );
    }

    return spinElement;
  },
});
