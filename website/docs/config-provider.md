## ConfigProvider 配置

ConfigProvider 用来提供全局的配置选项，用来配置 **国际化** 和 **尺寸**

### 基础用法

:::tip
注意：`size` 和 `locale` 是必要参数。
:::

```html
<template>
  <qm-config-provider size="small" locale="zh-cn">
    <!-- 项目根组件 -->
    <App />
  </qm-config-provider>
</template>

<script>
  export default {
    data() {},
  };
</script>
```

### 参数

| 参数   | 说明                     | 类型                            | 默认值 |
| ------ | ------------------------ | ------------------------------- | ------ |
| locale | 国际化设置               | zh-cn \| en                     | zh-cn  |
| size   | 组件尺寸                 | large \| default \| small \| '' | -      |
| theme  | 自定义主题，十六进制格式 | string                          | -      |
