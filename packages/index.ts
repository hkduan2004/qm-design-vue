/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 16:39:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 14:59:36
 */
import type { App } from 'vue';
import pinyin from './_utils/pinyin';

import Button from './button';
import Space from './space';
import Anchor from './anchor';
import AnchorItem from './anchor-item';
import Divider from './divider';
import Spin from './spin';
import Empty from './empty';
import Drawer from './drawer';
import Dialog from './dialog';
import Tabs from './tabs';
import TabPane from './tab-pane';
import Form from './form';
import Download from './download';
import Upload from './upload';
import UploadCropper from './upload-cropper';
import Print from './print';
import PrintGroup from './print-group';
import PrintItem from './print-item';
import Tinymce from './tinymce';
import Split from './split';
import SplitPane from './split-pane';
import Countup from './countup';
import Table from './table';
import SearchHelper from './search-helper';
import Cropper from './cropper';
import ConfigProvider from './config-provider';

import { setConfig } from './_utils/config';
import { setLocale, i18n } from './locale';
import { version } from './version';
import type { InstallOptions } from './_utils/config';
import type { ComponentSize, AnyObject } from './_utils/types';

// import ElementPlus
import ElementPlus from 'element-plus';
import { ElMessageBox as MessageBox, ElNotification as Notification, ElMessage as Message } from 'element-plus';

// 默认参数
const defaultInstallOpt: InstallOptions = {
  size: '' as ComponentSize,
  locale: 'zh-cn',
  zIndex: 1000,
};

// 组件列表
const components = [
  Button,
  Space,
  Anchor,
  AnchorItem,
  Divider,
  Spin,
  Empty,
  Drawer,
  Dialog,
  Tabs,
  TabPane,
  Form,
  Download,
  Upload,
  UploadCropper,
  Print,
  PrintGroup,
  PrintItem,
  Tinymce,
  Split,
  SplitPane,
  Countup,
  Table,
  SearchHelper,
  Cropper,
  ConfigProvider,
];

const install = (app: App, opt: InstallOptions, global: AnyObject<any> = {}): void => {
  // use ElementPlus
  app.use(ElementPlus, Object.assign({}, defaultInstallOpt, opt));

  // use QmDesign
  const option = Object.assign({}, defaultInstallOpt, opt, { global });
  if (option.i18n) {
    i18n(option.i18n);
  }
  setConfig(option);
  app.config.globalProperties.$DESIGN = option;
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

const locale = setLocale;

export {
  Button as QmButton,
  Space as QmSpace,
  Anchor as QmAnchor,
  AnchorItem as QmAnchorItem,
  Divider as QmDivider,
  Spin as QmSpin,
  Empty as QmEmpty,
  Drawer as QmDrawer,
  Dialog as QmDialog,
  Tabs as QmTabs,
  TabPane as QmTabPane,
  Form as QmForm,
  Download as QmDownload,
  Upload as QmUpload,
  UploadCropper as QmUploadCropper,
  Print as QmPrint,
  PrintGroup as QmPrintGroup,
  PrintItem as QmPrintItem,
  Tinymce as QmTinymce,
  Split as QmSplit,
  SplitPane as QmSplitPane,
  Countup as QmCountup,
  Table as QmTable,
  SearchHelper as QmSearchHelper,
  Cropper as QmCropper,
  ConfigProvider as QmConfigProvider,
  MessageBox as QmMessageBox,
  Notification as QmNotification,
  Message as QmMessage,
  version,
  install,
  locale,
};

export { pinyin };

export * from './directives';

export default {
  version,
  install,
  locale,
};
