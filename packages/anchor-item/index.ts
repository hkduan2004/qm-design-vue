/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 09:00:01
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import AnchorItem from '../anchor/src/anchor-item.tsx';

AnchorItem.install = (app: App): void => {
  app.component(AnchorItem.name, AnchorItem);
};

const _AnchorItem: SFCWithInstall<typeof AnchorItem> = AnchorItem;

export default _AnchorItem;
