/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:16:11
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormTimeSelect',
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
    const { timeFormat = 'HH:mm', defaultTime, startTime = '00:00', endTime = '23:45', stepTime = '00:15' } = options;
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
        <el-time-select
          v-model={form[fieldName]}
          start={startTime}
          end={endTime}
          step={stepTime}
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
