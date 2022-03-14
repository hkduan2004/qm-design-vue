/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-13 11:49:05
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { merge, get } from 'lodash-es';
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import { noop, isFunction } from '../../_utils/util';
import { useSize, useLocale } from '../../hooks';
import { getParentNode } from '../../_utils/dom';
import { isValidComponentSize } from '../../_utils/validators';
import { warn } from '../../_utils/error';
import { SizeHeight } from '../../_utils/types';
import type { JSXNode, ComponentSize, AnyObject } from '../../_utils/types';

import Spin from '../../spin';
import Form from '../../form';
import Table from '../../table';
import Button from '../../button';

type ISize = ComponentSize | 'default';

type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

const trueNoop = (): boolean => !0;
// tds
const DEFINE: string[] = ['valueName', 'displayName', 'descriptionName'];

export default defineComponent({
  name: 'QmSearchHelper',
  componentName: 'QmSearchHelper',
  inheritAttrs: false,
  emits: ['close'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    uniqueKey: PropTypes.string,
    multiple: PropTypes.bool,
    filters: PropTypes.array.def([]),
    initialValue: PropTypes.object.def({}),
    showFilterCollapse: PropTypes.bool.def(true),
    table: PropTypes.shape({
      fetch: PropTypes.object.isRequired,
      columns: PropTypes.array.def([]),
      rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).def('uid'),
      webPagination: PropTypes.bool.def(false),
    }),
    fieldAliasMap: PropTypes.func.def(noop),
    beforeFetch: PropTypes.func,
    dataIndex: PropTypes.string,
    callback: PropTypes.func,
    name: PropTypes.string, // tds
    fieldsDefine: PropTypes.object.def({}), // tds
    getServerConfig: PropTypes.func, // tds
  },
  data() {
    const { fetch, webPagination = !1 } = this.table;
    return {
      result: null,
      loading: false,
      topFilters: this.createTopFilters(),
      height: 300,
      columns: this.createTableColumns(),
      tableList: [],
      selection: {
        type: !this.multiple ? 'radio' : 'checkbox',
        defaultSelectFirstRow: !0,
        clearableAfterFetched: !this.multiple,
        onChange: this.selectedRowChange,
      },
      fetch: {
        api: fetch.api,
        params: merge({}, fetch.params, this.formatParams(this.initialValue)),
        beforeFetch: fetch.beforeFetch || trueNoop,
        xhrAbort: fetch.xhrAbort || !1,
        dataKey: fetch.dataKey,
      },
      alias: this.fieldAliasMap() || {},
      webPagination,
    };
  },
  computed: {
    disabled(): boolean {
      return !this.result;
    },
  },
  created() {
    this.getHelperConfig();
    this.getTableData();
  },
  mounted() {
    addResizeListener(this.$refs[`search-helper`], this.calcTableHeight);
  },
  beforeUnmount() {
    removeResizeListener(this.$refs[`search-helper`], this.calcTableHeight);
  },
  methods: {
    async getHelperConfig(): Promise<void> {
      if (!this.getServerConfig) return;
      if (!this.name) {
        return warn('SearchHelper', '从服务端获取配置信息的时候，`name` 为必选参数.');
      }
      this.loading = true;
      try {
        const res = await this.getServerConfig({ name: this.name });
        if (res.code === 200) {
          const { data } = res;
          // 设置 topFilters、columns
          this.topFilters = this.createTopFilters(data.filters);
          this.columns = this.createTableColumns(data.columns);
          // 设置 alias
          const target: AnyObject<string> = {};
          for (let key in this.fieldsDefine) {
            if (!DEFINE.includes(key)) continue;
            target[this.fieldsDefine[key]] = data[key];
          }
          this.alias = Object.assign({}, target);
        }
      } catch (e) {}
      this.loading = false;
    },
    createTableColumns(vals: Record<string, unknown>[] = []): Record<string, unknown>[] {
      const { t } = useLocale();
      return [
        {
          title: t('qm.searchHelper.orderIndex'),
          dataIndex: 'pageIndex',
          width: 80,
          render: (text: number): JSXNode => {
            return <span>{text + 1}</span>;
          },
        },
        ...(this.table.columns || []),
        ...vals.map((x) => {
          let dict: IDict[] = x.refListName ? this.createDictList(x.refListName) : [];
          return {
            ...x,
            sorter: true,
            filter: {
              type: x.type ?? 'text',
              items: dict,
            },
            dictItems: dict,
          };
        }),
      ];
    },
    createTopFilters(vals: Record<string, unknown>[] = []): Record<string, unknown>[] {
      return [
        ...(this.filters || []),
        ...vals.map((x) => {
          let option = x.refListName ? { options: { itemList: this.createDictList(x.refListName) } } : null;
          return {
            ...x,
            ...option,
          };
        }),
      ];
    },
    formatParams(val: AnyObject<unknown>): AnyObject<unknown> {
      const { name, getServerConfig, beforeFetch = (k) => k } = this;
      val = beforeFetch(val);
      // tds 搜索条件的参数规范
      if (name && isFunction(getServerConfig)) {
        val = { name, condition: val };
      }
      return val;
    },
    filterChangeHandle(val: AnyObject<unknown>): void {
      const params: AnyObject<unknown> = this.table.fetch?.params ?? {};
      val = this.formatParams(val);
      this.fetch.xhrAbort = !1;
      this.fetch.params = merge({}, params, val);
      // 内存分页，获取数据
      this.getTableData();
    },
    async getTableData(): Promise<void> {
      if (!this.webPagination || !this.fetch.api) return;
      if (!this.fetch.beforeFetch(this.fetch.params) || this.fetch.xhrAbort) return;
      // console.log(`ajax 请求参数：`, this.fetch.params);
      this.loading = true;
      try {
        const res = await this.fetch.api(this.fetch.params);
        if (res.code === 200) {
          this.$refs[`table`].CLEAR_TABLE_DATA();
          this.tableList = Array.isArray(res.data) ? res.data : get(res.data, this.fetch.dataKey) ?? [];
        }
      } catch (err) {}
      this.loading = false;
    },
    collapseHandle(): void {
      this.$nextTick(() => this.calcTableHeight());
    },
    selectedRowChange(keys: string[], rows: AnyObject<any>[]): void {
      this.result = rows.length ? (!this.multiple ? rows[0] : rows) : null;
    },
    dbClickHandle(row: AnyObject<any>): void {
      if (this.multiple) return;
      this.result = row;
      this.confirmHandle();
    },
    rowEnterHandle(row: AnyObject<any>): void {
      if (this.multiple || !row) return;
      this.dbClickHandle(row);
    },
    confirmHandle(): void {
      const tableData = this.createTableData();
      if (this.callback) {
        Array.isArray(tableData) && this.callback(...tableData);
      }
      this.cancelHandle(this.result);
    },
    cancelHandle(data?: AnyObject<any>): void {
      this.$emit('close', false, data, this.alias);
    },
    createDictList(code: string): IDict[] {
      const { global } = this.$DESIGN;
      const dictKey: string = global['dictKey'] || 'dict';
      const $dict: Record<string, IDict[]> = JSON.parse(localStorage.getItem(dictKey) as string) || {};
      let res: IDict[] = [];
      if ($dict && Array.isArray($dict[code])) {
        res = $dict[code].map((x) => ({ text: x.text, value: x.value }));
      }
      return res;
    },
    createTableData(): [unknown, Record<string, unknown>] | void {
      if (!Object.keys(this.alias).length) return;
      let others: Record<string, unknown> = {};
      let current: unknown;
      for (let dataIndex in this.alias) {
        let dataKey: string = this.alias[dataIndex];
        if (dataIndex !== this.dataIndex) {
          others[dataIndex] = this.result[dataKey];
        } else {
          current = this.result[dataKey];
        }
      }
      return [current, others];
    },
    calcTableHeight(): void {
      const dialogOffsetTop = getParentNode(this.$refs[`search-helper`], 'el-dialog')?.offsetTop || 0;
      const containerHeight = window.innerHeight - dialogOffsetTop * 2 - (SizeHeight[this.$size as ISize] + 20) * 2;
      const tableHeight = containerHeight - this.$refs[`top-filter`].$el.offsetHeight - SizeHeight[this.$size as ISize] - 68;
      if (tableHeight === this.height) return;
      this.height = tableHeight;
    },
  },
  render(): JSXNode {
    const {
      size,
      uniqueKey,
      loading,
      initialValue,
      topFilters,
      showFilterCollapse,
      height,
      columns,
      selection,
      tableList,
      fetch,
      webPagination,
      disabled,
    } = this;
    const { t } = useLocale();
    const { $size } = useSize(this.$props);
    const tableProps = !webPagination ? { fetch } : { dataSource: tableList, webPagination: !0 };
    this.$size = $size || 'default';
    return (
      <div ref="search-helper">
        <Spin spinning={loading} tip="Loading...">
          <Form
            ref="top-filter"
            size={size}
            uniqueKey={uniqueKey ? `helper_${uniqueKey}` : uniqueKey}
            formType="search"
            initialValue={initialValue}
            list={topFilters}
            isCollapse={showFilterCollapse}
            isAutoFocus={!1}
            fieldsChange={(list) => {
              this.topFilters = list;
            }}
            onFinish={this.filterChangeHandle}
            onCollapse={this.collapseHandle}
          />
          <Table
            ref="table"
            {...tableProps}
            size={size}
            height={height}
            columns={columns}
            rowKey={this.table.rowKey}
            rowSelection={selection}
            columnsChange={(columns) => (this.columns = columns)}
            onRowEnter={this.rowEnterHandle}
            onRowDblclick={this.dbClickHandle}
          />
          <div style="height: 10px;" />
        </Spin>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            height: `${SizeHeight[this.$size] + 20}px`,
            padding: '10px 15px',
            borderTop: '1px solid #d9d9d9',
            textAlign: 'right',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        >
          <Button onClick={() => this.cancelHandle()}>{t('qm.dialog.close')}</Button>
          <Button type="primary" onClick={() => this.confirmHandle()} disabled={disabled}>
            {t('qm.dialog.confirm')}
          </Button>
        </div>
      </div>
    );
  },
});
