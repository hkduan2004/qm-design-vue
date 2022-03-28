/*
 * @Author: 焦质晔
 * @Date: 2020-08-11 08:19:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-28 11:01:30
 */
import { defineComponent, inject } from 'vue';
import PropTypes from '../../_utils/vue-types';
import ElementPlus from 'element-plus';
import { useSize } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'InputNumber',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.string,
    min: PropTypes.number.def(0),
    max: PropTypes.number,
    step: PropTypes.number.def(1),
    maxlength: PropTypes.number,
    precision: PropTypes.number,
    formatter: PropTypes.func,
    parser: PropTypes.func,
    controls: PropTypes.bool.def(false),
    placeholder: PropTypes.string,
    clearable: PropTypes.bool.def(false),
    readonly: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyup: PropTypes.func,
  },
  setup() {
    const elFormItem = inject((ElementPlus as any).formItemContextKey, {});
    return { elFormItem };
  },
  data() {
    return {
      currentValue: '',
    };
  },
  computed: {
    minDisabled(): boolean {
      return this.parserHandle(this.currentValue) <= this.min;
    },
    maxDisabled(): boolean {
      return this.parserHandle(this.currentValue) >= this.max;
    },
  },
  watch: {
    modelValue: {
      handler(next: number): void {
        this.setValueHandle(next);
      },
      immediate: true,
    },
  },
  methods: {
    parserHandle(val: string): number {
      const value = this.parser ? this.parser(val) : val;
      return Number(value);
    },
    setValueHandle(val: number | string): void {
      val = val ?? '';
      if (this.precision >= 0 && val !== '') {
        val = Number(val).toFixed(this.precision);
      }
      this.currentValue = this.formatter?.(val) ?? val.toString();
    },
    emitEventHandle(val: number | string | undefined): void {
      val = val !== '' ? Number(val) : undefined;
      this.$emit('update:modelValue', val);
      this.$emit('change', val);
      this.elFormItem.validate?.('change');
    },
    increaseHandle(): void {
      if (this.maxDisabled) return;
      if (this.readonly || this.disabled) return;
      let val: number = this.parserHandle(this.currentValue) + this.step;
      val = val > this.max ? this.max : val;
      this.setValueHandle(val);
      this.emitEventHandle(val);
    },
    decreaseHanle(): void {
      if (this.minDisabled) return;
      if (this.readonly || this.disabled) return;
      let val: number = this.parserHandle(this.currentValue) - this.step;
      val = val < this.min ? this.min : val;
      this.setValueHandle(val);
      this.emitEventHandle(val);
    },
    blur(): void {
      this.elFormItem.validate?.('blur');
    },
    focus(): void {
      this.$refs['input']?.focus();
    },
    select(): void {
      this.$refs['input']?.select();
    },
  },
  render(): JSXNode {
    const {
      currentValue,
      min,
      max,
      maxlength,
      precision,
      formatter,
      parser,
      controls,
      placeholder,
      clearable,
      readonly,
      disabled,
      minDisabled,
      maxDisabled,
    } = this;
    const { $size } = useSize(this.$props);
    const regExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    const cls = [
      'el-input-number',
      {
        [`el-input-number--${$size}`]: !!$size,
      },
      { 'is-disabled': disabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controls },
    ];
    const wrapProps = {
      modelValue: currentValue,
      'onUpdate:modelValue': (val) => {
        // 反格式化
        if (typeof parser === 'function') {
          val = parser(val);
        }
        let isPassed = (!Number.isNaN(val) && regExp.test(val)) || val === '' || val === '-';
        if (!isPassed) return;
        // 不允许是负数
        if (min >= 0 && val === '-') return;
        let chunks: string[] = val.split('.');
        // 判断最大长度
        if (chunks[0].length > maxlength) return;
        // 判断整型
        if (precision === 0 && chunks.length > 1) return;
        // 判断浮点型
        if (precision > 0 && chunks.length > 1 && chunks[1].length > precision) return;
        // 格式化
        if (typeof formatter === 'function') {
          val = formatter(val);
        }
        // 设置数据值
        this.currentValue = val;
      },
    };
    return (
      <div class={cls}>
        {controls && (
          <span class={{ 'el-input-number__decrease': !0, 'is-disabled': minDisabled }} role="button" onClick={this.decreaseHanle}>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </span>
        )}
        {controls && (
          <span class={{ 'el-input-number__increase': !0, 'is-disabled': maxDisabled }} role="button" onClick={this.increaseHandle}>
            <el-icon>
              <ArrowUp />
            </el-icon>
          </span>
        )}
        <el-input
          ref="input"
          {...wrapProps}
          size={$size}
          validateEvent={false}
          placeholder={placeholder}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          onChange={(val) => {
            // 处理 val 值得特殊情况
            if (val.charAt(val.length - 1) === '.' || val === '-') {
              val = val.slice(0, -1);
            }
            // 反格式化
            if (typeof parser === 'function') {
              val = parser(val);
            }
            // 判断最大值/最小值
            if (Number(val) > max) {
              val = max;
            }
            if (Number(val) < min) {
              val = min;
            }
            this.setValueHandle(val);
            this.emitEventHandle(val);
          }}
          onBlur={this.blur}
          onKeyup={(ev: KeyboardEvent): void => {
            this.$emit('keyup', ev);
          }}
        />
      </div>
    );
  },
});
