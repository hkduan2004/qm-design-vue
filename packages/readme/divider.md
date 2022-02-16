## API

### Divider

| 参数             | 说明                    | 类型                    | 默认值 |
| ---------------- | ----------------------- | ----------------------- | ------ |
| label            | 标题名称                | string                  | -      |
| size             | 尺寸                    | medium \| small \| mini | -      |
| extra            | 摘要栏内容              | string \| JSXNode       | -      |
| v-model:collapse | 是否显示 展开/收起 按钮 | boolean                 | -      |

### 事件

| 事件名称 | 说明                 | 回调参数          |
| -------- | -------------------- | ----------------- |
| change   | 展开/收起 切换时触发 | collapse: boolean |
