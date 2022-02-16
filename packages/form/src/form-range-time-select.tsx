/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:41
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormRangeTimeSelect',
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
    const { timeFormat = 'HH:mm', startTime = '00:00', endTime = '23:45', stepTime = '00:15', startDisabled, endDisabled } = options;
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
    const startWrapProps = {
      modelValue: form[fieldName][0],
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = [val ?? undefined, form[fieldName][1]];
      },
    };
    const endWrapProps = {
      modelValue: form[fieldName][1],
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = [form[fieldName][0], val ?? undefined];
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
        <div>
          <el-time-select
            {...startWrapProps}
            start={startTime}
            end={endTime}
            step={stepTime}
            maxTime={form[fieldName][1]}
            placeholder={!disabled ? placeholder[0] ?? t('qm.form.timerangePlaceholder.0') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled || startDisabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(): void => onChange(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-time-select
            {...endWrapProps}
            start={startTime}
            end={endTime}
            step={stepTime}
            minTime={form[fieldName][0]}
            placeholder={!disabled ? placeholder[1] ?? t('qm.form.timerangePlaceholder.1') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled || endDisabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(): void => onChange(form[fieldName])}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
