/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:16:15
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormTime',
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
      placeholder = t('qm.form.timePlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { timeFormat = 'HH:mm:ss', defaultTime } = options;
    this.$$form.setViewValue(fieldName, form[fieldName]);
    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = val;
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
          {...wrapProps}
          format={timeFormat}
          value-format={timeFormat}
          default-value={defaultTime ? new Date(`1970-01-01 ${defaultTime}`) : defaultTime}
          placeholder={!disabled ? placeholder : ''}
          style={{ ...style }}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          onChange={onChange}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
