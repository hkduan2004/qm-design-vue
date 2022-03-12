<script lang="tsx">
import { defineComponent, VNode } from 'vue';

import tableData from '@/mock/tableData';
import PrintTemplate from './print-template.vue';

import { getTableData, getTableKeys, getSummationData, getTableAuth, getSelectData, getTreeData, getRegionData } from './api/test';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export default defineComponent({
  name: 'App',
  data() {
    this.templateRender = null;
    this.selectedKeys = [];
    return {
      expand: true,
      loading: false,
      visible: false,
      visible2: false,
      tabName: 'second',
      btnList: [1, 2],
      list: tableData.data.items,
      formList: [
        {
          type: 'CITY_SELECT',
          labelOptions: {
            type: 'SELECT',
            fieldName: 'aa',
            options: {
              itemList: [
                { value: '0', text: '选项1' },
                { value: '1', text: '选项2' },
              ],
            },
          },
          fieldName: 'address',
          options: {
            itemList: [
              {
                text: '浙江省',
                value: '330000',
                children: [{ text: '杭州市', value: '330100', children: [{ text: '清河区', value: '330201' }] }],
              },
              {
                text: '江苏省',
                value: '320000',
                children: [{ text: '苏州市', value: '320101', children: [{ text: '沧浪区', value: '320502' }] }],
              },
            ],
          },
        },
        {
          type: 'REGION_SELECT',
          label: '条件7',
          fieldName: 'f',
          // options: {
          //   itemList: [
          //     {
          //       text: '浙江省',
          //       value: '330000',
          //       children: [{ text: '杭州市', value: '330100', children: [{ text: '清河区', value: '330201' }] }],
          //     },
          //     {
          //       text: '江苏省',
          //       value: '320000',
          //       children: [{ text: '苏州市', value: '320101', children: [{ text: '沧浪区', value: '320502' }] }],
          //     },
          //   ],
          // },
          request: {
            fetchApi: getRegionData,
            fetchStreetApi: getSelectData,
            params: {},
            dataKey: 'records',
            valueKey: 'value',
            textKey: 'text',
          },
        },
        {
          type: 'SEARCH_HELPER',
          label: '条件1',
          fieldName: 'z',
          searchHelper: {
            filters: [
              {
                type: 'INPUT',
                label: '条件1',
                fieldName: 'a1',
              },
              {
                type: 'INPUT',
                label: '条件2',
                fieldName: 'a2',
              },
              {
                type: 'INPUT',
                label: '条件3',
                fieldName: 'a3',
              },
              {
                type: 'INPUT',
                label: '条件4',
                fieldName: 'a4',
              },
            ],
            table: {
              columns: [
                {
                  title: '创建时间',
                  dataIndex: 'date',
                },
                {
                  title: '姓名',
                  dataIndex: 'person.name',
                },
              ],
              rowKey: (record) => record.id,
              fetch: {
                api: getTableData,
                params: {},
                dataKey: 'records',
              },
            },
            closeServerMatch: false,
            filterAliasMap: () => {
              return ['a1'];
            },
            fieldAliasMap: () => {
              return { z: 'date', code: 'id', z__desc: 'date', d__desc: 'date' };
            },
          },
          style: { width: `calc(100% - 80px)` },
          descOptions: {
            style: { width: '70px' },
          },
          onChange: (val, a) => {
            console.log(1234, val, a);
          },
        },
        {
          type: 'MULTIPLE_TREE_SELECT',
          label: '条件6',
          fieldName: 'a',
          request: {
            fetchApi: getTreeData,
            params: {},
            dataKey: 'records',
          },
        },
        {
          type: 'SELECT',
          fieldName: 'b',
          label: '表单项2',
          labelOptions: {
            description: 'asdasd',
          },
          request: {
            fetchApi: getSelectData,
            params: {},
            dataKey: 'records',
            valueKey: 'value',
            textKey: 'text',
          },
        },
        {
          type: 'UPLOAD_IMG',
          fieldName: 'c',
          label: '表单项3',
          hidden: true,
          upload: {
            actionUrl: 'http://127.0.0.1:3000/api/design/upload',
            fixedSize: [1.5, 1],
            isCalcHeight: true,
            limit: 1,
            params: {},
          },
        },
        {
          type: 'INPUT_NUMBER',
          fieldName: 'd',
          label: '表单项4',
          style: { width: `calc(100% - 80px)` },
          options: {
            precision: 2,
            toFinance: true,
          },
          rules: [{ required: true, message: '不能为空' }],
          descOptions: {
            style: { width: '70px' },
          },
          // render: (opt, ctx) => {
          //   const { fieldName } = opt;
          //   return <el-input v-model={ctx.form[fieldName]} />;
          // },
        },
        {
          type: 'DATE',
          fieldName: 'e',
          label: '表单项5',
          options: {
            dateType: 'week',
          },
        },
        {
          type: 'CASCADER',
          fieldName: 'h',
          label: '表单项6',
          options: {
            itemList: [
              {
                text: '浙江省',
                value: '330000',
                children: [{ text: '杭州市', value: '330100', children: [{ text: '清河区', value: '330201' }] }],
              },
              {
                text: '江苏省',
                value: '320000',
                children: [{ text: '苏州市', value: '320101', children: [{ text: '沧浪区', value: '320502' }] }],
              },
            ],
          },
        },
        {
          type: 'IMMEDIATE',
          fieldName: 'ff',
          label: '表单项9',
          request: {
            fetchApi: getTableData,
            params: {
              currentPage: 1,
              pageSize: 20,
            },
            dataKey: 'records',
          },
          options: {
            // columns: [
            //   { dataIndex: 'id', title: '', hidden: true },
            //   { dataIndex: 'date', title: '姓名' },
            //   { dataIndex: 'price', title: '价格' },
            // ],
            itemRender: (item) => {
              const wrapStyle = {
                width: '400px',
                padding: '5px 15px',
                borderBottom: '1px dashed #e8e8e8',
              };
              return (
                <div style={wrapStyle}>
                  <div style="line-height: 1.75;">{item.address}</div>
                  <div style="line-height: 1.75; display: flex; justify-content: space-between;">
                    <span style="color: #f00">￥: 12.00</span>
                    <span>库存: 100</span>
                  </div>
                </div>
              );
            },
            fieldAliasMap: () => {
              return { ff: 'date', fd: 'id' };
            },
          },
          onChange: (val, a) => {
            console.log(123, val, a);
          },
        },
        {
          type: 'INPUT',
          fieldName: 'fd',
          label: '表单项10',
        },
      ],
      printDataList: [],
      content: '',
      fetch: {
        api: getTableData,
        params: {},
        dataKey: 'records',
      },
      summation: {
        fetch: {
          api: getSummationData,
        },
      },
      authConfig: {
        fetch: {
          api: getTableAuth,
          params: { name: 'SPA1001', tableId: 'table1001' },
          columnDataKey: 'fieldNames',
        },
      },
      authConfig2: {
        fetch: {
          api: getTableAuth,
          params: { name: 'SPA1001', formId: 'table1001' },
          dataKey: 'fieldNames',
        },
      },
      sumData: { price: 0 },
      footRender: () => {
        return (
          <div class="tableBottom">
            <el-row gutter={0} class="row--height">
              <el-col span={4}>本页数量:</el-col>
              <el-col span={4}>1388.00</el-col>
              <el-col span={4}>本页进货金额:</el-col>
              <el-col span={4}>11563.50</el-col>
              <el-col span={4}>本页零售金额:</el-col>
              <el-col span={4}>4613.25</el-col>
            </el-row>
            <el-row class="row--height">
              <el-col span={4}>总数量:</el-col>
              <el-col span={4}>4475.00</el-col>
              <el-col span={4}>总进货金额:</el-col>
              <el-col span={4}>101786.80</el-col>
              <el-col span={4}>总零售金额:</el-col>
              <el-col span={4}>26338.55</el-col>
            </el-row>
          </div>
        );
      },
      columns: [
        {
          title: '操作',
          dataIndex: '__action__', // 操作列的 dataIndex 的值不能改
          fixed: 'left',
          width: 100,
          render: (text, row) => {
            return (
              <div>
                <qm-button type="text">编辑</qm-button>
                <qm-button type="text">查看</qm-button>
              </div>
            );
          },
        },
        {
          title: '序号',
          description: '数据索引',
          dataIndex: 'pageIndex',
          printFixed: true,
          width: 80,
          sorter: true,
          render: (text) => {
            return text + 1;
          },
        },
        {
          title: '创建时间',
          dataIndex: 'date',
          width: 220,
          sorter: true,
          filter: {
            type: 'date',
          },
          editRender: (row) => {
            return {
              type: 'datetime',
            };
          },
        },
        {
          title: '个人信息',
          dataIndex: 'person',
          children: [
            {
              title: '姓名',
              dataIndex: 'person.name',
              width: 200,
              required: true,
              sorter: true,
              filter: {
                type: 'text',
              },
              editRender: (row) => {
                const obj = {
                  type: 'search-helper',
                  // editable: true,
                  extra: {
                    readonly: false,
                    maxlength: 10,
                    disabled: row.id === 3,
                  },
                  helper: {
                    filters: [
                      {
                        type: 'INPUT',
                        label: '条件1',
                        fieldName: 'a',
                      },
                    ],
                    table: {
                      columns: [
                        {
                          title: '创建时间',
                          dataIndex: 'date',
                          filter: {
                            type: 'date',
                          },
                        },
                        {
                          title: '姓名',
                          dataIndex: 'person.name',
                        },
                      ],
                      rowKey: (record) => record.id,
                      fetch: {
                        api: getTableData,
                        params: {},
                        dataKey: 'records',
                      },
                    },
                    fieldAliasMap: () => {
                      return { 'person.name': 'date', 'person.age': 'date' };
                    },
                    filterAliasMap: () => {
                      return ['a'];
                    },
                    closed: () => {
                      obj.helper.initialValue = { a: '' };
                    },
                  },
                  rules: [{ required: true, message: '姓名不能为空' }],
                  // onChange: (cellVal, row) => {
                  //   const keys = Object.keys(cellVal)[0].split('|');
                  //   obj.helper.initialValue = { a: '1234' };
                  //   this.$refs.table.OPEN_SEARCH_HELPER(keys[0], keys[1]);
                  // },
                  // onClick: (cell, row, column, cb, ev) => {
                  //   this.tableShProps = Object.assign({}, this.tableShProps, {
                  //     dataIndex: column.dataIndex,
                  //     fieldAliasMap: () => {
                  //       return { 'person.name': 'date', 'person.age': 'date' };
                  //     },
                  //     callback: cb
                  //   });
                  //   this.visible_table = true;
                  // }
                };
                return obj;
              },
            },
            {
              title: '性别',
              dataIndex: 'person.sex',
              width: 100,
              dictItems: [
                { text: '男', value: '1' },
                { text: '女', value: '0' },
              ],
            },
            {
              title: '年龄',
              dataIndex: 'person.age',
              width: 100,
              sorter: true,
              filter: {
                type: 'number',
              },
              // editRender: row => {
              //   return {
              //     type: 'search-helper',
              //     // editable: true,
              //     helper: {
              //       filters: [
              //         {
              //           type: 'INPUT',
              //           label: '条件1',
              //           fieldName: 'a'
              //         }
              //       ],
              //       table: {
              //         columns: [
              //           {
              //             title: '创建时间',
              //             dataIndex: 'date',
              //             filter: {
              //               type: 'date'
              //             }
              //           },
              //           {
              //             title: '姓名',
              //             dataIndex: 'person.name'
              //           }
              //         ],
              //         rowKey: record => record.id,
              //         fetch: {
              //           api: () => {},
              //           params: {},
              //           dataKey: 'items'
              //         }
              //       },
              //       fieldAliasMap: () => {
              //         return { 'person.age': 'date', 'person.name': 'date' };
              //       }
              //     }
              //   };
              // }
            },
          ],
        },
        {
          title: '价格',
          dataIndex: 'price',
          width: 150,
          precision: 2,
          required: true,
          sorter: true,
          groupSummary: {},
          filter: {
            type: 'number',
          },
          editRender: (row) => {
            return {
              type: 'number',
              extra: {
                max: 1000,
              },
              rules: [{ required: true, message: '价格不能为空' }],
            };
          },
        },
        {
          title: '数量',
          dataIndex: 'num',
          width: 150,
          required: true,
          sorter: true,
          // summation: {
          //   dataKey: 'num',
          //   unit: '个',
          // },
          groupSummary: {},
          filter: {
            type: 'number',
          },
          editRender: (row) => {
            return {
              type: 'number',
              extra: {
                max: 1000,
              },
              rules: [{ required: true, message: '数量不能为空' }],
            };
          },
        },
        {
          title: '总价',
          dataIndex: 'total',
          width: 150,
          precision: 2,
          align: 'right',
          sorter: true,
          groupSummary: {},
          filter: {
            type: 'number',
          },
          // summation: {
          //   sumBySelection: true,
          //   unit: '元',
          // },
          render: (text, row) => {
            row.total = row.price * row.num;
            return <span>{row.total.toFixed(2)}</span>;
          },
        },
        {
          title: '是否选择',
          dataIndex: 'choice',
          align: 'center',
          width: 150,
          editRender: (row) => {
            return {
              type: 'checkbox',
              editable: true,
              extra: {
                trueValue: 1,
                falseValue: 0,
                disabled: true,
              },
            };
          },
          dictItems: [
            { text: '选中', value: 1 },
            { text: '非选中', value: 0 },
          ],
        },
        {
          title: '状态',
          dataIndex: 'state',
          // colSpan: 2,
          width: 150,
          filter: {
            type: 'radio',
            items: [
              { text: '已完成', value: 1 },
              { text: '进行中', value: 2 },
              { text: '未完成', value: 3 },
            ],
          },
          sorter: true,
          headRender: (column, tableData) => {
            const { dataIndex, title } = column;
            const changeHandle = (val) => {
              tableData.forEach((x) => {
                x[dataIndex] = val;
              });
            };
            return (
              <el-select v-model={this.theadData.state} placeholder={title} clearable onChange={changeHandle}>
                {[
                  { text: '已完成', value: 1 },
                  { text: '进行中', value: 2 },
                  { text: '未完成', value: 3 },
                ].map((x) => (
                  <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
                ))}
              </el-select>
            );
          },
          editRender: (row) => {
            return {
              type: 'select',
              items: [
                { text: '已完成', value: 1 },
                { text: '进行中', value: 2 },
                { text: '未完成', value: 3 },
              ],
            };
          },
          dictItems: [
            { text: '已完成', value: 1 },
            { text: '进行中', value: 2 },
            { text: '未完成', value: 3 },
          ],
        },
        {
          title: '业余爱好',
          dataIndex: 'hobby',
          // colSpan: 0,
          width: 150,
          filter: {
            type: 'checkbox',
            items: [
              { text: '篮球', value: 1 },
              { text: '足球', value: 2 },
              { text: '乒乓球', value: 3 },
              { text: '游泳', value: 4 },
            ],
          },
          editRender: (row) => {
            return {
              type: 'select-multiple',
              items: [
                { text: '篮球', value: 1 },
                { text: '足球', value: 2 },
                { text: '乒乓球', value: 3 },
                { text: '游泳', value: 4 },
              ],
            };
          },
          dictItems: [
            { text: '篮球', value: 1 },
            { text: '足球', value: 2 },
            { text: '乒乓球', value: 3 },
            { text: '游泳', value: 4 },
          ],
        },
        {
          title: '地址',
          dataIndex: 'address',
          width: 200,
          filter: {
            type: 'textarea',
          },
          editRender: (row) => {
            return {
              type: 'text',
            };
          },
        },
      ],
      theadData: {
        state: '',
      },
      selection: {
        type: 'checkbox',
        filterable: true,
        selectedRowKeys: this.selectedKeys,
        fetchAllRowKeys: {
          api: getTableKeys,
          dataKey: 'recordKeys',
        },
        disabled: (row) => {
          return row.id === 3;
        },
        onChange: (val, rows) => {
          console.log(12, val);
          this.selectedKeys = val;
        },
      },
      tablePrint: {
        showLogo: true,
      },
      exportExcel: {
        fileName: '导出文件.xlsx',
      },
      locale: 'zh-cn',
      size: 'small',
      height: 300,
      formType: 'search',
    };
  },
  mounted() {
    setTimeout(() => {
      this.sumData = { price: 900 };
      this.$refs.qweqwe.SET_FIELDS_VALUE({ a: ['9', '10'], f: '320000,320101,320502,3' });
    }, 2000);
  },
  methods: {
    clickHandle(k) {
      // this.$refs[`gprint`].DO_PRINT();
      // this.$message.success('asdasd');
      // this.loading = false;
      this.visible = true;
      this.locale = this.locale === 'zh-cn' ? 'en' : 'zh-cn';
      this.size = 'small';
      // this.formList.find((x) => x.fieldName === 'z').searchHelper = undefined;
      // setTimeout(() => {
      //   this.$refs.asdasd.DO_CLOSE();
      // }, 3000);

      this.height = 400;
      this.columns.find((x) => x.dataIndex === 'pageIndex').hidden = true;
    },
    async printHandle3() {
      await sleep(1000);
      let res = [];
      for (let i = 0; i < 50; i++) {
        res[i] = i;
      }
      this.templateRender = PrintTemplate;
      this.printDataList = res;
    },
    async beforeLeave() {
      await sleep(1000);

      // new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     reject();
      //   }, 1000);
      // })
      //   .then(() => {
      //     console.log('成功');
      //   })
      //   .catch(() => {
      //     console.log('失败2');
      //   });

      // Promise.reject()
      //   .then(() => {
      //     console.log('成功');
      //   })
      //   .catch(() => {
      //     console.log('失败2');
      //   });

      // 注意
      // new Promise((resolve, reject) => reject()) === Promise.reject()

      return Promise.reject();
    },
    finish(val) {
      console.log(val);
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (column.dataIndex === 'date') {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
    asdasd() {
      this.formType = this.formType === 'search' ? 'onlyShow' : 'search';
    },
    collapse() {
      this.$refs[`table`].CALCULATE_HEIGHT();
    },
  },
  render(): VNode {
    return (
      <qm-config-provider size={'small'} locale={this.locale}>
        <qm-button confirm={{}} click={this.clickHandle}>
          按钮
        </qm-button>
        <qm-print uniqueKey="cprint_jzy" dataSource={this.printDataList} templateRender={this.templateRender} click={this.printHandle3}>
          客户端打印
        </qm-print>
        <qm-button onClick={this.asdasd}>按钮</qm-button>
        <div style="margin: 10px;">
          <qm-form
            ref="qweqwe"
            uniqueKey="jzy_filter"
            formType={this.formType}
            list={this.formList}
            initialValue={{ aa: '0', d: 123123 }}
            // authConfig={this.authConfig2}
            onFinish={this.finish}
            onCollapse={this.collapse}
            fieldsChange={(list) => {
              this.formList = list;
            }}
          />
        </div>
        <div style="margin: 0 10px;">
          <qm-table
            ref="table"
            uniqueKey="jzyDemoTable"
            height={'auto'}
            stripe={true}
            columns={this.columns}
            fetch={this.fetch}
            rowKey={(row) => row.id}
            scrollPagination={true}
            footRender={this.footRender}
            spanMethod={this.spanMethod}
            rowSelection={this.selection}
            authConfig={this.authConfig}
            summation={this.summation}
            tablePrint={this.tablePrint}
            exportExcel={this.exportExcel}
            columnsChange={(columns) => (this.columns = columns)}
          ></qm-table>
        </div>
        <qm-drawer v-model={[this.visible, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">
            <qm-form
              uniqueKey="jzy_filter"
              formType={this.formType}
              list={this.formList}
              initialValue={{ aa: '0', d: 123123 }}
              // authConfig={this.authConfig2}
              onFinish={this.finish}
              onCollapse={this.collapse}
              fieldsChange={(list) => {
                this.formList = list;
              }}
            />
          </div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-drawer>
        {/* <qm-split direction="horizontal" style="height: 300px" initialValue="30%" uniqueKey="asdasd">
          <qm-split-pane min={200}>asdasd</qm-split-pane>
          <qm-split-pane min={150}>zxczxc</qm-split-pane>
        </qm-split>
        <qm-countup endValue={2020} />
        <qm-split direction="vertical" style="height: 300px">
          <qm-split-pane>asdasd</qm-split-pane>
          <qm-split-pane>zxczxc</qm-split-pane>
        </qm-split>
        <qm-space spacer={'|'} size={20}>
          {this.btnList.map((x) => (
            <qm-button
              class="asd"
              confirm={{
                onConfirm: () => {},
              }}
              click={this.clickHandle.bind(this, x)}
            >
              按钮
            </qm-button>
          ))}
          <qm-print uniqueKey="cprint_jzy" dataSource={this.printDataList} templateRender={this.templateRender} click={this.printHandle3}>
            客户端打印
          </qm-print>
        </qm-space>
        <qm-form
          uniqueKey="jzy_filter"
          formType="search"
          list={this.formList}
          initialValue={{}}
          onFinish={this.finish}
          fieldsChange={(list) => {
            this.formList = list;
          }}
        ></qm-form>
        <qm-anchor
          style="height: 100px"
          labelList={[
            { id: 'aaa', label: '标题1' },
            { id: 'bbb', label: '标题2' },
          ]}
        >
          <div id="aaa" style="height: 200px">
            1
          </div>
          <div id="bbb" style="height: 200px">
            2
          </div>
        </qm-anchor>
        <qm-tabs
          v-model={this.tabName}
          extraNode="asdasd"
          onChange={(name) => {
            console.log(11, name);
          }}
        >
          <div>asd</div>
          <qm-tab-pane label="用户管理" name="first">
            用户管理1
          </qm-tab-pane>
          <qm-tab-pane label="配置管理" name="second">
            配置管理2
          </qm-tab-pane>
          <qm-tab-pane label="角色管理" name="third">
            角色管理3
          </qm-tab-pane>
        </qm-tabs>
        <qm-divider v-model={[this.expand, 'collapse']} label="标题名称" extra="asdasdasdasdasd"></qm-divider>
        <qm-tinymce v-model={this.content} />
        <qm-spin spinning={this.loading} tip="Loading...">
          <qm-anchor style="height: 400px">
            <qm-anchor-item label="标题名称">
              <div class="box">内容1</div>
            </qm-anchor-item>
            <qm-anchor-item label="页签名称">
              <div class="box">内容2</div>
            </qm-anchor-item>
            <qm-anchor-item label="导航名称">
              <div class="box">内容3</div>
            </qm-anchor-item>
          </qm-anchor>
        </qm-spin>
        <qm-drawer v-model={[this.visible, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-drawer>
        <qm-dialog v-model={[this.visible2, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-dialog>
        <qm-print-group ref="gprint">
          <qm-print-item label="打印1" dataSource={[1]} templateRender={PrintTemplate} />
          <qm-print-item label="打印2" dataSource={[]} templateRender={PrintTemplate} />
        </qm-print-group> */}
      </qm-config-provider>
    );
  },
});
</script>

<style lang="scss">
.box {
  border: 1px solid #000;
  height: 300px;
}
.tableBottom {
  .el-col {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border-right: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    &:nth-child(2n) {
      background-color: #fff;
    }
  }
}
</style>
