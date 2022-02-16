/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-03 08:21:37
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import PrintGroup from '../print/src/print-group.tsx';

PrintGroup.install = (app: App): void => {
  app.component(PrintGroup.name, PrintGroup);
};

const _PrintGroup: SFCWithInstall<typeof PrintGroup> = PrintGroup;

export default _PrintGroup;
