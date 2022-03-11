/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:56:27
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { isNumber } from '../../_utils/util';
import { useSize, useGlobalConfig } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import type { ComponentSize, JSXNode } from '../../_utils/types';

import { Editor } from './components/Editor';
import UploadImg from './upload-img';

export default defineComponent({
  name: 'QmTinymce',
  componentName: 'QmTinymce',
  inheritAttrs: false,
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: PropTypes.string,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 400,
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    upload: PropTypes.shape({
      actionUrl: PropTypes.string.isRequired,
      headers: PropTypes.object.def({}),
      fixedSize: PropTypes.array.def([5, 4]),
    }).loose,
    tinymceScriptSrc: PropTypes.string,
    disabled: PropTypes.bool,
    plugins: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).def('lists image link media table textcolor wordcount contextmenu fullscreen'),
    toolbar: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).def(
      'undo redo |  formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists link unlink image media table | removeformat | fullscreen'
    ),
  },
  data() {
    return {
      content: this.modelValue,
      initial: {
        height: this.height,
        plugins: this.plugins,
        toolbar: this.toolbar,
        language: 'zh_CN',
        menubar: false,
        images_upload_handler: (blobInfo, success, failure): void => {
          let formData: FormData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());
          let img = `data:image/jpeg;base64,${blobInfo.base64()}`;
          success(img);
        },
      },
    };
  },
  watch: {
    modelValue(val: string): void {
      if (val === this.content) return;
      this.content = val;
    },
  },
  methods: {
    successHandle(arr: any[]): void {
      arr.forEach((v) => {
        this.content += `<img class="wscnph" src="${v.url}" alt="" />`;
      });
    },
  },
  render(): JSXNode {
    const { initial, content, disabled, tinymceScriptSrc, upload = {} } = this;
    const prefixCls = getPrefixCls('tinymce');
    const { $size } = useSize(this.$props);
    const { global } = useGlobalConfig();
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };
    const wrapProps = {
      init: initial,
      modelValue: content,
      disabled,
      tinymceScriptSrc: tinymceScriptSrc || global?.tinymceScriptSrc || undefined,
      'onUpdate:modelValue': (val: string): void => {
        this.content = val;
        this.$emit('update:modelValue', val);
      },
      onChange: (ev, target): void => {
        this.$emit('change', target.getContent());
      },
    };
    return (
      <div class={cls}>
        <Editor {...wrapProps} />
        {upload.actionUrl && (
          <UploadImg action-url={upload.actionUrl} headers={upload.headers} fixed-size={upload.fixedSize} onSuccess={this.successHandle} />
        )}
      </div>
    );
  },
});
