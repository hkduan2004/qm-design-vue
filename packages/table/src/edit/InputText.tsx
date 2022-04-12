/*
 * @Author: 焦质晔
 * @Date: 2020-08-11 08:19:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:21:14
 */
import { defineComponent } from 'vue';
import PropTypes from '../../../_utils/vue-types';
import { stop } from '../../../_utils/dom';
import { useSize } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'InputText',
  emits: ['update:modelValue', 'change', 'input', 'dblclick', 'keydown'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.string,
    maxlength: PropTypes.number,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool.def(false),
    clearable: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false),
    onInput: PropTypes.func,
    onChange: PropTypes.func,
    onDblclick: PropTypes.func,
    onKeydown: PropTypes.func,
  },
  data() {
    return {
      currentValue: '',
    };
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
      this.currentValue = val;
    },
    emitEventHandle(val) {
      this.$emit('update:modelValue', val);
      this.$emit('change', val);
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
    const { currentValue, maxlength, placeholder, readonly, clearable, disabled } = this;
    const { $size } = useSize(this.$props);
    const wrapProps = {
      modelValue: currentValue,
      'onUpdate:modelValue': (val) => {
        this.currentValue = val;
        this.$emit('input', val);
      },
    };
    return (
      <el-input
        ref="input"
        {...wrapProps}
        size={$size}
        maxlength={maxlength}
        placeholder={placeholder}
        readonly={readonly}
        disabled={disabled}
        clearable={clearable}
        onChange={(val) => {
          this.setValueHandle(val);
          this.emitEventHandle(val);
        }}
        onClick={(ev) => {
          if (Array.from(ev.target.classList).includes('el-input__clear')) {
            stop(ev);
          }
        }}
        onDblclick={(ev) => {
          this.$emit('dblclick', ev);
        }}
        onKeydown={(ev) => {
          this.$emit('keydown', ev);
        }}
        v-slots={{
          append: this.$slots[`append`]?.() ? (): JSXNode => this.$slots[`append`]() : null,
        }}
      />
    );
  },
});
