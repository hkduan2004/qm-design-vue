## Icon 图标

语义化的矢量图形。使用图标组件，你需要安装 @ant-design/icons-vue 图标组件包：

:::tip
npm install --save @ant-design/icons-vue
:::

### 代码演示

以下 7 个常见图标，`qm-vue-cli` 脚手架已全局挂载，无需业务代码处理

```bash
  <qm-button type="primary" icon="PlusOutlined">新增</qm-button>
  <qm-button type="primary" icon="EditOutlined">编辑</qm-button>
  <qm-button type="primary" icon="SaveOutlined">保存</qm-button>
  <qm-button type="danger" icon="DeleteOutlined">删除</qm-button>
  <qm-button type="primary" icon="PrinterOutlined">打印</qm-button>
  <qm-button type="primary" icon="UploadOutlined">上传/导入</qm-button>
  <qm-button type="primary" icon="DownloadOutlined">下载/导出</qm-button>
```

### 图标列表

使用其他图标，请参考: https://ant.design/components/icon-cn/

```bash
<qm-button type="primary" :icon="SearchOutlined">查询</qm-button>

import { SearchOutlined } from '@/icons';

export default {
  data() {
    SearchOutlined
  }
}
```

`src/icons`

```javascript
export * from '@ant-design/icons-vue';
```
