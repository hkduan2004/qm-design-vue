/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-05 11:25:53
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import QmSplitPane from '../split/src/split-pane.tsx';

QmSplitPane.install = (app: App): void => {
  app.component(QmSplitPane.name, QmSplitPane);
};

const _QmSplitPane: SFCWithInstall<typeof QmSplitPane> = QmSplitPane;

export default _QmSplitPane;
