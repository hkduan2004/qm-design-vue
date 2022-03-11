/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 19:55:27
 */
import { defineComponent, PropType } from 'vue';
import { useLocale } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

import { UploadIcon } from '../../icons';
import Dialog from '../../dialog';
import Button from '../../button';
import UploadCropper from '../../upload-cropper';

export default defineComponent({
  name: 'UploadImg',
  emits: ['success'],
  props: ['actionUrl', 'headers', 'fixedSize', 'onSuccess'],
  data() {
    return {
      visible: false,
      fileList: [],
    };
  },
  methods: {
    handleSubmit(): void {
      this.$emit('success', this.fileList);
      this.visible = false;
    },
    handleSuccess(val): void {
      this.fileList = val;
    },
  },
  render(): JSXNode {
    const { visible, actionUrl, headers = {}, fixedSize } = this;
    const { t } = useLocale();
    const wrapProps = {
      visible,
      title: t('qm.uploadCropper.text'),
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val) => {
        this.visible = val;
      },
    };
    return (
      <>
        <Button
          class="editor-upload-btn"
          icon={<UploadIcon />}
          size="small"
          type="primary"
          onClick={() => {
            this.visible = true;
          }}
        >
          {t('qm.uploadCropper.text')}
        </Button>
        <Dialog {...wrapProps}>
          <UploadCropper action-url={actionUrl} headers={headers} fixed-size={fixedSize} limit={20} is-calc-height onChange={this.handleSuccess} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 9,
              borderTop: '1px solid #e9e9e9',
              padding: '10px 15px',
              background: '#fff',
              textAlign: 'right',
            }}
          >
            <Button type="primary" onClick={this.handleSubmit}>
              {t('qm.dialog.close')}
            </Button>
            <Button onClick={() => (this.visible = !1)}>{t('qm.dialog.confirm')}</Button>
          </div>
        </Dialog>
      </>
    );
  },
});
