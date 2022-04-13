/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 11:04:33
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import TreeTableHelper from './src/tree-table-helper.tsx';

TreeTableHelper.install = (app: App): void => {
  app.component(TreeTableHelper.name, TreeTableHelper);
};

const _TreeTableHelper: SFCWithInstall<typeof TreeTableHelper> = TreeTableHelper;

export default _TreeTableHelper;
