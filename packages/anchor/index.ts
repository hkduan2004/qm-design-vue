/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-20 14:09:13
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Anchor from './src/anchor.tsx';

Anchor.install = (app: App): void => {
  app.component(Anchor.name, Anchor);
};

const _Anchor: SFCWithInstall<typeof Anchor> = Anchor;

export default _Anchor;
