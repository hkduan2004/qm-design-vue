## 更新日志

`qm-design` 严格遵循 Semantic Versioning 2.0.0 语义化版本规范。

### 1.2.0-beta.11

2022-01-28

- 🎉 [Anchor] 新增了 `SCROLL_TO_ITEM` 方法
- 🌟 修复了组件 bug

### 1.2.0-beta.10

2022-01-15

- 🎉 优化了 [Dialog] 组件
- 🎉 优化了 [UploadCropper] 组件
- 🌟 修复了组件 bug

### 1.2.0-beta.9

2022-01-10

- 🎉 优化了 [Table] 组件
- 🌟 修复了组件 bug

### 1.2.0-beta.7

2021-12-21

- 🎉 [Table] 新增了 `scrollPagination` 参数，实现了底部加载分页
- 🎉 [Table] 新增了 `scrollEnd` 事件
- 🎉 [Spin] 新增了 `mode` 参数，支持了多种 loading 形式
- 🌟 重写了拼音功能模块

### 1.2.0-beta.6

2021-12-13

- 🎉 优化了 [Table] 组件
- 🌟 Vue 升级到了 3.2.26 版本

### 1.2.0-beta.5

2021-12-07

- 🎉 优化了 [Form] 组件
- 🌟 Vue 升级到了 3.2.24 版本

### 1.2.0-beta.4

2021-12-06

- 🎉 [ConfigProvider] 新增了 `theme` 参数
- 🎉 优化了自定义主题的实现

### 1.2.0-beta.1

2021-12-01

- 🎉 优化了 [Table] 组件
- 🎉 优化了 [Form] 组件
- 🌟 Vue 升级到了 3.2.23 版本

### 1.1.0-beta.54

2021-11-20

- 🎉 优化了 [Button] 组件
- 🎉 优化了 [Table] 组件
- 🎉 优化了 [ConfigProvider] 组件
- 🌟 Vue 升级到了 3.2.22 版本

### 1.1.0-beta.45

2021-11-13

- 🎉 [Form] 组件新增了 `authConfig` 参数，可实现表单字段的权限控制
- 🌟 优化了 [Table] 组件
- 🌟 优化了 [Form] 组件
- 🌟 优化了 [Space] 组件

### 1.1.0-beta.40

2021-11-08

- 🎉 [Split] 组件新增了 `uniqueKey` 参数
- 🎉 [SplitPane] 组件新增了 `min` 参数
- 🌟 [Button] 组件 `icon` 参数类型更改为 Component
- 🌟 移除了字体图标，使用 `svg` 替换
- 🌟 Vue 升级到了 3.2.21 版本

### 1.1.0-beta.33

2021-10-28

- 🎉 [Table] 组件新增了 `footRender` 参数，可实现表格底部自定义渲染
- 🎉 [Table] 组件新增了 `headRender` 参数，可实现表格头部可编辑功能

### 1.1.0-beta.30

2021-10-20

- 🎉 优化了 [Print] 组件
- 🌟 新增了 `LODOP_LICENSES` 全局配置参数

### 1.1.0-beta.12

2021-09-15

- 🎉 [Form] 组件新增了 `toFinance` 参数，用于数值类型输入框自动转成金融格式

### 1.1.0-beta.10

2021-09-13

- 🎉 [Form] 组件 `searchHelper` 配置项，新增了 `uniqueKey` 参数
- 🌟 Vue 升级到了 3.2.11 版本

### 1.1.0-beta.1

2021-09-08

- 🎉 整体优化了组件库
- 🌟 Vue 升级到了 3.2.10 版本
- 🐞 [Form] 组件的 request 参数 `datakey` 替换成了 `dataKey`

### 1.0.0-beta.55

2021-08-16

- 🎉 [Table] 组件导出功能，新增了列定义调整

### 1.0.0-beta.41

2021-07-29

- 🎉 新增了 [ConfigProvider] 组件，可用于设置国际化和组件尺寸
- 🌟 优化了基础组件

### 1.0.0-beta.24

2021-02-29

- 🌟 [Drawer] 新增了 START_LOADING、STOP_LOADING 方法
- 🌟 [Dialog] 新增了 START_LOADING、STOP_LOADING 方法

### 1.0.0-beta.23

2021-02-28

- 🌟 [Table] 重构并优化了表格组件虚拟滚动算法
- 🌟 [Table] 表格分组小计 + 虚拟滚动，支持了单元格合并
- 🐞 修复组件 bug

### 1.0.0-beta.21

2021-02-24

- 🎉 [Table] 行选择新增了 fetchSelectedRows 参数，用于从服务端获取要回显的数据列表
- 🎉 [Table] 行选择新增了 fetchAllRowKeys 参数，用于从服务端获取所有行数据 rowKey 的列表
- 🎉 [Form] 新增了 SET_INITIAL_VALUE 方法，设置表单的初始值，用于异步获取初始值的情况
- 🌟 vue 升级到了 3.1.2
- 🐞 修复组件 bug

### 1.0.0-beta.17

2021-02-22

- 🎉 [Table] 底部合计支持了单独接口获取服务端数据
- 🎉 [Table] 后台分页 + 列复选，支持了从服务端获取数据行进行复选框的回显
- 🎉 [Table] 分组小计支持忽略数据行
- 🌟 [Table] 服务端合计的变更：1. 合计值需放在 `summation` 属性中; 2. column.summation.dataKey 设置时无需包含 `summation`

### 1.0.0-beta.14

2021-02-18

- 🐞 修复组件 bug
