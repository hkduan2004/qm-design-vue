/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 14:02:58
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { useLocale } from '../../../hooks';
import { QmMessage } from '../../../index';

import type { JSXNode } from '../../../_utils/types';

import Button from '../../../button';

// 导入
let fileForm: any;
let fileInput: any;

const prefixCls = getPrefixCls('table');

const parseFile = (file: File) => {
  const name = file.name;
  const tIndex = name.lastIndexOf('.');
  const type = name.substring(tIndex + 1, name.length);
  const filename = name.substring(0, tIndex);
  return { filename, type };
};

const readLocalFile = (options): Promise<File> => {
  const opts = Object.assign({}, options);
  // dom 操作
  if (!fileForm) {
    fileForm = document.createElement('form');
    fileInput = document.createElement('input');
    fileForm.className = `${prefixCls}--file-form`;
    fileInput.name = 'file';
    fileInput.type = 'file';
    fileForm.appendChild(fileInput);
    document.body.appendChild(fileForm);
  }

  return new Promise((resolve, reject) => {
    const isAllType = !opts.type;
    fileInput.multiple = !!opts.multiple;
    fileInput.accept = isAllType ? '' : `.${opts.type}`;
    fileInput.onchange = (ev) => {
      const { files } = ev.target;
      const file = files[0];
      let errType = '';
      if (!isAllType) {
        for (let fIndex = 0; fIndex < files.length; fIndex++) {
          const { type } = parseFile(files[fIndex]);
          if (opts.type !== type) {
            errType = type;
            break;
          }
        }
      }
      if (!errType) {
        resolve(file);
      } else {
        QmMessage.warning(t('qm.upload.notType', { type: errType }));
        reject();
      }
      document.body.removeChild(fileForm);
      fileForm = null;
      fileInput = null;
    };
    fileForm.reset();
    fileInput.click();
  });
};

export default defineComponent({
  name: 'SelectFile',
  inject: ['$$table'],
  emits: ['change'],
  props: ['fileType', 'multiple', 'onChange'],
  data() {
    return {};
  },
  methods: {
    async clickHandle() {
      try {
        const file = await readLocalFile({ type: this.fileType });
        this.$emit('change', file.name, file);
      } catch (err) {
        // ...
      }
    },
  },
  render(): JSXNode {
    const { t } = useLocale();
    return <Button onClick={this.clickHandle}>{t('qm.upload.text')}</Button>;
  },
});
