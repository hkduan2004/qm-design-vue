/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:16:03
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import { DEFAULT_TRUE_VALUE, DEFAULT_FALSE_VALUE } from './types';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormSwitch',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const { t } = useLocale();
    const { type, label, fieldName, labelWidth, labelOptions, descOptions, options = {}, style = {}, disabled, onChange = noop } = this.option;
    const { trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE } = options;
    this.$$form.setViewValue(fieldName, form[fieldName] === trueValue ? t('qm.form.trueText') : t('qm.form.falseText'));
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
        <div style={{ position: 'relative', top: '-1px', ...style }}>
          <el-switch v-model={form[fieldName]} disabled={disabled} activeValue={trueValue} inactiveValue={falseValue} onChange={onChange} />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
