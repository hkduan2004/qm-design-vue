## Countup 计数统计

可实现 **计数动画** 效果。

### 计数

:::demo

```html
<template>
  <qm-countup :end-value="val" />
</template>

<script>
  export default {
    data() {
      return {
        val: 1000,
      };
    },
  };
</script>
```

:::

### 参数

| 参数      | 说明             | 类型                    | 默认值 |
| --------- | ---------------- | ----------------------- | ------ |
| end-value | 结束值，必要参数 | number                  | -      |
| size      | 尺寸             | medium \| small \| mini | -      |
| delay     | 动画延迟时长     | number                  | 0      |

### 事件

| 事件名称 | 说明               | 回调参数 |
| -------- | ------------------ | -------- |
| ready    | 计数动画开始前触发 | -        |
