/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:38
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormRangeInput',
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
      placeholder = [],
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
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
          <el-input
            v-model={form[fieldName][0]}
            placeholder={!disabled ? placeholder[0] ?? t('qm.form.rangeInputNumberPlaceholder.0') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(val: string): void => {
              val = val.trim();
              form[fieldName][0] = val;
              onChange(form[fieldName]);
            }}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-input
            v-model={form[fieldName][1]}
            placeholder={!disabled ? placeholder[1] ?? t('qm.form.rangeInputNumberPlaceholder.1') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(val: string): void => {
              val = val.trim();
              form[fieldName][1] = val;
              onChange(form[fieldName]);
            }}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
