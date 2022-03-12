<script lang="tsx">
import { defineComponent, VNode } from 'vue';

// import tableData from '@/mock/tableData';
import PrintTemplate from './print-template.vue';

import { getTableData, getSelectData, getTreeData, getRegionData } from './api/test';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const tableData = [
  {
    id: 1,
    pinpaiId: '1',
    pinpaiText: '大众',
    chexingId: '101',
    chexingText: '轿车',
    chexiId: '1001',
    chexiText: '车系1',
    name: '速腾',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 2,
    pinpaiId: '1',
    pinpaiText: '大众',
    chexingId: '101',
    chexingText: '轿车',
    chexiId: '1001',
    chexiText: '车系1',
    name: '迈腾',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 3,
    pinpaiId: '1',
    pinpaiText: '大众',
    chexingId: '102',
    chexingText: 'SUV',
    chexiId: '1002',
    chexiText: '车系2',
    name: '探岳',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 4,
    pinpaiId: '1',
    pinpaiText: '大众',
    chexingId: '102',
    chexingText: 'SUV',
    chexiId: '1002',
    chexiText: '车系2',
    name: '探歌',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 5,
    pinpaiId: '2',
    pinpaiText: '奥迪',
    chexingId: '101',
    chexingText: '轿车',
    chexiId: '1001',
    chexiText: '车系1',
    name: 'A4L',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 6,
    pinpaiId: '2',
    pinpaiText: '奥迪',
    chexingId: '101',
    chexingText: '轿车',
    chexiId: '1001',
    chexiText: '车系1',
    name: 'A6L',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 7,
    pinpaiId: '2',
    pinpaiText: '奥迪',
    chexingId: '102',
    chexingText: 'SUV',
    chexiId: '1002',
    chexiText: '车系2',
    name: 'Q5L',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
  {
    id: 8,
    pinpaiId: '2',
    pinpaiText: '奥迪',
    chexingId: '102',
    chexingText: 'SUV',
    chexiId: '1002',
    chexiText: '车系2',
    name: 'Q7L',
    p1: 1000,
    p2: 1500,
    p3: 2000,
  },
];

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
      list: tableData,
      formList: [
        {
          type: 'CITY_SELECT',
          label: '条件9',
          fieldName: 'g',
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
            filterAliasMap: () => {
              return ['a1'];
            },
            fieldAliasMap: () => {
              return { z: 'date', code: 'id', z__desc: 'date', d: 'date', d__desc: 'date' };
            },
          },
          style: { width: `calc(100% - 80px)` },
          descOptions: {
            style: { width: '70px' },
          },
          onChange: (val) => {
            console.log(1234, val);
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
          upload: {
            actionUrl: 'http://127.0.0.1:3000/api/design/upload',
            fixedSize: [1.5, 1],
            isCalcHeight: true,
            limit: 1,
            params: {},
          },
        },
        {
          type: 'INPUT',
          fieldName: 'd',
          label: '表单项4',
          style: { width: `calc(100% - 80px)` },
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
      ],
      printDataList: [],
      content: '',
      fetch: {
        api: getTableData,
        params: {},
        dataKey: 'records',
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 120,
          fixed: 'left',
          sorter: true,
          render: (text) => {
            return text !== '' ? text + 1 : '小计';
          },
        },
        {
          title: '品牌',
          dataIndex: 'pinpaiText',
          width: 250,
          sorter: true,
          filter: {
            type: 'text',
          },
        },
        {
          title: '车型',
          dataIndex: 'chexingText',
          width: 250,
          sorter: true,
          filter: {
            type: 'text',
          },
        },
        {
          title: '车系',
          dataIndex: 'chexiText',
          width: 250,
          sorter: true,
          filter: {
            type: 'text',
          },
        },
        {
          title: '名称',
          dataIndex: 'name',
          width: 250,
          sorter: true,
          filter: {
            type: 'text',
          },
        },
        {
          title: '价格1',
          dataIndex: 'p1',
          width: 200,
          align: 'right',
          precision: 2,
          summation: {
            unit: '元',
          },
        },
        {
          title: '价格2',
          dataIndex: 'p2',
          width: 200,
          align: 'right',
          precision: 2,
          summation: {
            unit: '元',
          },
        },
        {
          title: '价格3',
          dataIndex: 'p3',
          width: 200,
          align: 'right',
          precision: 2,
          summation: {
            unit: '元',
          },
        },
      ],
      selection: {
        type: 'checkbox',
        filterable: true,
        selectedRowKeys: this.selectedKeys,
        disabled: (row) => {
          return row.id === 3;
        },
        onChange: (val, rows) => {
          this.selectedKeys = val;
        },
      },
      tablePrint: {
        showLogo: true,
      },
      exportExcel: {
        fileName: '导出文件.xlsx',
      },
      summation: {
        groupItems: [{ dataIndex: 'pinpaiText' }, { dataIndex: 'chexingText' }, { dataIndex: 'chexiText' }],
      },
    };
  },
  mounted() {
    setTimeout(() => {
      this.$refs.qweqwe.SET_FIELDS_VALUE({ a: ['9', '10'], f: '320000,320101,320502,3' });
    }, 2000);
  },
  methods: {
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (this.summation.groupItems.map((x) => x.titleIndex || x.dataIndex).includes(column.dataIndex)) {
        return [row._rowSpan ?? 1, 1];
      }
      return [1, 1];
    },
    clickHandle(k) {
      // this.$refs[`gprint`].DO_PRINT();
      // this.$message.success('asdasd');
      // this.loading = false;
      // this.visible = true;
      this.visible2 = true;

      setTimeout(() => {
        this.$refs.asdasd.DO_CLOSE();
      }, 3000);
    },
    async printHandle3() {
      await sleep(1000);
      let res = [];
      for (let i = 0; i < 2; i++) {
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
  },
  render(): VNode {
    return (
      <>
        <div style="margin: 10px;">
          <qm-form
            ref="qweqwe"
            uniqueKey="jzy_filter"
            formType="search"
            list={this.formList}
            initialValue={{}}
            onFinish={this.finish}
            fieldsChange={(list) => {
              this.formList = list;
            }}
          />
        </div>
        <div style="margin: 10px;">
          <qm-table
            ref="table"
            uniqueKey="jzyDemoTable"
            maxHeight="400px"
            columns={this.columns}
            dataSource={this.list}
            rowKey="id"
            webPagination={true}
            spanMethod={this.spanMethod}
            summation={this.summation}
            rowSelection={this.selection}
            tablePrint={this.tablePrint}
            exportExcel={this.exportExcel}
            columnsChange={(columns) => (this.columns = columns)}
          ></qm-table>
        </div>
        {/* <qm-countup endValue={2020} />
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
      </>
    );
  },
});
</script>

<style lang="scss">
.box {
  border: 1px solid #000;
  height: 300px;
}
</style>
