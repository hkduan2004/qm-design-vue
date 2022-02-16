/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Download from './src/download.tsx';

Download.install = (app: App): void => {
  app.component(Download.name, Download);
};

const _Download: SFCWithInstall<typeof Download> = Download;

export default _Download;
