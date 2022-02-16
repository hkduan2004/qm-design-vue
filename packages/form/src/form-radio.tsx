/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:18:21
 */
import { defineComponent } from 'vue';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormRadio',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const { type, label, fieldName, labelWidth, labelOptions, descOptions, options = {}, style = {}, disabled, onChange = noop } = this.option;
    const { itemList = [] } = options;
    this.$$form.setViewValue(fieldName, itemList.find((x) => x.value === form[fieldName])?.text);
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
        <el-radio-group v-model={form[fieldName]} disabled={disabled} style={{ ...style }} onChange={onChange}>
          {itemList.map((x) => (
            <el-radio key={x.value} label={x.value} disabled={x.disabled}>
              {x.text}
            </el-radio>
          ))}
        </el-radio-group>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
