## Empty 空状态

用于空状态时的占位提示。

### Empty

:::demo

```html
<template>
  <qm-empty />
</template>

<script>
  export default {
    data() {
      return {};
    },
  };
</script>
```

:::

### 参数

| 参数           | 说明                | 类型                      | 默认值      |
| -------------- | ------------------- | ------------------------- | ----------- |
| size           | 尺寸                | large \| default \| small | -           |
| description    | 自定义描述文字      | string                    | 暂无数据... |
| containerStyle | 外层容器的 css 样式 | styleObject               | -           |
