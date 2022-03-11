## Tabs 标签页

选项卡切换组件。

### Tabs

:::demo

```html
<template>
  <qm-tabs v-model="tabName" @change="changeHandle">
    <qm-tab-pane label="用户管理" name="first">用户管理1</qm-tab-pane>
    <qm-tab-pane label="配置管理" name="second">配置管理2</qm-tab-pane>
    <qm-tab-pane label="角色管理" name="third">角色管理3</qm-tab-pane>
  </qm-tabs>
</template>

<script>
  export default {
    data() {
      return {
        tabName: 'first',
      };
    },
    methods: {
      changeHandle(name) {
        console.log(`页签：`, name);
      },
    },
  };
</script>
```

:::

### Tabs 参数

| 参数           | 说明                                                                      | 类型                           | 默认值 |
| -------------- | ------------------------------------------------------------------------- | ------------------------------ | ------ |
| v-model        | 选项卡绑定值，选中选项卡的 name                                           | string                         | -      |
| tabPosition    | 选项卡所在位置                                                            | top \| right \| bottom \| left | top    |
| size           | 尺寸                                                                      | large \| default \| small      | -      |
| lazyLoad       | 是否延迟渲染                                                              | boolean                        | true   |
| tabCustomClass | 选项卡的自定义 class 名称                                                 | string                         | -      |
| extraNode      | 对选项卡顶部区域的扩展                                                    | string \| JSXNode              | -      |
| beforeLeave    | 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换 | function                       | -      |

### 事件

| 事件名称 | 说明             | 回调参数     |
| -------- | ---------------- | ------------ |
| change   | 选项卡切换时触发 | 选项卡绑定值 |

### TabPane 参数

| 参数     | 说明                 | 类型    | 默认值 |
| -------- | -------------------- | ------- | ------ |
| label    | 选项卡标题，必要参数 | string  | -      |
| name     | 与选项卡绑定值对应   | string  | -      |
| disabled | 是否禁用             | boolean | -      |

### TabPane Slot

| 名称    | 说明       |
| ------- | ---------- |
| default | 选项卡内容 |
