/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:24:22
 */
import { defineComponent } from 'vue';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

import Tinymce from '../../tinymce';

export default defineComponent({
  name: 'FormTinymce',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      upload,
      style = {},
      disabled,
      onChange = noop,
    } = this.option;
    const { height } = options;

    this.$$form.setViewValue(fieldName, '');

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
        <Tinymce
          v-model={form[fieldName]}
          upload={upload}
          height={height}
          disabled={disabled}
          style={{ width: '100%', ...style }}
          onChange={(val: string): void => {
            onChange(val);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
