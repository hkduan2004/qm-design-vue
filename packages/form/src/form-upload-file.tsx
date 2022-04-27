/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-27 20:15:05
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

import UploadFile from '../../upload';

export default defineComponent({
  name: 'FormUploadFile',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const { t } = useLocale();
    const { type, label, fieldName, labelWidth, labelOptions, descOptions, upload = {}, style = {}, disabled, onChange = noop } = this.option;
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
        <UploadFile
          actionUrl={upload.actionUrl}
          dataKey={upload.dataKey}
          headers={upload.headers}
          initialValue={form[fieldName]}
          fileTypes={upload.fileTypes}
          fileSize={upload.fileSize}
          limit={upload.limit || 1}
          params={upload.params}
          disabled={disabled}
          style={{ ...style }}
          onChange={(val): void => {
            form[fieldName] = val;
            this.$$form.formItemValidate(fieldName);
            onChange(val);
          }}
        >
          {t('qm.upload.text')}
        </UploadFile>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
