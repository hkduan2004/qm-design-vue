/*
 * @Author: 焦质晔
 * @Date: 2020-08-11 08:19:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-28 11:45:15
 */
import { defineComponent } from 'vue';
import PropTypes from '../../../_utils/vue-types';
import { useSize } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'InputNumber',
  emits: ['update:modelValue', 'change', 'keydown'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.string,
    min: PropTypes.number.def(0),
    max: PropTypes.number,
    step: PropTypes.number.def(1),
    maxlength: PropTypes.number,
    precision: PropTypes.number,
    controls: PropTypes.bool.def(false),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onKeydown: PropTypes.func,
  },
  data() {
    return {
      currentValue: '',
    };
  },
  computed: {
    minDisabled() {
      return this.currentValue <= this.min;
    },
    maxDisabled() {
      return this.currentValue >= this.max;
    },
  },
  watch: {
    modelValue: {
      handler(val) {
        this.setValueHandle(val);
      },
      immediate: true,
    },
  },
  methods: {
    setValueHandle(val) {
      val = val ?? '';
      if (this.precision >= 0 && val !== '') {
        val = Number(val).toFixed(this.precision);
      }
      this.currentValue = val;
    },
    emitEventHandle(val) {
      val = val !== '' ? Number(val) : undefined;
      this.$emit('update:modelValue', val);
      this.$emit('change', val);
    },
    increaseHandle() {
      if (this.maxDisabled || this.disabled) return;
      let val = Number(this.currentValue) + this.step;
      val = val > this.max ? this.max : val;
      this.setValueHandle(val);
      this.emitEventHandle(val);
    },
    decreaseHanle() {
      if (this.minDisabled || this.disabled) return;
      let val = Number(this.currentValue) - this.step;
      val = val < this.min ? this.min : val;
      this.setValueHandle(val);
      this.emitEventHandle(val);
    },
    focus() {
      this.$refs['input']?.focus();
    },
    blur() {
      this.$refs['input']?.blur();
    },
    select() {
      this.$refs['input']?.select();
    },
  },
  render(): JSXNode {
    const { currentValue, min, max, maxlength, precision, controls, placeholder, disabled, minDisabled, maxDisabled } = this;
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
        let isPassed = (!Number.isNaN(val) && regExp.test(val)) || val === '' || val === '-';
        // 数值类型校验
        if (!isPassed) return;
        // 不允许是负数
        if (min >= 0 && val === '-') return;
        let chunks = val.split('.');
        // 判断最大长度
        if (chunks[0].length > maxlength) return;
        // 判断整型
        if (precision === 0 && chunks.length > 1) return;
        // 判断浮点型
        if (precision > 0 && chunks.length > 1 && chunks[1].length > precision) return;
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
          placeholder={placeholder}
          disabled={disabled}
          onChange={(val) => {
            // 处理 val 值得特殊情况
            if (val.charAt(val.length - 1) === '.' || val === '-') {
              val = val.slice(0, -1);
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
          onKeydown={(ev) => {
            this.$emit('keydown', ev);
          }}
        />
      </div>
    );
  },
});
