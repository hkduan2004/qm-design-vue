/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 12:16:39
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import TabPane from '../tabs/src/tab-pane.tsx';

TabPane.install = (app: App): void => {
  app.component(TabPane.name, TabPane);
};

const _TabPane: SFCWithInstall<typeof TabPane> = TabPane;

export default _TabPane;
