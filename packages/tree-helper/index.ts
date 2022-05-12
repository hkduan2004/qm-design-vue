/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 11:04:33
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import TreeHelper from './src/tree-helper.tsx';

TreeHelper.install = (app: App): void => {
  app.component(TreeHelper.name, TreeHelper);
};

const _TreeHelper: SFCWithInstall<typeof TreeHelper> = TreeHelper;

export default _TreeHelper;
