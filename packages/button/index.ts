/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-09 11:03:09
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Button from './src/button.tsx';

Button.install = (app: App): void => {
  app.component(Button.name, Button);
};

const _Button: SFCWithInstall<typeof Button> = Button;

export default _Button;
