/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:17:30
 */
import { defineComponent, CSSProperties } from 'vue';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

import { ZoomInIcon, ZoomOutIcon, RotateLeftIcon, RotateRightIcon, UploadIcon } from '../../icons';
import Cropper from '../../cropper';
import Button from '../../button';

const PREVIEW_WIDTH: number = 400;
const IMG_MAX_WIDTH: number = 1920;

enum TYPE {
  jpg = 'image/jpeg',
  jpeg = 'image/jpeg',
  png = 'image/png',
}

export default defineComponent({
  name: 'CropperPreview',
  props: ['imgFile', 'fixedNumber', 'loading'],
  emits: ['upload', 'close'],
  computed: {
    previewSize(): CSSProperties {
      const [w, h] = this.fixedNumber;
      return {
        width: `${PREVIEW_WIDTH}px`,
        height: `calc(${PREVIEW_WIDTH}px * ${h / w || 1})`,
      };
    },
    fileType(): string {
      const { name } = this.imgFile;
      return name.slice(name.lastIndexOf('.') + 1).toLocaleLowerCase();
    },
  },
  methods: {
    scaleHandle(percent: number): void {
      this.$refs[`cropper`].relativeZoom(percent);
    },
    rotateHandle(deg: number): void {
      this.$refs[`cropper`].rotate(deg);
    },
    confirmHandle(): void {
      this.$refs[`cropper`]
        .getCroppedCanvas({
          maxWidth: IMG_MAX_WIDTH,
          fillColor: this.fileType === 'png' ? 'transparent' : '#fff',
          imageSmoothingEnabled: false,
          imageSmoothingQuality: 'high',
        })
        .toBlob((blob: Blob): void => {
          this.$emit('upload', blob);
        }, TYPE[this.fileType]);
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { imgFile, previewSize, fixedNumber, loading } = this;
    const [w, h] = fixedNumber;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('cropper-preview');
    const cls = {
      [prefixCls]: true,
    };
    return (
      <div>
        <div class={cls}>
          <div class="cropper-area">
            <div class="img-cropper">
              <Cropper ref="cropper" aspect-ratio={w / h} src={imgFile.url} drag-mode="move" preview=".preview" />
            </div>
            <div class="actions">
              <Button type="primary" icon={<ZoomInIcon />} onClick={() => this.scaleHandle(0.2)}>
                {t('qm.uploadCropper.zoomIn')}
              </Button>
              <Button type="primary" icon={<ZoomOutIcon />} onClick={() => this.scaleHandle(-0.2)}>
                {t('qm.uploadCropper.zoomOut')}
              </Button>
              <Button type="primary" icon={<RotateRightIcon />} onClick={() => this.rotateHandle(90)}>
                {t('qm.uploadCropper.rotatePlus')}
              </Button>
              <Button type="primary" icon={<RotateLeftIcon />} onClick={() => this.rotateHandle(-90)}>
                {t('qm.uploadCropper.rotateSubtract')}
              </Button>
            </div>
          </div>
          <div class="preview-area">
            <div class="preview" style={previewSize} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={() => this.cancelHandle()}>{t('qm.dialog.close')}</Button>
          <Button type="primary" icon={<UploadIcon />} loading={loading} onClick={() => this.confirmHandle()}>
            {t('qm.uploadCropper.text')}
          </Button>
        </div>
      </div>
    );
  },
});
