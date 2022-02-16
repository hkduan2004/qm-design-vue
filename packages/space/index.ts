/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Space from './src/space.tsx';

Space.install = (app: App): void => {
  app.component(Space.name, Space);
};

const _Space: SFCWithInstall<typeof Space> = Space;

export default _Space;
