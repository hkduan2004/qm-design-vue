/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 01:13:44
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:57:00
 */
import { defineComponent } from 'vue';
import PropTypes from '../../../_utils/vue-types';
import { getPrefixCls } from '../../../_utils/prefix';
import type { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Checkbox',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(false),
    trueValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(true),
    falseValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(false),
    label: PropTypes.string,
    readonly: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false),
    indeterminate: PropTypes.bool.def(false),
    onChange: PropTypes.func,
  },
  data() {
    return {
      currentValue: this.modelValue,
      focusInner: false,
    };
  },
  watch: {
    modelValue(): void {
      this.updateModel();
    },
  },
  mounted() {
    this.updateModel();
  },
  methods: {
    change(ev): void {
      if (this.disabled || this.readonly) return;

      const checked = ev.target.checked;
      this.currentValue = checked;

      const value = checked ? this.trueValue : this.falseValue;

      this.$emit('update:modelValue', value);
      this.$emit('change', value);
    },
    updateModel(): void {
      this.currentValue = this.modelValue === this.trueValue;
    },
    onBlur(): void {
      this.focusInner = false;
    },
    onFocus(): void {
      this.focusInner = true;
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('checkbox');
    const wrapCls = {
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: this.currentValue,
      [`${prefixCls}-wrapper-disabled`]: this.disabled,
    };
    const checkboxCls = {
      [prefixCls]: true,
      [`${prefixCls}-checked`]: this.currentValue,
      [`${prefixCls}-disabled`]: this.disabled,
      [`${prefixCls}-indeterminate`]: this.indeterminate,
    };
    const innerCls = {
      [`${prefixCls}-inner`]: true,
      [`${prefixCls}-focus`]: this.focusInner,
    };
    const inputCls = [`${prefixCls}-input`];
    const textCls = [`${prefixCls}-text`];
    return (
      <label class={wrapCls}>
        <span class={checkboxCls}>
          <span class={innerCls} />
          <input
            type="checkbox"
            class={inputCls}
            readonly={this.readonly}
            disabled={this.disabled}
            checked={this.currentValue}
            onChange={this.change}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </span>
        {this.label && <span class={textCls}>{this.label}</span>}
      </label>
    );
  },
});
