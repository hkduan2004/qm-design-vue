/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-06 15:08:41
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Table from './src/table/index.tsx';

Table.install = (app: App): void => {
  app.component(Table.name, Table);
};

const _Table: SFCWithInstall<typeof Table> = Table;

export default _Table;
