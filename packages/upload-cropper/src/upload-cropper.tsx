/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 22:38:33
 */
import { defineComponent, PropType } from 'vue';
import axios from 'axios';
import PropTypes from '../../_utils/vue-types';
import { QmMessage, QmMessageBox } from '../../index';
import { useSize, useLocale } from '../../hooks';
import { localeMixin } from '../../mixins';
import { download } from '../../_utils/download';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import { stop } from '../../_utils/dom';
import { warn } from '../../_utils/error';
import type { JSXNode, ComponentSize } from '../../_utils/types';

import { ZoomInIcon, DeleteIcon, DownloadIcon, UploadIcon } from '../../icons';
import CropperPreview from './cropper-preview';
import Dialog from '../../dialog';

type IFile = {
  name: string;
  url: string;
};

export default defineComponent({
  name: 'QmUploadCropper',
  componentName: 'QmUploadCropper',
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
    remove: PropTypes.shape({
      api: PropTypes.func.isRequired,
      params: PropTypes.object,
      callback: PropTypes.func,
    }),
    isCalcHeight: PropTypes.bool.def(true),
    fixedSize: PropTypes.array.def([1.5, 1]),
    titles: PropTypes.array.def([]),
    limit: PropTypes.number.def(1),
    fileSize: PropTypes.number,
    fileTypes: PropTypes.array.def(['jpg', 'png', 'bmp']),
    headers: PropTypes.object.def({}),
    params: PropTypes.object.def({}),
    disabled: PropTypes.bool,
  },
  data() {
    Object.assign(this, {
      fileData: null, // 文件裁剪之后的 blob
      uid: '',
      width: 146,
      dialogImageUrl: '',
    });
    return {
      file: null, // 当前被选择的图片文件
      fileList: this.initialValue,
      previewVisible: false,
      cropperVisible: false,
      loading: false,
    };
  },
  computed: {
    calcHeight(): number {
      const calcWidth: number = (this.width * this.fixedSize[1]) / this.fixedSize[0];
      return this.isCalcHeight && this.fixedSize.length === 2 ? Number.parseInt(calcWidth.toString()) : this.width;
    },
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
  mounted() {
    this.setUploadWrapHeight();
  },
  methods: {
    handlePreview(index: number): void {
      this.dialogImageUrl = this.fileList[index].url;
      this.previewVisible = true;
    },
    async handleRemove(index: number): Promise<void> {
      if (this.remove?.api) {
        try {
          await QmMessageBox.confirm(this.$t('qm.button.confirmTitle'), this.$t('qm.button.confirmPrompt'), { type: 'warning' });
          const res = await this.remove.api({ ...this.fileList[index], ...this.remove.params });
          if (res.code === 200) {
            this.fileList.splice(index, 1);
            this.remove.callback?.();
          }
        } catch (err) {}
      } else {
        this.fileList.splice(index, 1);
      }
    },
    changeHandler(file, files): void {
      if (this.uid === file.uid) return;
      this.uid = file.uid;
      this.file = file;
      if (!this.fileSize) {
        this.cropperVisible = true;
      } else {
        this.doUpload();
      }
    },
    uploadHandler(data: Blob): void {
      this.fileData = data;
      this.loading = true;
      this.doUpload();
    },
    closeHandler(): void {
      this.clearFiles();
      this.removeFile(this.file);
    },
    removeFile(file): void {
      this.uid = '';
      this.fileData = null;
      this.$refs[`upload`].handleRemove(file);
    },
    clearFiles(): void {
      this.$refs[`upload`].clearFiles();
    },
    doUpload(): void {
      this.$refs[`upload`].submit();
    },
    beforeUpload(file): boolean {
      if (!this.fileSize) {
        return true;
      }
      const isLt5M = file.size / 1024 / 1024 < this.fileSize;
      if (!isLt5M) {
        QmMessage.warning(this.$t('qm.uploadFile.sizeLimit', { size: this.fileSize }));
      }
      return isLt5M;
    },
    async upload(options): Promise<void> {
      const { params, headers } = this.$props;
      const formData = new FormData();
      // Blob
      const blob: Blob = this.fileData ? this.fileData : this.file.raw;
      // 有的后台需要传文件名，不然会报错
      formData.append('file', blob, this.file.name);
      // 处理请求的额外参数
      for (let key in params) {
        formData.append(key, params[key]);
      }
      if (!this.actionUrl) {
        return warn('qm-upload-cropper', `配置项 actionUrl 是必要参数`);
      }
      try {
        const { data: res } = await axios.post(this.actionUrl, formData, { headers });
        if (res.code === 200) {
          this.fileList.push({ name: this.file.name, url: res.data || '' });
          this.$emit('success', res.data);
        } else {
          this.clearFiles();
          this.$message.error(res.msg);
        }
      } catch (err) {
        this.clearFiles();
        this.$emit('error', err);
        QmMessage.error(this.$t('qm.uploadCropper.uploadError'));
      }
      this.cropperVisible = false;
      this.loading = false;
    },
    setUploadWrapHeight(): void {
      const $upload = this.$refs[`upload`].$el.querySelector('.el-upload');
      if ($upload) {
        $upload.style.height = `${this.calcHeight}px`;
      }
    },
    async downloadHandle(index): Promise<void> {
      try {
        await this.downloadFile(this.fileList[index]);
      } catch (err) {
        QmMessage.error(this.$t('qm.uploadCropper.downError'));
      }
    },
    // 获取服务端文件 to blob
    async downLoadByUrl(url, params = {}): Promise<Blob> {
      const res = await axios({ url, params, headers: this.headers, responseType: 'blob' });
      return res.data;
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
    renderPictureCard(): JSXNode {
      const { disabled, calcHeight, fileList, titles } = this;
      return (
        <ul class="el-upload-list el-upload-list--picture-card">
          {fileList.map((item, index) => (
            <li key={index} class="el-upload-list__item" style={{ height: `${calcHeight}px` }} onClick={(ev: MouseEvent): void => stop(ev)}>
              <div>
                <img class="el-upload-list__item-thumbnail" src={item.url} alt="" />
                {titles[index] && <h5 class="el-upload-list__item-title">{titles[index]}</h5>}
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-dot">
                    <i class="svgicon" onClick={() => this.handlePreview(index)}>
                      <ZoomInIcon />
                    </i>
                  </span>
                  {!disabled && (
                    <span class="el-upload-list__item-dot">
                      <i class="svgicon" onClick={() => this.handleRemove(index)}>
                        <DeleteIcon />
                      </i>
                    </span>
                  )}
                  <span class="el-upload-list__item-dot">
                    <i class="svgicon" onClick={() => this.downloadHandle(index)}>
                      <DownloadIcon />
                    </i>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      );
    },
  },
  render(): JSXNode {
    const { limit, disabled, file, fixedSize, fileList, fileTypes, dialogImageUrl } = this;
    const { $size } = useSize(this.$props);
    const { t } = useLocale();
    const prefixCls = getPrefixCls('upload-cropper');
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };
    const uploadProps = {
      action: '#',
      listType: 'picture-card',
      accept: 'image/jpg, image/jpeg, image/png, image/bmp',
      limit,
      drag: true,
      multiple: false,
      autoUpload: false,
      showFileList: false,
      disabled,
      style: { display: fileList.length !== limit ? 'block' : 'none' },
      httpRequest: this.upload,
      beforeUpload: this.beforeUpload,
      onChange: this.changeHandler,
    };
    const previewDialogProps = {
      visible: this.previewVisible,
      title: t('qm.uploadCropper.preview'),
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.previewVisible = val;
      },
    };
    const cropperDialogProps = {
      visible: this.cropperVisible,
      title: t('qm.uploadCropper.cropper'),
      width: '850px',
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.cropperVisible = val;
      },
      onClosed: this.closeHandler,
    };
    const cropperProps = {
      imgFile: file,
      fixedNumber: fixedSize,
      loading: this.loading,
      onUpload: this.uploadHandler,
      onClose: (val: boolean): void => {
        this.cropperVisible = val;
      },
    };
    return (
      <div class={cls}>
        {this.renderPictureCard()}
        <el-upload
          ref="upload"
          {...uploadProps}
          v-slots={{
            default: (): JSXNode => (
              <>
                <i class="svgicon" style={{ marginTop: 0 }}>
                  <UploadIcon />
                </i>
                <div class="el-upload__text">
                  {t('qm.uploadCropper.dragableText')} <em>{t('qm.upload.text')}</em>
                </div>
              </>
            ),
            tip: (): JSXNode => <div class="el-upload__tip">{t('qm.uploadCropper.tooltip', { type: fileTypes.join(',') })}</div>,
          }}
        />
        <Dialog {...previewDialogProps}>
          <div class={`${prefixCls}__preview`}>
            <img src={dialogImageUrl} alt="" />
          </div>
        </Dialog>
        <Dialog {...cropperDialogProps}>
          <CropperPreview {...cropperProps} />
        </Dialog>
      </div>
    );
  },
});
