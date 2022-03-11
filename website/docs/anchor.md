## Anchor 锚点

锚点定位，用于交互页面的多模块场景。

:::tip
注意：`qm-anchor` 组件调用需要设定 **高度**，否则不会出现滚动条，可以通过标签属性 `class` 或 `style` 设置。
:::

### 使用方式

:::demo `qm-anchor-item` 通过 `showDivider` 参数添加分隔符。

```html
<template>
  <qm-anchor style="height: 200px;">
    <qm-anchor-item label="标题1" showDivider>
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
    </qm-anchor-item>
    <qm-anchor-item label="标题2" showDivider>
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
    </qm-anchor-item>
    <qm-anchor-item label="标题3" showDivider>
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
    </qm-anchor-item>
  </qm-anchor>
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

### 使用方式

:::demo

```html
<template>
  <qm-anchor :labelList="labels" style="height: 200px;">
    <div id="a1">
      <qm-divider label="标题1" />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
      内容1<br />
    </div>
    <div id="a2">
      <qm-divider label="标题2" />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
      内容2<br />
    </div>
    <div id="a3">
      <qm-divider label="标题3" />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
      内容3<br />
    </div>
  </qm-anchor>
</template>

<script>
  export default {
    data() {
      return {
        labels: [
          {
            id: 'a1',
            label: '标题1',
          },
          {
            id: 'a2',
            label: '标题2',
          },
          {
            id: 'a3',
            label: '标题3',
          },
        ],
      };
    },
  };
</script>
```

:::

### Anchor 参数

| 参数       | 说明                                 | 类型                      | 默认值 |
| ---------- | ------------------------------------ | ------------------------- | ------ |
| labelWidth | lable 标签宽度，单位 px              | number \| string          | 80     |
| size       | 尺寸                                 | large \| default \| small | -      |
| labelList  | label 的配置列表，[配置项 labelList] | array                     | -      |

### 方法

| 方法名称       | 说明                                      | 参数                | 返回值 |
| -------------- | ----------------------------------------- | ------------------- | ------ |
| SCROLL_TO_ITEM | 滚动到指定 AnchorItem，参数是对应的索引值 | function(itemIndex) | -      |

### AnchorItem 参数

| 参数        | 说明                     | 类型    | 默认值 |
| ----------- | ------------------------ | ------- | ------ |
| label       | lable 标签名称，必要参数 | string  | -      |
| showDivider | 是否添加分隔符           | boolean | false  |

### labelList

| 参数  | 说明                          | 类型   | 默认值 |
| ----- | ----------------------------- | ------ | ------ |
| id    | 锚点元素的 id，用于锚点的定位 | string | -      |
| label | label 标签名称                | string | -      |

### AnchorItem Slot

| 名称    | 说明     |
| ------- | -------- |
| default | 锚点内容 |
