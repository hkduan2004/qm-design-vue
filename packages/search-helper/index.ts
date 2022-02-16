/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 11:04:33
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import SearchHelper from './src/search-helper.tsx';

SearchHelper.install = (app: App): void => {
  app.component(SearchHelper.name, SearchHelper);
};

const _SearchHelper: SFCWithInstall<typeof SearchHelper> = SearchHelper;

export default _SearchHelper;
