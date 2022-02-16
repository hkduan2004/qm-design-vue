/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-03 08:22:17
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import PrintItem from '../print/src/print-item.tsx';

PrintItem.install = (app: App): void => {
  app.component(PrintItem.name, PrintItem);
};

const _PrintItem: SFCWithInstall<typeof PrintItem> = PrintItem;

export default _PrintItem;
