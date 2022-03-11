/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 23:17:37
 */
import { defineComponent, PropType, Component } from 'vue';
import axios from 'axios';
import PropTypes from '../../_utils/vue-types';
import { QmMessage } from '../../index';
import { useSize, useLocale } from '../../hooks';
import { localeMixin } from '../../mixins';
import { download } from '../../_utils/download';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, ComponentSize, Nullable } from '../../_utils/types';

import { DownloadIcon } from '../../icons';
import Button from '../../button';

type IFile = {
  name: string;
  url: string;
};

export default defineComponent({
  name: 'QmUpload',
  componentName: 'QmUpload',
  inheritAttrs: false,
  mixins: [localeMixin],
  emits: ['change', 'success', 'error'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    actionUrl: PropTypes.string.isRequired,
    initialValue: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
      }).loose
    ).def([]),
    fileTypes: PropTypes.array.def(['jpg', 'png', 'bmp', 'pdf', 'xls', 'xlsx']),
    isOnlyButton: PropTypes.bool,
    limit: PropTypes.number.def(1),
    fileSize: PropTypes.number.def(5),
    headers: PropTypes.object.def({}),
    params: PropTypes.object.def({}),
    type: PropTypes.string,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: {
      type: Object as PropType<Component>,
    },
  },
  data() {
    return {
      fileList: this.initialValue as Array<IFile>,
      loading: false,
    };
  },
  watch: {
    initialValue(val: Array<IFile>): void {
      this.fileList = val;
    },
    fileList(val: Array<IFile>): void {
      this.$emit('change', val);
      if (val.length === this.limit) {
        // 待测试
        this.$parent.clearValidate && this.$parent.clearValidate();
      }
    },
  },
  methods: {
    beforeUploadHandle(file): boolean {
      const isType = this.fileTypes.length ? this.fileTypes.includes(file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()) : !0;
      const isLt5M = file.size / 1024 / 1024 < this.fileSize;
      const result = isType && isLt5M;
      if (!isType) {
        QmMessage.warning(this.$t('qm.upload.tooltip', { type: this.fileTypes.join(',') }));
      }
      if (!isLt5M) {
        QmMessage.warning(this.$t('qm.upload.sizeLimit', { size: this.fileSize }));
      }
      if (result) {
        this.startLoading();
      }
      return result;
    },
    removeFileHandle(file, fileList): void {
      this.fileList = fileList;
    },
    clearFiles(): void {
      this.$refs[`upload`].clearFiles();
    },
    successHandle(res, file, fileList): void {
      if (res.code === 200) {
        this.fileList = [...this.fileList, { name: file.name, url: res.data || '' }];
        this.$emit('success', res.data);
      } else {
        this.clearFiles();
        QmMessage.error(res.msg);
      }
      if (this.isOnlyButton) {
        this.clearFiles();
      }
      this.stopLoading();
    },
    errorHandle(err): void {
      this.$emit('error', err);
      QmMessage.error(this.$t('qm.upload.uploadError'));
      this.stopLoading();
    },
    async previewFileHandle(file): Promise<void> {
      try {
        await this.downloadFile(file);
      } catch (err) {
        QmMessage.error(this.$t('qm.upload.downError'));
      }
    },
    // 获取服务端文件 to blob
    async downLoadByUrl(url, params = {}): Promise<Blob> {
      const { data: blob } = await axios({
        url,
        params,
        headers: this.headers,
        responseType: 'blob',
      });
      return blob;
    },
    // 执行下载动作
    async downloadFile({ url, name }, params): Promise<void> {
      const blob: Blob = await this.downLoadByUrl(url, params);
      let fileName = url.slice(url.lastIndexOf('/') + 1);
      if (name) {
        let extendName = url.slice(url.lastIndexOf('.') + 1);
        fileName = `${name.slice(0, name.lastIndexOf('.') !== -1 ? name.lastIndexOf('.') : undefined)}.${extendName}`;
      }
      download(blob, fileName);
    },
    startLoading(): void {
      this.loading = true;
    },
    stopLoading(): void {
      this.loading = false;
    },
  },
  render(): JSXNode {
    const { fileTypes, fileList, fileSize, loading, type = 'primary', round, circle, icon = <DownloadIcon />, disabled, $props } = this;
    const { $size } = useSize(this.$props);
    const { t } = useLocale();
    const wrapProps = {
      ref: 'upload',
      action: $props.actionUrl,
      headers: $props.headers,
      data: $props.params,
      fileList,
      limit: $props.limit,
      showFileList: !$props.isOnlyButton,
      multiple: false,
      withCredentials: true,
      disabled: $props.disabled,
      onPreview: this.previewFileHandle,
      beforeUpload: this.beforeUploadHandle,
      onRemove: this.removeFileHandle,
      onSuccess: this.successHandle,
      onError: this.errorHandle,
    };
    const btnProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading,
      disabled,
    };
    return (
      <el-upload
        {...wrapProps}
        v-slots={{
          tip: (): Nullable<JSXNode> =>
            !$props.isOnlyButton ? (
              <div class="el-upload__tip" style="line-height: 1.5">
                {(fileTypes.length ? `${t('qm.upload.tooltip', { type: fileTypes.join(',') })}，` : '') +
                  `${t('qm.upload.sizeLimit', { size: fileSize })}`}
              </div>
            ) : null,
        }}
      >
        <Button {...btnProps}>{this.$slots.default?.()}</Button>
      </el-upload>
    );
  },
});
