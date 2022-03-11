## Upload 附件上传

用于附件上传。

### Upload

:::demo

```html
<template>
  <div>暂无...</div>
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

### 参数

| 参数         | 说明                                     | 类型                                                    | 默认值                               |
| ------------ | ---------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| actionUrl    | 文件上传的地址，必要参数                 | string                                                  | -                                    |
| headers      | 上传/下载请求，header 头携带的自定义参数 | object                                                  | -                                    |
| params       | 上传接口的额外参数                       | object                                                  | -                                    |
| size         | 尺寸                                     | large \| default \| small                               | -                                    |
| initialValue | 默认显示的文件列表，[配置项](#item)      | array                                                   | -                                    |
| fileTypes    | 限制上传附件的类型                       | string[]                                                | ['jpg', 'png', 'pdf', 'xls', 'xlsx'] |
| isOnlyButton | 是否仅显示上传按钮                       | boolean                                                 | false                                |
| limit        | 限制上传图片的数量                       | number                                                  | 1                                    |
| fileSize     | 限制上传文件的大小，单位是 M             | number                                                  | 5                                    |
| disabled     | 是否禁用图片上传                         | boolean                                                 | false                                |
| type         | 按钮的类型                               | primary \| success \| warning \| danger \| info \| text | primary                              |
| disabled     | 是否禁用状态                             | boolean                                                 | false                                |
| round        | 是否圆角按钮                             | boolean                                                 | false                                |
| circle       | 是否圆形按钮                             | boolean                                                 | false                                |
| icon         | 按钮图标类名                             | string                                                  | -                                    |

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
