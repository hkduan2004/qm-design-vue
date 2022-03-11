## API

### UploadCropper

| 参数         | 说明                                                         | 类型                      | 默认值                |
| ------------ | ------------------------------------------------------------ | ------------------------- | --------------------- |
| actionUrl    | 上传的地址，必要参数                                         | string                    | -                     |
| headers      | 接口请求的 header 头                                         | object                    | -                     |
| params       | 上传接口的参数                                               | object                    | -                     |
| initialValue | 默认显示的图片列表，[配置项](#item)                          | array                     | -                     |
| size         | 尺寸                                                         | large \| default \| small | -                     |
| fileTypes    | 限制上传附件的类型                                           | string[]                  | ['jpg', 'png', 'bmp'] |
| fileSize     | 限制上传附件的大小，如果不指定此参数，图片类型不开启裁剪功能 | number                    | -                     |
| limit        | 限制上传附件的数量                                           | number                    | 1                     |
| fixedSize    | 裁剪框的宽高比，空数组则不约束裁剪框的宽高比                 | array                     | [1.5, 1]              |
| isCalcHeight | 是否根据裁剪图片宽高比自动计显示框高度                       | boolean                   | true                  |
| titles       | 上传图片对应的标题，个数与 limit 一致                        | string[]                  | -                     |
| disabled     | 是否禁用                                                     | boolean                   | -                     |

### 事件

| 事件名称 | 说明               | 回调参数                   |
| -------- | ------------------ | -------------------------- |
| change   | 文件上传成功后触发 | function(fileList: item[]) |
| success  | 上传成功时触发     | -                          |
| error    | 上传失败时触发     | -                          |

### item

| 参数 | 说明     | 类型   | 默认值 |
| ---- | -------- | ------ | ------ |
| name | 文件名称 | string | -      |
| url  | 文件地址 | string | -      |
