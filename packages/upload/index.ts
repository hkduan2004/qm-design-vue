/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-28 10:13:30
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Upload from './src/upload.tsx';

Upload.install = (app: App): void => {
  app.component(Upload.name, Upload);
};

const _Upload: SFCWithInstall<typeof Upload> = Upload;

export default _Upload;
