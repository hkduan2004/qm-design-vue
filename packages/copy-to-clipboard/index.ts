/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import CopyToClipboard from './src/copy-to-clipboard.tsx';

CopyToClipboard.install = (app: App): void => {
  app.component(CopyToClipboard.name, CopyToClipboard);
};

const _CopyToClipboard: SFCWithInstall<typeof CopyToClipboard> = CopyToClipboard;

export default _CopyToClipboard;
