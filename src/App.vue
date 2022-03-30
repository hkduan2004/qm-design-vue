<script lang="tsx">
import { defineComponent, VNode } from 'vue';

import tableData from '@/mock/tableData';
import PrintTemplate from './print-template.vue';

import { flatToTree } from '../packages/table/src/utils';

import { getTableData, getTableKeys, getSummationData, getTableAuth, getSelectData, getTreeData, getRegionData } from './api/test';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const demoList = [
  { id: 110000, parentId: null, name: 'vxe-table test abc1', type: 'mp3', size: 1024, date: '2020-08-01' },
  { id: 111000, parentId: 110000, name: 'vxe-table test abc2', type: 'html', size: 600, date: '2021-04-01' },
  { id: 111100, parentId: 111000, name: 'vxe-table test abc3', type: 'html', size: 600, date: '2021-04-01' },
  { id: 111110, parentId: 111100, name: 'vxe-table test abc4', type: 'html', size: 600, date: '2021-04-01' },
  { id: 111111, parentId: 111110, name: 'vxe-table test abc5', type: 'html', size: 600, date: '2021-04-01' },
  { id: 111112, parentId: 111110, name: 'vxe-table test abc6', type: 'html', size: 600, date: '2021-04-01' },
  { id: 120000, parentId: null, name: 'Test7', type: 'mp4', size: null, date: '2021-04-01' },
  { id: 121000, parentId: 120000, name: 'Test8', type: 'avi', size: 1024, date: '2020-03-01' },
  { id: 121100, parentId: 121000, name: 'vxe-table test abc9', type: 'html', size: 600, date: '2021-04-01' },
  { id: 121200, parentId: 121000, name: 'vxe-table test abc10', type: 'avi', size: null, date: '2021-04-01' },
  { id: 121300, parentId: 121000, name: 'vxe-table test abc11', type: 'txt', size: 25, date: '2021-10-01' },
  { id: 121310, parentId: 121300, name: 'Test12', type: 'pdf', size: 512, date: '2020-01-01' },
  { id: 121320, parentId: 121310, name: 'Test13', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 130000, parentId: null, name: 'Test14', type: 'xlsx', size: 2048, date: '2020-11-01' },
  { id: 140000, parentId: null, name: 'vue 从入门到精通15', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 141000, parentId: 140000, name: 'Test16', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 142000, parentId: 140000, name: 'Test17', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 143000, parentId: 140000, name: 'Test78', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 150000, parentId: null, name: 'vue 从入门到精通19', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 160000, parentId: null, name: 'vue 从入门到精通20', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 161000, parentId: 160000, name: 'Test21', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 162000, parentId: 160000, name: 'Test22', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163000, parentId: 160000, name: 'Test23', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163100, parentId: 164000, name: 'Test24', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163200, parentId: 164000, name: 'Test25', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163300, parentId: 164000, name: 'Test26', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163400, parentId: 164000, name: 'Test27', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163500, parentId: 164000, name: 'Test28', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 163600, parentId: 164000, name: 'vxe-table test abc29', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164000, parentId: 160000, name: 'Test30', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164100, parentId: 164000, name: 'Test31', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164200, parentId: 164000, name: 'Test32', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164300, parentId: 164000, name: 'vxe-table test abc33', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164400, parentId: 164000, name: 'Test34', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164500, parentId: 164000, name: 'Test35', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164600, parentId: 164000, name: 'Test36', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164700, parentId: 164000, name: 'Test37', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164800, parentId: 164000, name: 'Test38', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 164900, parentId: 164000, name: 'vxe-table test abc40', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 165000, parentId: 160000, name: 'Test41', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 166000, parentId: 160000, name: 'Test42', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 167000, parentId: 160000, name: 'Test43', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 168000, parentId: 160000, name: 'Test44', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 169000, parentId: 160000, name: 'Test45', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 170000, parentId: null, name: 'vue 从入门到精通46', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 180000, parentId: null, name: 'vue 从入门到精通47', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 181000, parentId: 180000, name: 'Test48', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 182000, parentId: 180000, name: 'Test49', type: 'js', size: 1024, date: '2021-06-14' },
  { id: 184000, parentId: 180000, name: 'Test50', type: 'js', size: 1024, date: '2021-06-23' },
  { id: 185000, parentId: 180000, name: 'Test51', type: 'js', size: 1024, date: '2021-06-11' },
  { id: 186000, parentId: 180000, name: 'Test52', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 190000, parentId: null, name: 'vue 从入门到精通53', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 191000, parentId: 190000, name: 'Test54', type: 'js', size: 1024, date: '2021-06-04' },
  { id: 192000, parentId: 190000, name: 'Test55', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 193000, parentId: 190000, name: 'Test56', type: 'js', size: 1024, date: '2021-06-03' },
  { id: 194000, parentId: 190000, name: 'Test57', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 200000, parentId: null, name: 'vue 从入门到精通58', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 201000, parentId: 200000, name: 'Test59', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 202000, parentId: 200000, name: 'Test60', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 203000, parentId: 200000, name: 'Test61', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 204000, parentId: 200000, name: 'Test62', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 205000, parentId: 200000, name: 'Test63', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 206000, parentId: 200000, name: 'Test64', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 210000, parentId: null, name: 'vue 从入门到精通65', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 220000, parentId: null, name: 'vue 从入门到精通66', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 230000, parentId: null, name: 'vxe-table test abc67', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 240000, parentId: null, name: 'vue 从入门到精通68', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 250000, parentId: null, name: 'vue 从入门到精通69', type: 'avi', size: 224, date: '2020-01-01' },
  { id: 251000, parentId: 250000, name: 'Test70', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 252000, parentId: 250000, name: 'Test71', type: 'js', size: 1024, date: '2021-08-02' },
  { id: 253000, parentId: 250000, name: 'Test72', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254000, parentId: 250000, name: 'Test73', type: 'js', size: 1024, date: '2021-06-03' },
  { id: 254100, parentId: 254000, name: 'Test74', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254200, parentId: 254000, name: 'vxe-table test abc75', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254300, parentId: 254000, name: 'Test76', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254310, parentId: 254300, name: 'Test76', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254320, parentId: 254300, name: 'Test78', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254321, parentId: 254320, name: 'Test79', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254322, parentId: 254320, name: 'Test80', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254323, parentId: 254320, name: 'vxe-table test abc81', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254324, parentId: 254320, name: 'Test82', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254325, parentId: 254320, name: 'Test83', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254326, parentId: 254320, name: 'Test84', type: 'js', size: 1024, date: '2021-06-07' },
  { id: 254327, parentId: 254320, name: 'Test85', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254330, parentId: 254300, name: 'Test86', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254340, parentId: 254300, name: 'vxe-table test abc87', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254350, parentId: 254300, name: 'Test88', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254360, parentId: 254300, name: 'Test89', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254370, parentId: 254300, name: 'vxe-table test abc90', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254400, parentId: 254000, name: 'Test91', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254500, parentId: 254000, name: 'Test92', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 254600, parentId: 254000, name: 'vxe-table test abc93', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 255000, parentId: 250000, name: 'Test94', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 256000, parentId: 250000, name: 'Test95', type: 'js', size: 1024, date: '2021-06-08' },
  { id: 257000, parentId: 250000, name: 'Test96', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 258000, parentId: 250000, name: 'Test97', type: 'js', size: 1024, date: '2021-06-01' },
  { id: 260000, parentId: null, name: 'vue 从入门到精通98', type: 'avi', size: 224, date: '2020-10-06' },
  { id: 261000, parentId: 260000, name: 'vue 从入门到精通99', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 261100, parentId: 261000, name: 'vue 从入门到精通100', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 261200, parentId: 261000, name: 'vue 从入门到精通101', type: 'avi', size: 224, date: '2020-10-04' },
  { id: 262000, parentId: 260000, name: 'vue 从入门到精通102', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 262100, parentId: 262000, name: 'vxe-table test abc103', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 262200, parentId: 262000, name: 'vue 从入门到精通104', type: 'avi', size: 224, date: '2020-10-03' },
  { id: 262300, parentId: 262000, name: 'vue 从入门到精通105', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 263000, parentId: 260000, name: 'vue 从入门到精通106', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 264000, parentId: 260000, name: 'vxe-table test abc107', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 270000, parentId: null, name: 'vue 从入门到精通108', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 280000, parentId: null, name: 'vue 从入门到精通109', type: 'avi', size: 224, date: '2020-09-01' },
  { id: 290000, parentId: null, name: 'vxe-table test abc110', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 300000, parentId: null, name: 'vue 从入门到精通111', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 310000, parentId: null, name: 'vue 从入门到精通112', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 320000, parentId: null, name: 'vue 从入门到精通113', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 321000, parentId: 320000, name: 'vue 从入门到精通114', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 322000, parentId: 320000, name: 'vue 从入门到精通115', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 323000, parentId: 320000, name: 'vue 从入门到精通116', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 324000, parentId: 320000, name: 'vue 从入门到精通117', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 325000, parentId: 320000, name: 'vxe-table test abc118', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 326000, parentId: 320000, name: 'vue 从入门到精通119', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 327000, parentId: 320000, name: 'vue 从入门到精通120', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 328000, parentId: 320000, name: 'vue 从入门到精通121', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329000, parentId: 320000, name: 'vue 从入门到精通122', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329100, parentId: 329000, name: 'vxe-table test abc123', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329200, parentId: 329000, name: 'vue 从入门到精通124', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329300, parentId: 329000, name: 'vue 从入门到精通125', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329400, parentId: 329000, name: 'vue 从入门到精通125', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329500, parentId: 329000, name: 'vue 从入门到精通126', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329600, parentId: 329000, name: 'vue 从入门到精通127', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329700, parentId: 329000, name: 'vue 从入门到精通128', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329800, parentId: 329000, name: 'vue 从入门到精通129', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329810, parentId: 329800, name: 'vxe-table test abc130', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329820, parentId: 329800, name: 'vue 从入门到精通131', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329830, parentId: 329800, name: 'vue 从入门到精通132', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 329840, parentId: 329800, name: 'vue 从入门到精通133', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 330000, parentId: null, name: 'vue 从入门到精通134', type: 'avi', size: 224, date: '2020-10-01' },
  { id: 331000, parentId: null, name: 'vue 从入门到精通135', type: 'avi', size: 224, date: '2020-10-01' },
];

