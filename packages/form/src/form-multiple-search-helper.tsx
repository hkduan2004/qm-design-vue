/*
 * @Author: 焦质晔
 * @Date: 2022-03-12 11:36:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-13 11:03:06
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getPrefixCls } from '../../_utils/prefix';
import { getParserWidth } from '../../_utils/util';

import type { JSXNode } from '../../_utils/types';

import { SearchIcon } from '../../icons';

export default defineComponent({
  name: 'FormMultipleSearchHelper',
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

    const prefixCls = getPrefixCls('multiple-sh');

    const cls = {
      [prefixCls]: true,
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
        <div class="multiple-sh" style={{ ...style }}>
          <el-select
            class={cls}
            popper-class="select-option"
            multiple
            teleported={false}
            onDblclick={() => {
              console.log(2222);
            }}
            suffix-icon={<SearchIcon />}
          ></el-select>
          <span
            class="search-btn"
            onClick={() => {
              console.log(1234);
            }}
          />
        </div>

        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
