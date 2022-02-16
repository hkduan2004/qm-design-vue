## API

### Tinymce

| 参数             | 说明                                    | 类型                    | 默认值 |
| ---------------- | --------------------------------------- | ----------------------- | ------ |
| v-model          | 富文本绑定值                            | string                  | -      |
| size             | 尺寸                                    | medium \| small \| mini | -      |
| height           | 富文本编辑器的高度                      | number \| string        | 400    |
| tinymceScriptSrc | tinymce js 文件的外联地址               | string                  | -      |
| upload           | 图片/附件 上传的配置，[配置项](#upload) | object                  | -      |
| disabled         | 是否禁用                                | boolean                 | -      |

### 事件

| 事件名称 | 说明           | 回调参数               |
| -------- | -------------- | ---------------------- |
| change   | 文本变化时触发 | function(value:string) |

### upload

| 参数      | 说明                                 | 类型   | 默认值   |
| --------- | ------------------------------------ | ------ | -------- |
| actionUrl | 上传的地址，必要参数                 | string | -        |
| headers   | 接口请求的 header 头参数             | object | -        |
| fixedSize | 裁剪框的宽高比，只对 UPLOAD_IMG 有效 | array  | [1.5, 1] |
