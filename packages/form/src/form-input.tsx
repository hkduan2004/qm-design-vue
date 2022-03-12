/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-15 15:34:50
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

import type { JSXNode, Nullable } from '../../_utils/types';

export default defineComponent({
  name: 'FormInput',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form, formType } = this.$$form;
    const { t } = useLocale();
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      minlength = 0,
      maxlength,
      showLimit,
      prefixIcon,
      suffixIcon,
      appendRender,
      password = false,
      noInput = false,
      toUpper = false,
      onInput = noop,
      onEnter = noop,
      onFocus = noop,
      onBlur = noop,
      onClick = noop,
      onDblClick = noop,
    } = options;

    const createSuffix = (): Nullable<{ append: () => JSXNode }> => {
      if (appendRender) {
        return {
          append: () => <div style={disabled && { pointerEvents: 'none' }}>{appendRender()}</div>,
        };
      }
      return null;
    };

    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val: string): void => {
        // 搜索帮助，不允许输入
        if (noInput) return;
        form[fieldName] = !toUpper ? val : val.toUpperCase();
        onInput(val);
      },
    };

    this.$$form.setViewValue(fieldName, form[fieldName]);

    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth ? getParserWidth(labelWidth) : ''}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <el-input
          ref={type}
          {...wrapProps}
          title={form[fieldName]}
          minlength={minlength}
          maxlength={maxlength}
          placeholder={!disabled ? placeholder : ''}
          prefix-icon={prefixIcon}
          suffix-icon={suffixIcon}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          show-password={password}
          show-word-limit={showLimit}
          onChange={(val: string): void => {
            val = val.trim();
            form[fieldName] = val;
            onChange(form[fieldName]);
          }}
          onFocus={onFocus}
          onBlur={() => {
            onBlur(form[fieldName]);
          }}
          onClick={() => {
            onClick(form[fieldName]);
          }}
          onDblclick={() => {
            onDblClick(form[fieldName]);
          }}
          onKeyup={(ev) => {
            if (ev.keyCode !== 13) return;
            onEnter(ev.target.value);
            this.$$form.formItemValidate(fieldName);
            if (formType === 'search') {
              this.$$form.submitForm(ev);
            }
          }}
          v-slots={createSuffix()}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
