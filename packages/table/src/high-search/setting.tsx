/*
 * @Author: 焦质晔
 * @Date: 2020-07-12 16:26:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 15:59:35
 */
import { defineComponent } from 'vue';
import localforage from 'localforage';
import { isBracketBalance } from '../filter-sql';
import { hasOwn, createUidKey, createWhereSQL } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { deepToRaw } from '../../../_utils/util';
import { stop } from '../../../_utils/dom';
import { warn } from '../../../_utils/error';
import { useLocale } from '../../../hooks';
import { localeMixin } from '../../../mixins';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IDict, IRecord } from '../table/types';

import config from '../config';

import { CloseCircleIcon, PlusIcon } from '../../../icons';
import Button from '../../../button';
import VTable from '../table';
import Empty from '../../../empty';

export default defineComponent({
  name: 'HighSearchSetting',
  props: ['columns', 'onClose'],
  inject: ['$$table'],
  mixins: [localeMixin] as any,
  emits: ['close'],
  data() {
    Object.assign(this, {
      logicDicts: [
        { value: 'and', text: this.$t('qm.table.highSearch.andText') },
        { value: 'or', text: this.$t('qm.table.highSearch.orText') },
      ],
      fieldDicts: this.columns.filter((column) => !!column.filter).map((x) => ({ value: x.dataIndex, text: x.title })),
    });
    return {
      loading: !1,
      searchColumns: this.createVTableColumns(),
      list: [], // 初始数据
      currentData: [],
      savedItems: [],
      currentKey: '',
      form: {
        name: '',
      },
    };
  },
  computed: {
    highSearchKey(): string {
      return this.$$table.uniqueKey ? `superSearch_${this.$$table.uniqueKey}` : '';
    },
    filterColumns(): IColumn[] {
      return this.columns.filter((column) => !!column.filter);
    },
    query(): string {
      return createWhereSQL(this.currentData);
    },
    confirmDisabled(): boolean {
      return !(this.query && isBracketBalance(this.query));
    },
  },
  watch: {
    currentKey(next: string): void {
      if (next) {
        this.list = this.savedItems.find((x) => x.value === next).list;
      } else {
        this.list = [];
      }
    },
  },
  async created(): Promise<void> {
    if (!this.highSearchKey) return;
    let res = await localforage.getItem(this.highSearchKey);
    if (!res) {
      res = await this.getHighSearchConfig(this.highSearchKey);
      if (Array.isArray(res)) {
        await localforage.setItem(this.highSearchKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      this.savedItems = res;
      this.currentKey = res[0].value;
    }
  },
  methods: {
    createVTableColumns(): IColumn[] {
      return [
        {
          title: this.$t('qm.table.highSearch.operation'),
          dataIndex: '__action__',
          fixed: 'left',
          width: 80,
          render: (text, row) => {
            return (
              <div>
                <Button
                  type="text"
                  onClick={() => {
                    this.$refs[`search`].REMOVE_RECORDS(row);
                  }}
                >
                  {this.$t('qm.table.highSearch.removeText')}
                </Button>
              </div>
            );
          },
        },
        {
          title: this.$t('qm.table.highSearch.bracket'),
          dataIndex: 'bracket_left',
          align: 'right',
          width: 80,
          render: (text, row) => {
            return <span style={{ fontSize: '20px' }}>{text}</span>;
          },
        },
        {
          title: this.$t('qm.table.highSearch.fieldName'),
          dataIndex: 'fieldName',
          required: true,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.fieldDicts,
              rules: [{ required: true, message: this.$t('qm.table.highSearch.noEmpty') }],
              onChange: (cell, row) => {
                let dataIndex = Object.values(cell)[0];
                let filterType = this.filterColumns.find((x) => x.dataIndex === dataIndex)?.filter.type;
                let expressionItems = this.getExpressionHandle(filterType);
                // 重置 字段类型
                row[`fieldType`] = filterType;
                // 重置 运算
                row[`expression`] = dataIndex ? expressionItems[0]?.value : '';
                // 重置 条件值
                row[`condition`] = this.isMultipleSelect(row[`expression`]) ? [] : '';
                // 重置 括号
                if (!dataIndex) {
                  row[`bracket_left`] = row[`bracket_right`] = '';
                }
              },
            };
          },
        },
        {
          title: this.$t('qm.table.highSearch.fieldType'),
          dataIndex: 'fieldType',
          width: 100,
          hidden: true,
        },
        {
          title: this.$t('qm.table.highSearch.expression'),
          dataIndex: 'expression',
          width: 120,
          required: true,
          editRender: (row) => {
            let filterType = this.filterColumns.find((x) => x.dataIndex === row[`fieldName`])?.filter.type;
            return {
              type: 'select',
              editable: true,
              items: this.getExpressionHandle(filterType),
              extra: {
                disabled: !row[`fieldName`],
                clearable: false,
              },
              onChange: (cell, row) => {
                // 重置 条件值
                row[`condition`] = this.isMultipleSelect(row[`expression`]) ? [] : '';
              },
            };
          },
        },
        {
          title: this.$t('qm.table.highSearch.condition'),
          dataIndex: 'condition',
          width: 160,
          editRender: (row) => {
            let column = this.filterColumns.find((x) => x.dataIndex === row[`fieldName`]);
            let filterType = column?.filter.type;
            let dictItems = column?.filter?.items ?? column?.dictItems ?? [];
            return {
              type: this.getConditionType(filterType, this.isMultipleSelect(row[`expression`])),
              editable: true,
              items: dictItems,
              extra: {
                disabled: !row[`fieldName`],
              },
            };
          },
        },
        {
          title: this.$t('qm.table.highSearch.bracket'),
          dataIndex: 'bracket_right',
          width: 80,
          render: (text, row) => {
            return <span style={{ fontSize: '20px' }}>{text}</span>;
          },
        },
        {
          title: this.$t('qm.table.highSearch.logic'),
          dataIndex: 'logic',
          width: 90,
          required: true,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.logicDicts,
              extra: {
                disabled: !row[`fieldName`],
                clearable: false,
              },
            };
          },
        },
      ];
    },
    isMultipleSelect(type: string): boolean {
      return ['in', 'nin'].includes(type);
    },
    getConditionType(type: string, isMultiple: boolean): string {
      let __type__ = '';
      switch (type) {
        case 'number':
          __type__ = 'number';
          break;
        case 'date':
          __type__ = 'date';
          break;
        case 'checkbox':
        case 'radio':
          __type__ = isMultiple ? 'select-multiple' : 'select';
          break;
        case 'text':
        default:
          __type__ = 'text';
          break;
      }
      return __type__;
    },
    getExpressionHandle(type: string): IDict[] {
      let result: IDict[] = [];
      switch (type) {
        case 'date':
        case 'number':
          result = [
            { value: '>', text: this.$t('qm.table.highSearch.gtText') },
            { value: '<', text: this.$t('qm.table.highSearch.ltText') },
            { value: '>=', text: this.$t('qm.table.highSearch.gteText') },
            { value: '<=', text: this.$t('qm.table.highSearch.lteText') },
            { value: '==', text: this.$t('qm.table.highSearch.eqText') },
            { value: '!=', text: this.$t('qm.table.highSearch.neqText') },
          ];
          break;
        case 'checkbox':
        case 'radio':
          result = [
            { value: 'in', text: this.$t('qm.table.highSearch.inText') },
            { value: 'nin', text: this.$t('qm.table.highSearch.ninText') },
            { value: '==', text: this.$t('qm.table.highSearch.eqText') },
            { value: '!=', text: this.$t('qm.table.highSearch.neqText') },
          ];
          break;
        case 'text':
        default:
          result = [
            { value: 'like', text: this.$t('qm.table.highSearch.likeText') },
            { value: '==', text: this.$t('qm.table.highSearch.eqText') },
            { value: '!=', text: this.$t('qm.table.highSearch.neqText') },
          ];
          break;
      }
      return result;
    },
    insertRowsHandle(): void {
      this.$refs[`search`].INSERT_RECORDS({ logic: 'and' });
    },
    toggleBracket(row: IRecord, column: IColumn): void {
      const { dataIndex } = column;
      if (!row[`fieldName`]) return;
      if (dataIndex === 'bracket_left') {
        row[dataIndex] = !row[dataIndex] ? '(' : '';
      }
      if (dataIndex === 'bracket_right') {
        row[dataIndex] = !row[dataIndex] ? ')' : '';
      }
    },
    toggleHandle(key: string): void {
      this.currentKey = key !== this.currentKey ? key : '';
    },
    async saveConfigHandle(): Promise<void> {
      if (!this.highSearchKey) {
        return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
      }
      const title = this.form.name;
      const uuid = createUidKey();
      this.savedItems.push({
        text: title,
        value: uuid,
        list: this.currentData.filter((x) => !!x.fieldName),
      });
      this.currentKey = uuid;
      await localforage.setItem(this.highSearchKey, deepToRaw(this.savedItems));
      await this.saveHighSearchConfig(this.highSearchKey, deepToRaw(this.savedItems));
    },
    async getHighSearchConfig(key: string): Promise<unknown[] | void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {}
    },
    async saveHighSearchConfig(key: string, value: unknown): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {}
    },
    async removeSavedHandle(ev: MouseEvent, key: string): Promise<void> {
      stop(ev);
      if (!key) return;
      const index = this.savedItems.findIndex((x) => x.value === key);
      this.savedItems.splice(index, 1);
      if (key === this.currentKey) {
        this.currentKey = '';
      }
      await localforage.setItem(this.highSearchKey, deepToRaw(this.savedItems));
      await this.saveHighSearchConfig(this.highSearchKey, deepToRaw(this.savedItems));
    },
    confirmHandle(): void {
      const { clearTableFilter, createSuperSearch, fetch } = this.$$table;
      this.loading = !0;
      if (hasOwn(fetch ?? {}, 'xhrAbort')) {
        this.$$table.fetch.xhrAbort = !1;
      }
      clearTableFilter();
      createSuperSearch(this.currentData);
      this.$nextTick(() => this.$$table.$refs[`tableHeader`]?.filterHandle());
      setTimeout(() => this.cancelHandle(), 200);
    },
    cancelHandle(): void {
      this.loading = !1;
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { list, searchColumns, form, savedItems, currentKey, query, confirmDisabled, loading } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const { tableSize } = this.$$table;
    const cls = {
      [`${prefixCls}-super-search__setting`]: true,
      [`${prefixCls}-super-search--small`]: tableSize === 'small',
    };
    return (
      <div class={cls}>
        <div class="main">
          <div class="container">
            <VTable
              ref="search"
              height={300}
              dataSource={list}
              columns={searchColumns}
              showFullScreen={false}
              showFastSearch={false}
              showColumnDefine={false}
              rowKey={(record) => record.index}
              columnsChange={(columns) => (this.searchColumns = columns)}
              onRowClick={this.toggleBracket}
              onDataChange={(tableData) => {
                this.currentData = tableData;
              }}
            >
              <Button type="primary" icon={<PlusIcon />} onClick={this.insertRowsHandle} style={{ marginRight: '-10px' }} />
            </VTable>
            {config.highSearch.showSQL && query && <code class="lang-js">{query}</code>}
          </div>
          <div class="saved line">
            <div class="form-wrap">
              <el-input class="form-item" v-model={form.name} placeholder={t('qm.table.highSearch.configText')} disabled={confirmDisabled} />
              <Button type="primary" disabled={!form.name} style={{ marginLeft: '10px' }} onClick={() => this.saveConfigHandle()}>
                {t('qm.table.highSearch.saveButton')}
              </Button>
            </div>
            <div class="card-wrap">
              <h5 style={{ height: `${config.rowHeightMaps[this.$$table.tableSize]}px` }}>
                <span>{t('qm.table.highSearch.savedSetting')}</span>
              </h5>
              <ul>
                {savedItems.map((x) => (
                  <li key={x.value} class={{ selected: x.value === currentKey }} title={x.text} onClick={() => this.toggleHandle(x.value)}>
                    <span class="title">{x.text}</span>
                    <i class="svgicon close" title={t('qm.table.highSearch.removeText')} onClick={(ev) => this.removeSavedHandle(ev, x.value)}>
                      <CloseCircleIcon />
                    </i>
                  </li>
                ))}
                {!savedItems.length && (
                  <div style={{ padding: '10px' }}>
                    <Empty />
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={() => this.cancelHandle()}>{t('qm.table.highSearch.closeButton')}</Button>
          <Button type="primary" loading={loading} disabled={confirmDisabled} onClick={() => this.confirmHandle()}>
            {t('qm.table.highSearch.searchButton')}
          </Button>
        </div>
      </div>
    );
  },
});
