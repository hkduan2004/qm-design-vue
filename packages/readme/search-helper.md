## API

### SearchHelper

| 参数               | 说明                                                 | 类型                      | 默认值 |
| ------------------ | ---------------------------------------------------- | ------------------------- | ------ |
| size               | 尺寸                                                 | large \| default \| small | -      |
| uniqueKey          | 用于筛选器配置项的本地缓存，不能重复                 | string                    | -      |
| filters            | 顶部筛选器配置，必要参数，[配置参考 Form 组件]       | array                     | -      |
| initialValue       | 表单初始值                                           | object                    | -      |
| showFilterCollapse | 是否显示筛选器 展开/收起 按钮                        | boolean                   | true   |
| table              | 表格组件配置，[配置项](#table)                       | object                    | -      |
| fieldAliasMap      | 输入框与回传数据字段的映射，[配置项](#fieldAliasMap) | function(): object        | -      |
| beforeFetch        | 在执行查询接口之前，处理请求参数，返回处理后的数据   | function(params): object  | -      |
| dataIndex          | 当前搜索帮助列的 dataIndex - 只对表格的搜索帮助有效  | string                    | -      |
| callback           | 回传数据的回调函数 - 只对表格的搜索帮助有效          | function                  | -      |
| name               | 搜索帮助名称，for TDS                                | string                    | -      |
| fieldsDefine       | 表单字段的定义，[配置项](#fieldsDefine)，for TDS     | object                    | -      |
| getServerConfig    | 获取服务端搜索帮助定义的接口，for TDS                | async function            | -      |

### 事件

| 事件名称 | 说明                                  | 回调参数                                    |
| -------- | ------------------------------------- | ------------------------------------------- |
| close    | 在行双击或者点击 确定/关闭 按钮时触发 | function(visible: boolean, rowData: object) |

### table

| 参数          | 说明                      | 类型           | 默认值 |
| ------------- | ------------------------- | -------------- | ------ |
| columns       | 参考 Table 组件，必要参数 | array          | -      |
| rowKey        | 参考 Table 组件，必要参数 | string \| func | -      |
| fetch         | 参考 Table 组件，必要参数 | object         | -      |
| webPagination | 是否是前端分页            | boolean        | false  |

### fieldAliasMap

注意：key 为 extra 时，对应的数据会显示成表单元素的描述信息

| 参数  | 说明                             | 类型   | 默认值 |
| ----- | -------------------------------- | ------ | ------ |
| key   | 表格列的 dataIndex 或 表单字段名 | string | -      |
| value | 搜索帮助接口数据对应的字段名     | string | -      |

### fieldsDefine

| key             | value                         | 说明                                                 |
| --------------- | ----------------------------- | ---------------------------------------------------- |
| valueName       | -                             | 搜索帮助的 id                                        |
| displayName     | 表单组件配置项 fieldName 的值 | 搜索帮助的 name                                      |
| descriptionName | extra                         | 固定值，只是搜索帮助的描述信息，不作为表单数据的 key |

### 示例

注意：搜索帮助组件已经与 Form 和 Table 集成

说明：双击行记录 或者 选中数据后点击确定按钮，会触发 close 事件
