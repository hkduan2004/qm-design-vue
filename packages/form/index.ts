/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 08:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 14:26:39
 */
import { App } from 'vue';
import { SFCWithInstall } from '../_utils/types';
import Form from './src/form.tsx';

Form.install = (app: App): void => {
  app.component(Form.name, Form);
};

const _Form: SFCWithInstall<typeof Form> = Form;

export default _Form;