for (let i = 1; i < 10000; i++) {
  demoList.push({ id: i, parentId: 121310, name: 'Test13', type: 'js', size: 1024, date: '2021-06-01' });
}

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
      list: flatToTree(demoList, 'id', 'parentId'),
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
          label: '条件123',
          fieldName: 'zz',
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
              return { zz: 'date', code: 'id', z__desc: 'date', d: 'date', d__desc: 'date' };
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
          type: 'MULTIPLE_SEARCH_HELPER',
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
              return { textKey: 'date', valueKey: 'id' };
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
          title: '序号',
          description: '数据索引',
          dataIndex: 'pageIndex',
          printFixed: true,
          width: 150,
          sorter: true,
          render: (text) => {
            return text + 1;
          },
        },
        {
          title: 'Name',
          dataIndex: 'name',
          width: 200,
          editRender: (row) => {
            return {
              type: 'text',
            };
          },
        },
        {
          title: 'Size',
          dataIndex: 'size',
          width: 150,
        },
        {
          title: 'Type',
          dataIndex: 'type',
          width: 150,
        },
        {
          title: 'Date',
          dataIndex: 'date',
          width: 1500,
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
      <qm-config-provider size={'default'} locale={this.locale}>
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
            height={350}
            columns={this.columns}
            dataSource={this.list}
            rowKey={(row) => row.id}
            treeConfig={{
              virtual: true,
            }}
            rowSelection={{
              type: 'checkbox',
            }}
            expandable={{
              defaultExpandAllRows: true,
            }}
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
