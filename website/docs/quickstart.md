## 快速上手

:::tip
推荐使用 qm-vue-cli 脚手架，架构中已经集成了 qm-design-vue 组件库。
:::

### 引入 QmDesign

在 main.js 中写入以下内容：

```javascript
import { createApp } from 'vue';
import QmDesign from '@jiaozhiye/qm-design-vue';
import '@jiaozhiye/qm-design-vue/lib/style/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(QmDesign);
app.mount('#app');
```

### 全局配置

在引入 QmDesign 时，可以传入两个参数：

- 第一个是全局配置对象，该对象目前支持 `size` 与 `zIndex` 字段
- 第一个是全局默认参数

```javascript
import { createApp } from 'vue';
import QmDesign from '@jiaozhiye/qm-design-vue';
import '@jiaozhiye/qm-design-vue/lib/style/index.css';

import App from './App.vue';

const app = createApp(App);
app.use(
  QmDesign,
  { size: 'small', zIndex: 1000 },
  {
    dictKey: 'dict', // 本地存储数据字典的 key 值
    print: {
      leftLogo: require('../assets/img/logo_l.png'), // 打印单左侧 Logo
      rightLogo: require('../assets/img/logo_r.png'), // 打印单右侧 Logo
      // LODOP 授权码
      LODOP_LICENSES: [
        ['xxxx', 'xxxxxxxxxxxxxxxxx', 'xxxx', 'xxxxxxxxxxxxxxxxx'],
        ['xxxx', '', 'xxxx', 'xxxxxxxxxxxxxxxxx'],
      ],
    },
    table: {
      pagination: {
        pageSize: 20, // 每页显示条目个数
        pageSizeOptions: [10, 20, 30, 40, 50, 100], // 分页个数选择器设置
      },
      recordExportLog: async ({ fileName }) => {}, // 记录导出日志接口
    },
    form: {
      showLabelErrorColor: false, // 表单项 label 文本是否为警告色
    },
    tinymceScriptSrc: '/static/tinymce/tinymce.min.js', // tinymce(富文本编辑器) js 插件路径
    closeOnClickModal: true, // qm-drawer 和 qm-dialog 组件，点击遮罩层关闭
    autoInsertSpaceInButton: true, // 自动在两个中文字符之间插入空格
    getComponentConfigApi: async () => {}, // 获取服务端配置信息的接口
    saveComponentConfigApi: async () => {}, // 配置信息保存到服务端的接口
  }
);
```

### App 组件

在调用 `qm-config-provider` 组件时，需要传入两个参数：

- `size`：全局设置组件尺寸
- `locale`：设置组件多语言

```html
<qm-config-provider size="small" locale="zh-cn">
  <!-- 项目根组件 -->
  <App />
</qm-config-provider>
```
