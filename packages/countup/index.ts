/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-06 09:04:35
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Countup from './src/countup.tsx';

Countup.install = (app: App): void => {
  app.component(Countup.name, Countup);
};

const _Countup: SFCWithInstall<typeof Countup> = Countup;

export default _Countup;
