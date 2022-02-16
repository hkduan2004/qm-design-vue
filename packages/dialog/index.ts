/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 18:02:25
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Dialog from './src/dialog.tsx';

Dialog.install = (app: App): void => {
  app.component(Dialog.name, Dialog);
};

const _Dialog: SFCWithInstall<typeof Dialog> = Dialog;

export default _Dialog;
