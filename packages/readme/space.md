## API

### Space

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
