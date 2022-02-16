/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 17:39:44
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop, formatNumber, parserNumber } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

import InputNumber from './InputNumber';

export default defineComponent({
  name: 'FormInputNumber',
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
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { maxlength, min = 0, max, step, precision, toFinance, controls = !1, onEnter = noop } = options;
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
        <InputNumber
          ref={type}
          v-model={form[fieldName]}
          min={min}
          max={max}
          step={step}
          precision={precision}
          maxlength={maxlength}
          controls={controls}
          formatter={toFinance ? formatNumber : undefined}
          parser={toFinance ? parserNumber : undefined}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          onChange={onChange}
          onKeyup={(ev) => {
            if (ev.keyCode !== 13) return;
            const val = ev.target.value;
            this.$$form.formItemValidate(fieldName);
            onEnter(val ? Number(val) : val);
            if (formType === 'search') {
              this.$$form.submitForm(ev);
            }
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
