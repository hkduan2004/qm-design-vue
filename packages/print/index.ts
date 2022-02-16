/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-01 14:57:42
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Print from './src/print.tsx';

Print.install = (app: App): void => {
  app.component(Print.name, Print);
};

const _Print: SFCWithInstall<typeof Print> = Print;

export default _Print;
