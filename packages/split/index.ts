/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import QmSplit from './src/split.tsx';

QmSplit.install = (app: App): void => {
  app.component(QmSplit.name, QmSplit);
};

const _QmSplit: SFCWithInstall<typeof QmSplit> = QmSplit;

export default _QmSplit;
