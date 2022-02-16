## API

### Button

| 参数     | 说明                                     | 类型                                                    | 默认值 |
| -------- | ---------------------------------------- | ------------------------------------------------------- | ------ |
| click    | 点击时执行的方法，用于防止 ajax 重复提交 | function                                                | -      |
| size     | 尺寸                                     | medium \| small \| mini                                 | -      |
| type     | 类型                                     | primary \| success \| warning \| danger \| info \| text | -      |
| icon     | 图标组件                                 | string \| VueNode                                       | -      |
| loading  | 是否加载中状态                           | boolean                                                 | false  |
| disabled | 是否禁用状态                             | boolean                                                 | false  |
| round    | 是否圆角按钮                             | boolean                                                 | false  |
| circle   | 是否圆形按钮                             | boolean                                                 | false  |
| confirm  | 点击操作，确认提示，[配置项](#confirm)   | object                                                  | -      |

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
