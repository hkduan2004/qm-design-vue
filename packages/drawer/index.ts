/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 11:34:44
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Drawer from './src/drawer.tsx';

Drawer.install = (app: App): void => {
  app.component(Drawer.name, Drawer);
};

const _Button: SFCWithInstall<typeof Drawer> = Drawer;

export default _Button;
