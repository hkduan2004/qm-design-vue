/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-28 10:13:30
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import UploadCropper from './src/upload-cropper.tsx';

UploadCropper.install = (app: App): void => {
  app.component(UploadCropper.name, UploadCropper);
};

const _UploadCropper: SFCWithInstall<typeof UploadCropper> = UploadCropper;

export default _UploadCropper;
