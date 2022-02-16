/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 09:05:52
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Spin from './src/spin.tsx';

Spin.install = (app: App): void => {
  app.component(Spin.name, Spin);
};

const _Spin: SFCWithInstall<typeof Spin> = Spin;

export default _Spin;
