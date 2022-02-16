## Spin 加载中

用于页面和区块的加载中状态。

### Spin

:::demo

```html
<template>
  <qm-button type="primary" @click="clickHandle">切换 loading</qm-button>
  <qm-spin :spinning="loading" tip="Loading...">
    <div style="height: 200px;">内容1</div>
  </qm-spin>
  <qm-spin :spinning="loading" mode="normal">
    <div style="height: 200px;">内容2</div>
  </qm-spin>
</template>

<script>
  export default {
    data() {
      return {
        loading: false,
      };
    },
    methods: {
      clickHandle() {
        this.loading = !this.loading;
      },
    },
  };
</script>
```

:::

### 参数

| 参数           | 说明                      | 类型                    | 默认值 |
| -------------- | ------------------------- | ----------------------- | ------ |
| spinning       | 是否加载中状态，必选参数  | boolean                 | false  |
| size           | 尺寸                      | medium \| small \| mini | -      |
| mode           | loading 的显示形式        | spin \| normal          | spin   |
| delay          | 动画延迟开启时长，单位 ms | number                  | 100    |
| tip            | 自定义描述文字            | string                  |        |
| containerStyle | 外层容器的 css 样式       | styleObject             | -      |

### Spin Slot

| 名称    | 说明      |
| ------- | --------- |
| default | Spin 内容 |
