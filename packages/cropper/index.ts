/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-03 12:18:08
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Cropper from './src/cropper.tsx';

Cropper.install = (app: App): void => {
  app.component(Cropper.name, Cropper);
};

const _Cropper: SFCWithInstall<typeof Cropper> = Cropper;

export default _Cropper;
