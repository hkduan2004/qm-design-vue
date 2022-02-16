/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-09-12 21:46:42
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Empty from './src/empty.tsx';

Empty.install = (app: App): void => {
  app.component(Empty.name, Empty);
};

const _Empty: SFCWithInstall<typeof Empty> = Empty;

export default _Empty;
