## Table 表格

用于 **查询** 和 **编辑** 功能的多功能表格。

### 基础表格

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

| 参数                 | 说明                                                   | 类型                                                   | 默认值 |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ------ |
| columns              | 表格列的配置，[配置项](#column)，必要参数              | array                                                  | -      |
| columnsChange        | 表格列变化事件，必要参数                               | function(columns)                                      | -      |
| dataSource           | 数据数组                                               | array                                                  | -      |
| rowKey               | 表格行 key 的取值，可以是字符串或一个函数              | string \| function(row, index): string                 | uid    |
| fetch                | 向后台请求数据的接口，[配置项](#fetch)                 | object                                                 | -      |
| border               | 是否带有纵向边框                                       | boolean                                                | true   |
| stripe               | 是否为斑马纹表格                                       | boolean                                                | -      |
| height               | 表格的高度，单位 px                                    | number \| auto                                         | -      |
| minHeight            | 表格的最小高度，单位 px                                | number                                                 | -      |
| maxHeight            | 表格的最大高度，单位 px                                | number                                                 | -      |
| loading              | 页面是否加载中                                         | boolean                                                | -      |
| resizable            | 所有列是否允许拖动列宽调整大小                         | boolean                                                | true   |
| size                 | 表格尺寸                                               | large \| default \| small                              | -      |
| uniqueKey            | 设置表格各种配置信息的本地缓存，不能重复               | string                                                 | -      |
| customClass          | 自定义选择器类名                                       | string                                                 | -      |
| showHeader           | 是否显示表头                                           | boolean                                                | true   |
| ellipsis             | 设置所有内容过长时显示为省略号                         | boolean                                                | true   |
| rowStyle             | 给行附加样式                                           | object \| function(row, rowIndex)                      | -      |
| cellStyle            | 给单元格附加样式                                       | object \| function(row, column, rowIndex, columnIndex) | -      |
| spanMethod           | 合并行或列的计算方法                                   | function({row, column, rowIndex, columnIndex})         | -      |
| rowDraggable         | 是否开启列表数据拖拽排序                               | boolean                                                | -      |
| rowSelection         | 列表项是否可选择，[配置项](#rowSelection)              | object                                                 | -      |
| rowHighlight         | 列表行高亮选中，[配置项](#rowHighlight)                | object                                                 | -      |
| expandable           | 展开行配置项，[配置项](#expandable)                    | object                                                 | -      |
| summation            | 表格合计，包含底部合计和分组合计，[配置项](#summation) | array                                                  | -      |
| footRender           | 表格底部自定义渲染                                     | function(columns, tableData, tableFullData): JSX Node  | -      |
| multipleSort         | 是否为多列排序模式                                     | boolean                                                | true   |
| authConfig           | 表格权限配置，[配置项](#authConfig)                    | object                                                 | -      |
| paginationConfig     | 分页参数的详细配置，[配置项](#pagination)              | object                                                 | -      |
| webPagination        | 是否为前端内存分页                                     | boolean                                                | -      |
| scrollPagination     | 是否为滚动分页，滚动条触底后进行分页加载               | boolean                                                | -      |
| showAlert            | 是否显示表格信息                                       | boolean                                                | true   |
| topSpaceAlign        | 顶部按钮插槽的对其方式                                 | left \| right                                          | right  |
| showFullScreen       | 是否显示全屏按钮                                       | boolean                                                | true   |
| showRefresh          | 是否显示刷新按钮                                       | boolean                                                | true   |
| exportExcel          | 导出表格数据，[配置项](#exportExcel)                   | object                                                 | -      |
| tablePrint           | 表格打印，[配置项](#tablePrint)                        | object                                                 | -      |
| showSelectCollection | 是否显示行选合集                                       | boolean                                                | true   |
| showSuperSearch      | 是否显示高级检索                                       | boolean                                                | true   |
| showGroupSummary     | 是否显示分组汇总                                       | boolean                                                | true   |
| showColumnDefine     | 是否显示列定义                                         | boolean                                                | true   |

### 事件

| 事件名称    | 说明                           | 回调参数                                                                                             |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| change      | 分页、排序、筛选变化时触发     | function(pagination, filters, sorter, { currentDataSource: tableData, allDataSource: allTableData }) |
| dataChange  | 表格数据变化时触发             | function(tableData)                                                                                  |
| dataLoaded  | 表格数据加载之后触发           | function(tableData)                                                                                  |
| rowClick    | 行单击事件                     | function(row, column, event)                                                                         |
| rowDblclick | 行双击事件                     | function(row, column, event)                                                                         |
| rowEnter    | 行选中(单选)或行高亮的回车事件 | function(row, event)                                                                                 |
| scrollEnd   | 滚动条滚动至底部时触发         | function(event)                                                                                      |

### 方法

| 方法名称            | 说明                                           | 参数                              | 返回值 |
| ------------------- | ---------------------------------------------- | --------------------------------- | ------ |
| CALCULATE_HEIGHT    | 计算表格高度                                   | -                                 | -      |
| DO_REFRESH          | 刷新表格数据，同时会清空列选中状态             | function(callback)                | -      |
| GET_LOG             | 获取操作记录，非空校验、格式校验、数据操作记录 | -                                 | object |
| GET_FETCH_PARAMS    | 获取表格的查询参数                             | -                                 | object |
| CLEAR_TABLE_DATA    | 清空表格数据                                   | -                                 | -      |
| CLEAR_LOG           | 清空表格操作记录                               | -                                 | -      |
| SCROLL_TO_RECORD    | 滚动到指定数据行                               | function(rowKey)                  | -      |
| SCROLL_TO_COLUMN    | 滚动到指定表格列                               | function(dataIndex)               | -      |
| SELECT_FIRST_RECORD | 选中表格首行，只针对单选类型有效               | -                                 | -      |
| CLEAR_TABLE_FOCUS   | 清空表格焦点                                   | -                                 | -      |
| INSERT_RECORDS      | 插入表格行数据                                 | function(rows \| row)             | -      |
| REMOVE_RECORDS      | 移除表格数据                                   | function(rowKeys \| rows \| row ) | -      |
| FORM_VALIDATE       | 表格中的表单校验                               | -                                 | object |

### column

| 参数         | 说明                                           | 类型                                                       | 默认值 |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------- | ------ |
| dataIndex    | 数据的 key，支持 `a.b.c` 的路径写法，必要参数  | string                                                     | -      |
| title        | 列头显示文字，必要参数                         | string                                                     | -      |
| description  | 列描述信息                                     | string                                                     | -      |
| width        | 列宽度/最小宽度                                | number                                                     | -      |
| fixed        | 列固定（IE 下无效）                            | left \| right                                              | -      |
| colSpan      | 表头列合并,设置为 0 时，不渲染                 | number                                                     | -      |
| align        | 设置列的对齐方式                               | left \| center \| right                                    | left   |
| printFixed   | 打印时，是否固定列                             | boolean                                                    | -      |
| hidden       | 是否隐藏列                                     | boolean                                                    | -      |
| ellipsis     | 超过宽度将自动省略                             | boolean                                                    | -      |
| className    | 列样式类名                                     | string                                                     | -      |
| children     | 内嵌 children，以渲染分组表头                  | array                                                      |        |
| sorter       | 列排序                                         | boolean \| func                                            | -      |
| filter       | 列筛选，[配置项](#filter)                      | object                                                     | -      |
| precision    | 数值类型字段的精度                             | number                                                     | -      |
| formatType   | 字段的格式化类型，[配置项](#formatType)        | string                                                     | -      |
| required     | 可编辑列是否必填                               | boolean                                                    | -      |
| editRender   | 可编辑单元格，返回值请参考 [配置项](#editable) | function(row, column):object                               | -      |
| dictItems    | 数据字典配置，[配置项](#item)                  | array                                                      | -      |
| summation    | 底部合计，[配置项](#columnSummation)           | object                                                     | -      |
| groupSummary | 分组汇总，[配置项](#columnGroupSummary)        | object                                                     | -      |
| headRender   | 表头单元格渲染方法                             | function(column, tableData, tableFullData): JSX Node       | -      |
| render       | 列渲染方法                                     | function(text, row, column, rowIndex, cellIndex): JSX Node | -      |

### fetch

| 参数        | 说明                                                     | 类型                      | 默认值  |
| ----------- | -------------------------------------------------------- | ------------------------- | ------- |
| api         | ajax 接口，必要参数                                      | func                      | -       |
| params      | 接口参数，必要参数                                       | object                    | -       |
| xhrAbort    | 是否取消请求                                             | boolean                   | -       |
| stopToFirst | 是否阻止返回第一页                                       | boolean                   | -       |
| beforeFetch | 执行查询接口的前置钩子，返回 true 执行查询、false 不执行 | function(params): boolean | -       |
| dataKey     | 数据的 key，支持 `a.b.c` 的路径写法                      | string                    | records |
| callback    | 请求的回调，参数是服务端返回的数据                       | function(response)        | -       |

### filter

| 参数  | 说明                                        | 类型   | 默认值 |
| ----- | ------------------------------------------- | ------ | ------ |
| type  | 列筛选类型，[配置项](#filterType)，必要参数 | string | -      |
| items | 筛选列表项，[配置项](#item)                 | array  | -      |

### filterType

| 参数     | 说明                       |
| -------- | -------------------------- |
| text     | 文本输入框                 |
| textarea | 文本域，多条件用 逗号 隔开 |
| checkbox | 复选框                     |
| radio    | 单选按钮                   |
| number   | 数值输入框                 |
| date     | 日期类型                   |

### editable

| 参数     | 说明                                          | 类型                            | 默认值 |
| -------- | --------------------------------------------- | ------------------------------- | ------ |
| type     | 可编辑类型，[配置项](#editType)，必要参数     | string                          | -      |
| items    | 下拉框的列表项，[配置项](#item)               | array                           | -      |
| editable | 是否可编辑                                    | boolean                         | -      |
| disabled | 是否禁用编辑功能，且禁止切换                  | boolean                         | -      |
| extra    | 可编辑表单的额外配置项，[配置项](#extra)      | object                          | -      |
| helper   | 可编辑单元格搜索帮助配置项，[配置项](#helper) | object                          | -      |
| rules    | 表单校验规则，数组值请参考[配置项](#rule)     | array                           | -      |
| onInput  | 表单的 input 事件                             | function(cell, row)             | -      |
| onChange | 表单的 change 事件                            | function(cell, row)             | -      |
| onEnter  | 表单的 enter 事件                             | function(cell, row)             | -      |
| onClick  | 搜索帮助的单击事件，只对 search-helper 有效   | Function，[参数列表](#shParams) | -      |

### editType

| 参数            | 说明          |
| --------------- | ------------- |
| text            | 文本输入框    |
| number          | 数值输入框    |
| select          | 单选下拉框    |
| select-multiple | 多选下拉框    |
| checkbox        | 复选框        |
| switch          | 开关          |
| search-helper   | 搜索帮助      |
| date            | 日期类型      |
| datetime        | 日期-时间类型 |
| time            | 时间类型      |

### shParams

| 参数   | 说明                                   | 类型                        | 默认值 |
| ------ | -------------------------------------- | --------------------------- | ------ |
| cell   | 单元格的值                             | object                      | -      |
| row    | 行数据                                 | object                      | -      |
| column | 列配置                                 | object                      | -      |
| cb     | 回调函数，设置单元格的值并触发表单校验 | function(cellValue, others) | -      |
| event  | 单击事件的事件对象                     | object                      | -      |

### formatType

| 参数              | 说明          |
| ----------------- | ------------- |
| date              | 日期类型      |
| datetime          | 日期-时间类型 |
| percent           | 百分数        |
| finance           | 金融格式      |
| secret-name       | 姓名保密      |
| secret-phone      | 电话保密      |
| secret-IDnumber   | 身份证保密    |
| secret-bankNumber | 银行卡保密    |

### item

| 参数  | 说明         | 类型             | 默认值 |
| ----- | ------------ | ---------------- | ------ |
| text  | 列表项的文本 | string           | -      |
| value | 列表项的值   | string \| number | -      |

### extra

| 参数        | 说明                                 | 类型             | 默认值 |
| ----------- | ------------------------------------ | ---------------- | ------ |
| maxlength   | 最大长度                             | number           | -      |
| max         | 最大值                               | number           | -      |
| min         | 最小值                               | number           | 0      |
| readonly    | 是否只读，search-helper 生效         | boolean          | true   |
| trueValue   | 选中的值，checkbox 生效              | string \| number | -      |
| falseValue  | 非选中值，checkbox 生效              | string \| number | -      |
| minDateTime | 最小日期，小于该时间的日期段将被禁用 | string           | -      |
| maxDateTime | 最大日期，大于该时间的日期段将被禁用 | string           | -      |
| text        | 显示的文本，checkbox 生效            | string           | -      |
| disabled    | 表单禁用状态                         | boolean          | -      |
| clearable   | 是否显示清除按钮                     | boolean          | true   |

### helper

| 参数          | 说明                                                                          | 类型                                         | 默认值 |
| ------------- | ----------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| filters       | 顶部筛选条件配置，参考 TopFilter 组件，必要参数                               | array                                        | -      |
| table         | 列表组件配置，[配置项](#table)，必要参数                                      | array                                        | -      |
| fieldAliasMap | 表单字段与回传数据字段的映射，[配置项](#alias)， 必要参数                     | func                                         | -      |
| beforeOpen    | 打开搜索帮助的前置钩子，若返回 false 或者返回 Promise 且被 reject，则阻止打开 | function(cell, row, column)                  | -      |
| beforeClose   | 关闭搜索帮助的前置钩子，若返回 false 或者返回 Promise 且被 reject，则阻止关闭 | function(searchHelperRow, cell, row, column) | -      |
| closed        | 关闭搜索帮助的后置钩子                                                        | function(row)                                | -      |

### rule

| 参数      | 说明                                      | 类型                         | 默认值 |
| --------- | ----------------------------------------- | ---------------------------- | ------ |
| required  | 是否必填                                  | boolean                      | -      |
| message   | 提示信息                                  | string                       | -      |
| validator | 自定义校验规则，返回值 true，表示通过校验 | function(cellValue): boolean | -      |

### summation

| 参数       | 说明                                         | 类型   | 默认值 |
| ---------- | -------------------------------------------- | ------ | ------ |
| groupItems | 分组小计，[配置项](#groupSubtotal)           | array  | -      |
| fetch      | 从服务端获取底部合计的数据，[配置项](#fetch) | object | -      |

### columnSummation

| 参数                 | 说明                                                | 类型                    | 默认值 |
| -------------------- | --------------------------------------------------- | ----------------------- | ------ |
| sumBySelection       | 是否通过选择列进行合计                              | boolean                 | -      |
| displayWhenNotSelect | 未选择时，显示合计结果                              | boolean                 | -      |
| dataKey              | 服务端合计，合计数据的 key，支持 `a.b.c` 的路径写法 | string                  | -      |
| unit                 | 合计字段的单位                                      | string                  | -      |
| onChange             | 字段合计变化时触发                                  | function(value: number) | -      |

### columnGroupSummary

| 参数    | 说明                                                | 类型   | 默认值 |
| ------- | --------------------------------------------------- | ------ | ------ |
| dataKey | 服务端合计，合计数据的 key，支持 `a.b.c` 的路径写法 | string | -      |
| unit    | 合计字段的单位                                      | string | -      |

### groupSubtotal

| 参数            | 说明                                                                                | 类型   | 默认值 |
| --------------- | ----------------------------------------------------------------------------------- | ------ | ------ |
| dataIndex       | 分组项的字段名，对应 column 的 dataIndex 值，必要参数                               | string | -      |
| titleIndex      | 分组项标题的字段名，如果 dataIndex 设置的不是对应分组项标题字段，则需要设置此参数， | string | -      |
| color           | 小计行的文本颜色                                                                    | string | -      |
| backgroundColor | 小计行的背景颜色                                                                    | string | -      |

### rowSelection

| 参数                  | 说明                                                                  | 类型                                   | 默认值 |
| --------------------- | --------------------------------------------------------------------- | -------------------------------------- | ------ |
| type                  | 选择类型，必要参数                                                    | checkbox \| radio                      | -      |
| selectedRowKeys       | 选中项的 rowKey 数组                                                  | string[]                               | -      |
| hideSelectAll         | 隐藏表头全选勾选框                                                    | boolean                                | -      |
| checkStrictly         | 选择列完全受控（父子数据选中状态不再关联）                            | boolean                                | true   |
| defaultSelectFirstRow | 是否默认选中第一行（单选时生效）                                      | boolean                                | -      |
| filterable            | 是否显示筛选箭头                                                      | boolean                                | true   |
| clearableAfterFetched | 重新检索之后，是否清空已选择列                                        | boolean                                | -      |
| fetchSelectedRows     | 从服务端获取要回显的数据列表，只对后台分页+复选有效，[配置项](#fetch) | object                                 | -      |
| fetchAllRowKeys       | 从服务端获取所有行数据 rowKey 的列表，[配置项](#fetch)                | object                                 | -      |
| disabled              | 是否允许行选择                                                        | function(row): boolean                 | -      |
| onChange              | 选中项发生变化时触发                                                  | function(selectionKeys, selectionRows) | -      |

### rowHighlight

| 参数          | 说明                 | 类型                               | 默认值 |
| ------------- | -------------------- | ---------------------------------- | ------ |
| currentRowKey | 当前高亮行的 rowKey  | string \| number                   | -      |
| disabled      | 是否允许行高亮       | function(row): boolean             | -      |
| onChange      | 高亮行发生变化时触发 | function(highlightKey, currentRow) | -      |

### expandable

| 参数                 | 说明                           | 类型                                 | 默认值 |
| -------------------- | ------------------------------ | ------------------------------------ | ------ |
| defaultExpandAllRows | 默认展开所有行                 | boolean                              | -      |
| expandedRowKeys      | 展开行的 rowKey 数组           | string[]                             | -      |
| rowExpandable        | 是否允许行展开                 | function(row): boolean               | -      |
| expandedRowClassName | 展开行的 className             | string                               | -      |
| expandedRowRender    | 额外的展开行渲染方法，必要参数 | function(row, index): JSX Node       | -      |
| onExpand             | 点击展开图标时触发             | function(expanded, row)              | -      |
| onChange             | 展开的行变化时触发             | function(expandedKeys, expandedRows) | -      |

### pagination

| 参数            | 说明                 | 类型     | 默认值                           |
| --------------- | -------------------- | -------- | -------------------------------- |
| layout          | 分页组件的布局       | string   | prev, pager, next, jumper, sizes |
| currentPage     | 当前页数             | number   | 1                                |
| pageSize        | 每页显示条目个数     | number   | 20                               |
| pagerCount      | 页码按钮的数量       | number   | 7                                |
| pageSizeOptions | 个数选择器的选项列表 | number[] | [10, 20, 30, 40, 50]             |

### authConfig

| 参数  | 说明                                 | 类型   | 默认值 |
| ----- | ------------------------------------ | ------ | ------ |
| fetch | 获取权限的接口，[配置项](#authFetch) | object | -      |

### authFetch

| 参数          | 说明                                                  | 类型   | 默认值 |
| ------------- | ----------------------------------------------------- | ------ | ------ |
| api           | ajax 接口，必要参数                                   | func   | -      |
| params        | 接口参数                                              | object | -      |
| columnDataKey | 列权限的数据路径，值为不可见列 `dataIndex` 组成的数组 | string | -      |
| exportDataKey | 导出权限的数据路径，值为数字 1 或 0                   | string | -      |
| printDataKey  | 打印权限的数据路径，为数字 1 或 0                     | string | -      |

### exportExcel

| 参数      | 说明                                         | 类型    | 默认值                |
| --------- | -------------------------------------------- | ------- | --------------------- |
| fileName  | 导出的文件名，需包含扩展名 xlsx \| csv       | string  | [当前时间字符串].xlsx |
| fetch     | 导出文件的接口(服务端导出)，[配置项](#fetch) | object  | -                     |
| cellStyle | 是否给单元格添加样式                         | boolean | -                     |

### tablePrint

| 参数     | 说明                | 类型    | 默认值 |
| -------- | ------------------- | ------- | ------ |
| showLogo | 是否显示打印单 Logo | boolean | true   |
| showSign | 是否显示签名        | boolean | -      |

### 注意

- 1. 在 Table 中，`dataSource` 和 `columns` 里的数据值都需要指定 `key` 值。对于 `dataSource` 默认将每列数据的 `key` 属性作为唯一的标识。

- 2. 如果你的数据没有这个属性，务必使用 `rowKey` 来指定数据列的主键。若没有指定，控制台会出现缺少 key 的提示，表格组件也会出现各类奇怪的错误。

- 3. 表格支持树形数据的展示，当数据中有 children 字段时会自动展示为树形表格，渲染形表格时，必须要指定 rowKey 且值不能为 index。

```bash
// 比如你的数据主键是 uid
return <qm-table rowKey="uid" />;
// 或
return <qm-table :rowKey="record => record.uid" />;
```
