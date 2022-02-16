## Space 按钮

可设置组件之间的间距。

### Space

:::demo 通过 `containerStyle` 设置容器的边距

```html
<template>
  <qm-space :containerStyle="{marginLeft: '10px'}">
    <qm-button>按钮</qm-button>
    <qm-button>按钮</qm-button>
    <qm-button>按钮</qm-button>
    <qm-button>按钮</qm-button>
    <qm-button>按钮</qm-button>
  </qm-space>
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

| 参数           | 说明               | 类型                              | 默认值     |
| -------------- | ------------------ | --------------------------------- | ---------- |
| direction      | 排列的方向         | vertical \| horizontal            | horizontal |
| arrangement    | 主轴方向的排列方式 | left \| center \| right           | left       |
| alignment      | 侧轴方向的对齐方式 | top \| center \| bottom           | center     |
| size           | 间隔大小           | number \| medium \| small \| mini | -          |
| wrap           | 设置是否自动折行   | boolean                           | false      |
| spacer         | 间隔符             | string \| JSXNode                 | -          |
| containerStyle | 容器的 css 样式    | styleObject                       | -          |

### Space Slot

| 名称    | 说明               |
| ------- | ------------------ |
| default | 需要添加间隔的元素 |
