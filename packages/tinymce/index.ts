/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 19:55:13
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Tinymce from './src/index.tsx';

Tinymce.install = (app: App): void => {
  app.component(Tinymce.name, Tinymce);
};

const _Tinymce: SFCWithInstall<typeof Tinymce> = Tinymce;

export default _Tinymce;
