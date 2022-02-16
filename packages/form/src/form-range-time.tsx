/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:46
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormRangeTime',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
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
      placeholder = [],
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { timeFormat = 'HH:mm:ss' } = options;
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
    const wrapProps = {
      modelValue: form[fieldName].length ? form[fieldName] : undefined,
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = val ?? [];
      },
    };
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
        <el-time-picker
          is-range={true}
          {...wrapProps}
          format={timeFormat}
          value-format={timeFormat}
          range-separator="-"
          start-placeholder={!disabled ? placeholder[0] ?? t('qm.form.timerangePlaceholder.0') : ''}
          end-placeholder={!disabled ? placeholder[1] ?? t('qm.form.timerangePlaceholder.1') : ''}
          style={{ ...style }}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          onChange={(): void => onChange(form[fieldName])}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
