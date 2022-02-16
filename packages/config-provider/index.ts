/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import ConfigProvider from './src/config-provider.tsx';

ConfigProvider.install = (app: App): void => {
  app.component(ConfigProvider.name, ConfigProvider);
};

const _ConfigProvider: SFCWithInstall<typeof ConfigProvider> = ConfigProvider;

export default _ConfigProvider;
