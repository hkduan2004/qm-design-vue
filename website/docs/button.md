## Button 按钮

多功能按钮，可实现 **防止 ajax 重复提交** 和 **点击后确认提示** 功能。

### 防止重复提交

:::tip
注意：`click` 是组件参数，而不是自定义事件，指令符号是 **冒号**。
:::

:::demo 使用 `click` 参数来实现 防止 ajax 重复提交。

```html
<template>
  <qm-button type="primary" :click="clickHandle">提交</qm-button>
</template>

<script>
  // ajax 接口示例代码，不作为实际的参考
  const axios = require('@/api/fetch').default;
  const sleep = async (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };
  // ----- END -----
  export default {
    data() {
      return {};
    },
    methods: {
      async clickHandle() {
        await sleep(500);
      },
    },
  };
</script>
```

:::

### 确认提示

点击确认，会触发 `:click` 或 `@click` 定义的方法。

:::demo 使用 `confirm` 参数来实现 确认提示。

```html
<template>
  <qm-button type="danger" :confirm="confirm" :click="removeHandle">删除</qm-button>
</template>

<script>
  const sleep = async (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
  };
  export default {
    data() {
      return {
        confirm: {},
      };
    },
    methods: {
      async removeHandle() {
        await sleep(500);
        console.log('删除成功！');
      },
    },
  };
</script>
```

:::

### 参数

| 参数     | 说明                                     | 类型                                                    | 默认值 |
| -------- | ---------------------------------------- | ------------------------------------------------------- | ------ |
| click    | 点击时执行的方法，用于防止 ajax 重复提交 | function                                                | -      |
| size     | 尺寸                                     | large \| default \| small                               | -      |
| type     | 类型                                     | primary \| success \| warning \| danger \| info \| text | -      |
| icon     | 图标组件                                 | string \| VueNode                                       | -      |
| loading  | 是否加载中状态                           | boolean                                                 | false  |
| disabled | 是否禁用状态                             | boolean                                                 | false  |
| round    | 是否圆角按钮                             | boolean                                                 | false  |
| circle   | 是否圆形按钮                             | boolean                                                 | false  |
| confirm  | 点击操作，确认提示，[配置项 confirm]     | object                                                  | -      |

### 事件

| 事件名称 | 说明       | 回调参数   |
| -------- | ---------- | ---------- |
| click    | 点击时触发 | mouseEvent |

### confirm

| 参数      | 说明               | 类型     | 默认值           |
| --------- | ------------------ | -------- | ---------------- |
| title     | 提示内容           | string   | 确认执行删除吗？ |
| onConfirm | 点击确认按钮时触发 | function | -                |
| onCancel  | 点击取消按钮时触发 | function | -                |
