## API

### CopyToClipboard

| 参数        | 说明                  | 类型    | 默认值 |
| ----------- | --------------------- | ------- | ------ |
| text        | 要复制到剪贴板的文本  | string  | -      |
| showMessage | 是否显示 Message 提示 | boolean | true   |

### 事件

| 事件名称 | 说明           | 回调参数               |
| -------- | -------------- | ---------------------- |
| copy     | 复制成功的回调 | function(text, result) |
