/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 16:17:41
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Divider from './src/divider.tsx';

Divider.install = (app: App): void => {
  app.component(Divider.name, Divider);
};

const _Divider: SFCWithInstall<typeof Divider> = Divider;

export default _Divider;
