## API

### Form

| 参数           | 说明                                           | 类型                          | 默认值  |
| -------------- | ---------------------------------------------- | ----------------------------- | ------- |
| formType       | 表单类型，[配置项](#formType)                  | default \| search \| onlyShow | default |
| list           | 表单配置项列表，[配置项](#formItem)，必要参数  | array                         | -       |
| initialValue   | 表单初始值                                     | object                        | -       |
| size           | 尺寸                                           | large \| default \| small     | -       |
| labelWidth     | label 标签宽度                                 | number \| string              | 80      |
| cols           | 每行显示的列数(被 24 整除)，不设置默认为自适应 | number                        | -       |
| uniqueKey      | 用于表单配置项的本地缓存，不能重复             | string                        | -       |
| customClass    | 自定义选择器类名                               | string                        | -       |
| defaultRows    | 收起状态默认显示的行数 - 筛选器有效            | number                        | 1       |
| authConfig     | 表单权限配置，[配置项](#authConfig)            | object                        | -       |
| isFieldsDefine | 是否显示列定义功能                             | boolean                       | -       |
| isCollapse     | 是否显示 展开/收起 功能 - 筛选器有效           | boolean                       | true    |
| isSearchBtn    | 是否显示 搜索/重置 按钮                        | boolean                       | true    |
| isSubmitBtn    | 是否显示 保存/重置 按钮                        | boolean                       | -       |
| fieldsChange   | 表单配置项变化回调，必要参数                   | function(fields)              | -       |

### 事件

| 事件名称     | 说明                 | 回调参数                       |
| ------------ | -------------------- | ------------------------------ |
| finish       | 表单提交后触发       | function(formData: object)     |
| finishFailed | 表单提交失败后触发   | function(error)                |
| change       | 表单提交后触发       | function(formData: object)     |
| reset        | 重置表单时触发       | -                              |
| valuesChange | 字段值变化时触发     | function(changedValue: object) |
| collapse     | 展开/收起 切换时触发 | function(collapse: boolean)    |

### 方法

| 方法名称          | 说明                                   | 参数                                | 返回值                               |
| ----------------- | -------------------------------------- | ----------------------------------- | ------------------------------------ |
| SUBMIT_FORM       | 表单提交                               | -                                   | -                                    |
| RESET_FORM        | 重置表单                               | -                                   | -                                    |
| CLEAR_FORM        | 清空表单                               | -                                   | -                                    |
| SET_FIELDS_VALUE  | 设置表单字段的值                       | function(values:object)             | -                                    |
| SET_FORM_VALUES   | 可以设置除了表单字段的额外值           | function(values:object)             | -                                    |
| SET_INITIAL_VALUE | 设置表单的初始值，适用于异步获取初始值 | function(values:object)             | -                                    |
| CREATE_FOCUS      | 设置表单元素获得焦点方法               | function(fieldName:string)          | -                                    |
| GET_FORM_DATA     | 获取表单数据，异步方法                 | -                                   | 返回错误前置的数组 [error, formData] |
| GET_FIELD_VALUE   | 获取表单项的值                         | function(fieldName:string)          | 返回表单字段值                       |
| VALIDATE_FIELDS   | 对表单字段进行校验                     | function(fieldNames[] \| fieldName) | -                                    |

### formType

| 表单类型 | 说明     |
| -------- | -------- |
| default  | 表单     |
| search   | 筛选器   |
| onlyShow | 只读表单 |

### formItemType

| 表单类型             | 说明                   |
| -------------------- | ---------------------- |
| BREAK_SPACE          | 分隔符                 |
| INPUT                | 输入框                 |
| RANGE_INPUT          | 输入框区间             |
| INPUT_NUMBER         | 数值类型输入框         |
| RANGE_INPUT_NUMBER   | 数值类型输入框区间     |
| TREE_SELECT          | 树选择器               |
| MULTIPLE_TREE_SELECT | 树选择器，多选         |
| CASCADER             | 级联选择器             |
| MULTIPLE_CASCADER    | 级联选择器多选         |
| SELECT               | 下拉选择器             |
| MULTIPLE_SELECT      | 下拉选择器，多选       |
| REGION_SELECT        | 地区选择器，支持街道   |
| CITY_SELECT          | 城市选择器             |
| SWITCH               | 开关类型               |
| RADIO                | 单选按钮               |
| CHECKBOX             | 复选框                 |
| MULTIPLE_CHECKBOX    | 复选框，多选           |
| TEXT_AREA            | 文本域                 |
| SEARCH_HELPER        | 搜索帮助               |
| IMMEDIATE            | 及时反馈               |
| DATE                 | 日期类型               |
| RANGE_DATE           | 日期区间类型，单独选择 |
| RANGE_DATE_EL        | 日期区间类型，拖拽选择 |
| TIME                 | 时间类型               |
| RANGE_TIME           | 时间区间类型           |
| TIME_SELECT          | 时间选择               |
| RANGE_TIME_SELECT    | 时间区间选择           |
| UPLOAD_IMG           | 图片上传               |
| UPLOAD_FILE          | 附件上传               |
| TINYMCE              | 富文本编辑器           |

### formItem

| 参数         | 说明                                                          | 类型                             | 默认值 |
| ------------ | ------------------------------------------------------------- | -------------------------------- | ------ |
| type         | 字段类型，[配置项](#formItemType)，必要参数                   | string                           | -      |
| fieldName    | 字段数据名，不能重复，必要参数                                | string                           | -      |
| label        | label 名称，必要参数                                          | string                           | -      |
| labelWidth   | label 标签宽度，支持 auto                                     | number \| string                 | 80     |
| description  | label 表述信息                                                | string                           | -      |
| hidden       | 是否隐藏，不占页面空间                                        | boolean                          | -      |
| invisible    | 是否可见，占页面空间                                          | boolean                          | -      |
| disabled     | 是否禁用                                                      | boolean                          | -      |
| rules        | 校验规则，[配置项](#rules)                                    | array                            | -      |
| selfCols     | 自身占据的列数，数值 24 表示占据整行                          | number                           | 1      |
| offsetLeft   | 左侧的偏移列数                                                | number                           | -      |
| offsetRight  | 右侧的偏移列数                                                | number                           | -      |
| style        | 设置 css 样式                                                 | styleObject                      | -      |
| id           | 设置分隔符节点 id 属性，用于锚点定位                          | string                           | -      |
| options      | 表单字段的详细配置，[配置项](#options)                        | object                           | -      |
| searchHelper | 输入框类型搜索帮助的配置，[配置项](#searchHelper)             | object                           | -      |
| request      | 请求配置项，用于获取表单列表数据，[配置项](#request)          | object                           | -      |
| upload       | 附件上传的配置，[配置项](#upload)                             | object                           | -      |
| collapse     | 分隔符的 展开/收起 配置，[配置项](#collapse)                  | object                           | -      |
| labelOptions | label 标签配置，用于实现自定义 label，[配置项](#labelOptions) | object                           | -      |
| descOptions  | 描述信息配置，[配置项](#descOptions)                          | object                           | -      |
| placeholder  | 表单元素的 placeholder 原生属性                               | string \| string[]               | -      |
| clearable    | 是否显示清空按钮                                              | boolean                          | -      |
| readonly     | 是否只读                                                      | boolean                          | -      |
| noResetable  | 是否不可被重置                                                | boolean                          | -      |
| render       | 自定义表单项                                                  | function(formItem, ctx): JSXNode | -      |

### rules

| 参数      | 说明             | 类型                             | 默认值 |
| --------- | ---------------- | -------------------------------- | ------ |
| required  | 是否必填         | boolean                          | -      |
| message   | 提示信息         | string                           | -      |
| trigger   | 校验触发 fangshi | change \| blur \| [blur, change] | -      |
| min       | 最小长度         | number                           | -      |
| max       | 最大长度         | number                           | -      |
| validator | 自定义校验方法   | function(rule, value, callback)  | -      |

注意：表单控件如果使用了自定义校验规则，rules 配置中不能加 message 属性，required 的非空校验也需要在自定义的校验方法中实现

### options

| 参数          | 说明                                                        | 类型                       | 默认值 |
| ------------- | ----------------------------------------------------------- | -------------------------- | ------ |
| itemList      | 下拉框的列表数据，[配置项](#dict)                           | array                      | -      |
| secretType    | 值保密类型，在只读或禁用的状态下有效，[配置项](#secretType) | string                     | -      |
| trueValue     | 选中的值                                                    | string \| number           | '1'    |
| falseValue    | 非选中的值                                                  | string \| number           | '0'    |
| dateType      | 日期控件的类型，[配置项](#dateType)                         | string                     | -      |
| minDateTime   | 最小日期，小于该时间的日期段将被禁用                        | string                     | -      |
| maxDateTime   | 最大日期，大于该时间的日期段将被禁用                        | string                     | -      |
| defaultTime   | 默认的时间                                                  | string                     | -      |
| shortCuts     | 是否显示日期组件的快捷选项                                  | boolean                    | true   |
| unlinkPanels  | 取消两个日期面板之间的联动                                  | boolean                    | true   |
| startDisabled | 是否禁用开始日期                                            | boolean                    | -      |
| endDisabled   | 是否禁用结束日期                                            | boolean                    | -      |
| columns       | 及时反馈下拉列表的配置，[配置项](#columns)                  | array                      | -      |
| fieldAliasMap | 表单字段与回传数据字段的映射，返回值 [配置项](#aliasMap)    | function(): object         | -      |
| itemRender    | 及时反馈下拉列表的自定义渲染                                | function(rowData): JSXNode |
| onlySelect    | 是否只能选择，针对及时反馈组件有效                          | boolean                    | true   |
| limit         | 数量限制                                                    | number                     | -      |
| min           | 最小值                                                      | number                     | 0      |
| max           | 最大值                                                      | number                     | -      |
| step          | 计数器步长                                                  | number                     | 1      |
| precision     | 浮点型数值的精度                                            | number                     | 0      |
| controls      | 是否显示控制按钮                                            | boolean                    | -      |
| minlength     | 最小长度                                                    | number                     | 0      |
| maxlength     | 最大长度                                                    | number                     | -      |
| prefixIcon    | 输入框前缀图标                                              | VueNode                    | -      |
| suffixIcon    | 输入框后缀图标                                              | VueNode                    | -      |
| rows          | 文本域输入框行数                                            | number                     | 2      |
| maxrows       | 文本域最大行数                                              | number                     | -      |
| showLimit     | 是否显示输入字数统计                                        | boolean                    | -      |
| password      | 是否时密码格式                                              | boolean                    | -      |
| noInput       | 输入框是否不允许输入                                        | boolean                    | -      |
| toUpper       | 输入框文本自动转大写                                        | boolean                    | -      |
| toFinance     | 输入框文本自动转金融格式                                    | boolean                    | -      |
| filterable    | 是否开启自动检索功能                                        | boolean                    | true   |
| collapseTags  | 是否折叠 tag 标签                                           | boolean                    | -      |
| openPyt       | 是否开启拼音头检索                                          | boolean                    | true   |
| onInput       | 输入框 input 事件                                           | function(value)            | -      |
| onClick       | 单击事件                                                    | function()                 | -      |
| onDblClick    | 双击事件                                                    | function()                 | -      |
| onEnter       | 回车事件                                                    | function(value)            | -      |
| onFocus       | 输入框获得焦点事件                                          | function()                 | -      |
| onBlur        | 输入框失去焦点事件                                          | function()                 | -      |

### dateType

| 参数           | 说明                 | 类型   | 格式                |
| -------------- | -------------------- | ------ | ------------------- |
| date           | 日期类型，默认       | tring  | YYYY-MM-DD HH:mm:ss |
| datetime       | 日期时间类型         | tring  | YYYY-MM-DD HH:mm:ss |
| exactdate      | 严格日期类型         | string | YYYY-MM-DD          |
| daterange      | 日期区间类型，默认   | string | YYYY-MM-DD HH:mm:ss |
| datetimerange  | 日期时间区间类型     | string | YYYY-MM-DD HH:mm:ss |
| exactdaterange | 严格日期时间区间类型 | string | YYYY-MM-DD          |
| week           | 周类型               | string | YYYY-MM-DD          |
| month          | 月份类型             | string | YYYY-MM             |
| monthrange     | 月份区间类型         | string | YYYY-MM             |
| year           | 年份类型             | string | YYYY                |
| yearrange      | 年份区间类型         | string | YYYY                |

### authConfig

| 参数  | 说明                                 | 类型   | 默认值 |
| ----- | ------------------------------------ | ------ | ------ |
| fetch | 获取权限的接口，[配置项](#authFetch) | object | -      |

### authFetch

| 参数    | 说明                                                        | 类型   | 默认值 |
| ------- | ----------------------------------------------------------- | ------ | ------ |
| api     | ajax 接口，必要参数                                         | func   | -      |
| params  | 接口参数                                                    | object | -      |
| dataKey | 表单字段权限的数据路径，值为不可见列 `fieldName` 组成的数组 | string | -      |

### dict

| 参数     | 说明                 | 类型    |
| -------- | -------------------- | ------- |
| text     | 数字字典的文本，必要 | string  |
| value    | 数据字典的值，必要   | string  |
| disabled | 是否禁用             | boolean |
| children | 树结构               | array   |

### secretType

| 参数     | 说明           |
| -------- | -------------- |
| finance  | 转金融数字格式 |
| name     | 姓名           |
| phone    | 手机号         |
| IDnumber | 身份证号       |
| bankCard | 银行卡号       |

### searchHelper

| 参数               | 说明                                                                      | 类型                   | 默认值 |
| ------------------ | ------------------------------------------------------------------------- | ---------------------- | ------ |
| filters            | 顶部筛选器配置，必要参数，[配置项](#formItem)                             | array                  | -      |
| uniqueKey          | 用于筛选器配置项的本地缓存，不能重复                                      | string                 | -      |
| initialValue       | 表单初始值                                                                | object                 | -      |
| showFilterCollapse | 是否显示筛选器 展开/收起 按钮                                             | boolean                | true   |
| table              | 表格组件配置，支持 fetch, columns, rowKey, webPagination                  | object                 | -      |
| closeServerMatch   | 是否关闭服务端联想并回显值                                                | boolean                | -      |
| filterAliasMap     | 输入框与筛选器条件的映射，返回 筛选器 fieldName 列表                      | function(): string[]   | -      |
| fieldAliasMap      | 输入框与回传数据字段的映射，返回值 [配置项](#aliasMap)                    | function(): object     | -      |
| name               | 搜索帮助名称，for TDS                                                     | string                 | -      |
| fieldsDefine       | 表单字段的定义，for TDS                                                   | object                 | -      |
| getServerConfig    | 获取服务端搜索帮助定义的接口，for TDS                                     | async function         | -      |
| beforeOpen         | 打开搜索帮助前触发，若返回 false 或者返回 Promise 且被 reject，则阻止打开 | function(formData)     | -      |
| closed             | 关闭搜索帮助后触发                                                        | function(tableRowData) | -      |

### aliasMap

注意：

- key 为 extra 时，对应的数据会显示成该表单元素的描述信息
- key 为 [fieldName]\_\_desc 时，对应的数据会显示成对应表单元素的描述信息，支持配置多个

| 参数  | 说明                         | 类型   | 默认值 |
| ----- | ---------------------------- | ------ | ------ |
| key   | 表单字段名                   | string | -      |
| value | 搜索帮助接口数据对应的字段名 | string | -      |

### labelOptions

| 参数 | 说明           | 类型               | 默认值 |
| ---- | -------------- | ------------------ | ------ |
| type | label 表单类型 | SELECT \| CHECKBOX | -      |

注意：除了 type 的其他配置，参考 [配置项](#formItem)

### descOptions

注意：描述信息会占据原有表单元素的部分空间，因此需要通过 list 配置项中的 style 来控制表单元素的宽度

| 参数      | 说明                            | 类型              | 默认值 |
| --------- | ------------------------------- | ----------------- | ------ |
| isTooltip | 是否以 Tooltip 形式显示描述信息 | boolean           | -      |
| style     | 描述文本容器的 css 样式         | object            | -      |
| content   | 描述信息的内容                  | string \| JSXNode | -      |

### request

| 参数           | 说明                                | 类型           | 默认值 |
| -------------- | ----------------------------------- | -------------- | ------ |
| fetchApi       | 请求的接口方法，必要参数            | async function | -      |
| fetchStreetApi | 请求街道数据的接口                  | async function | -      |
| params         | 接口的参数                          | object         | -      |
| dataKey        | 数据的 key，支持 `a.b.c` 的路径写法 | string         | -      |
| valueKey       | 数据值的字段名                      | string         | value  |
| textKey        | 文本的字段名                        | string         | text   |

### upload

`只对 UPLOAD_IMG|UPLOAD_FILE 有效`

| 参数         | 说明                                                         | 类型     | 默认值                                      |
| ------------ | ------------------------------------------------------------ | -------- | ------------------------------------------- |
| actionUrl    | 上传的地址，必要参数                                         | string   | -                                           |
| headers      | 接口请求的 header 头                                         | object   | -                                           |
| params       | 上传接口的参数                                               | object   | -                                           |
| fileTypes    | 限制上传附件的类型                                           | string[] | ['jpg', 'png', 'bmp', 'pdf', 'xls', 'xlsx'] |
| fileSize     | 限制上传附件的大小，如果不指定此参数，图片类型不开启裁剪功能 | number   | -                                           |
| limit        | 限制上传附件的数量                                           | number   | 1                                           |
| fixedSize    | 裁剪框的宽高比，空数组则不约束裁剪框的宽高比                 | array    | [1.5, 1]                                    |
| isCalcHeight | 是否根据裁剪图片宽高比自动计显示框高度                       | boolean  | true                                        |
| titles       | 上传图片对应的标题，个数与 limit 一致                        | string[] | -                                           |

`文件上传前后端数据交互的格式`

| 参数 | 说明     | 类型   | 默认值 |
| ---- | -------- | ------ | ------ |
| name | 文件名称 | string | -      |
| url  | 文件地址 | string | -      |

### collapse

`只对 BREAK_SPACE 有效`

| 参数          | 说明                                                             | 类型                     | 默认值 |
| ------------- | ---------------------------------------------------------------- | ------------------------ | ------ |
| defaultExpand | 默认的展开状态                                                   | boolean                  | -      |
| showLimit     | 默认显示表单项的数量                                             | number                   | -      |
| remarkItems   | 指定被隐藏的表单作为摘要显示到分隔符区域，[配置项](#remarkItems) | array                    | -      |
| onCollapse    | 展开/收起 状态改变时的回调事件                                   | function(collapse: bool) | -      |

### remarkItems

| 参数      | 说明                        | 类型   | 默认值 |
| --------- | --------------------------- | ------ | ------ |
| fieldName | 表单项的字段名(fieldName)   | string | -      |
| isLabel   | 是否显示表单项的 label 名称 | string | -      |
