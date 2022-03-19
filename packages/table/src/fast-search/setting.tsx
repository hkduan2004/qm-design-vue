/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 16:06:46
 */
import { defineComponent } from 'vue';
import { omitBy } from 'lodash-es';
import localforage from 'localforage';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { getCellValue, createUidKey } from '../utils';
import { warn } from '../../../_utils/error';
import { stop } from '../../../_utils/dom';
import { deepToRaw, isEmpty } from '../../../_utils/util';
import { SizeHeight } from '../../../_utils/types';
import { localeMixin } from '../../../mixins';
import config from '../config';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IRecord, IRowKey } from '../table/types';

import { CloseCircleIcon } from '../../../icons';
import { QmMessageBox } from '../../../index';
import Tabs from '../../../tabs';
import TabPane from '../../../tab-pane';
import Form from '../../../form';
import Button from '../../../button';
import Empty from '../../../empty';

type IFilters = Record<string, any>;

const isDate = (value: any) => {
  if (typeof value !== 'string') {
    return false;
  }
  return /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/.test(value as string);
};

export default defineComponent({
  name: 'FastSearchSetting',
  props: ['onClose'],
  emits: ['close'],
  inject: ['$$table'],
  mixins: [localeMixin] as any,
  data() {
    Object.assign(this, {
      curIndex: -1,
      searchState: 'ready',
    });
    return {
      activeName: '1',
      records: [],
      form1Items: [],
      form2Items: [],
      filters: {},
      matchConfig: { case: 0, fullchar: 0 },
      form: {
        name: '',
      },
      savedItems: [],
      currentKey: '',
    };
  },
  computed: {
    fastSearchKey(): string {
      return this.$$table.uniqueKey ? `fastSearch_${this.$$table.uniqueKey}` : '';
    },
    columns(): IColumn[] {
      return this.$$table.flattenColumns
        .filter(
          (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
        )
        .filter((column) => column.filter);
    },
    isDisabled(): boolean {
      return !Object.keys(this.filters).length;
    },
  },
  watch: {
    currentKey(next: string): void {
      if (next) {
        const { filters, config } = this.savedItems.find((x) => x.value === next)!.list;
        this.$refs['form1'].SET_FIELDS_VALUE(filters);
        this.$refs['form2'].SET_FIELDS_VALUE(filters);
        this.filters = filters;
        this.matchConfig = config;
      } else {
        this.clearFilters();
        this.filters = {};
        this.matchConfig = { case: 0, fullchar: 0 };
      }
    },
  },
  created() {
    this.form1Items = this.createFormList([this.columns[0]]);
    this.form2Items = this.createFormList(this.columns.slice(1));
    this.createFastSearchConfig();
  },
  methods: {
    geFormItemType(type: string) {
      let __type__: string;
      switch (type) {
        case 'text':
        case 'textarea':
          __type__ = 'INPUT';
          break;
        case 'number':
          __type__ = 'INPUT_NUMBER';
          break;
        case 'date':
          __type__ = 'DATE';
          break;
        case 'checkbox':
        case 'radio':
          __type__ = 'SELECT';
          break;
        default:
          __type__ = 'INPUT';
          break;
      }
      return __type__;
    },
    createFormList(columns: IColumn[]) {
      return columns
        .filter((x) => x?.dataIndex)
        .map((x) => {
          return {
            type: this.geFormItemType(x.filter!.type),
            fieldName: x.dataIndex,
            label: x.title,
            description: x.description,
            options: {
              dateType: 'exactdate',
              itemList: x.dictItems ?? [],
            },
            onChange: async () => {
              const [_1, data1] = await this.$refs['form1'].GET_FORM_DATA();
              const [_2, data2] = await this.$refs['form2'].GET_FORM_DATA();
              const data = omitBy(Object.assign({}, data1, data2), isEmpty);
              this.filters = data;
            },
          };
        });
    },
    jumpToByRowkey(rowKey: IRowKey, index: number) {
      const { tableBodyRef, pagination, isWebPagination, pagerChangeHandle } = this.$$table;
      if (isWebPagination) {
        const { pageSize } = pagination;
        const pageNumber: number = Math.ceil((index + 1) / pageSize);
        pagerChangeHandle({ currentPage: pageNumber, pageSize });
        tableBodyRef.scrollYToRecord(rowKey);
      } else {
        tableBodyRef.scrollYToRecord(rowKey);
      }
    },
    filterHandle(condition: IFilters) {
      const { allTableData } = this.$$table;
      const results: IRecord[] = [];

      for (let i = 0, len = allTableData.length; i < len; i++) {
        const row = allTableData[i];
        // 假设匹配上了
        let isPass = true;
        for (const key in condition) {
          const { type } = this.columns.find((x) => x.dataIndex === key)!.filter!;
          let val = getCellValue(row, key);
          let bool = true;
          if (type === 'text' || type === 'textarea') {
            const regExp = new RegExp(!this.matchConfig.fullchar ? condition[key] : `^${condition[key]}$`, !this.matchConfig.case ? 'i' : '');
            bool = regExp.test(val);
          } else {
            val = isDate(val) ? val.slice(0, 10) : val;
            bool = val == condition[key];
          }
          // 没有匹配上
          if (!bool) {
            isPass = false;
            break;
          }
        }
        if (isPass) {
          results.push(row);
        }
      }

      return results;
    },
    async doSearch(type: string) {
      if (!Object.keys(this.filters).length) {
        return QmMessageBox.alert(this.$t('qm.table.fastSearch.queryCondition'), this.$t('qm.button.confirmPrompt'), {
          confirmButtonText: this.$t('qm.dialog.confirm'),
        }).catch(() => {});
      }
      if (this.searchState === 'ready') {
        this.searchState = 'stop';
        this.records = this.filterHandle(this.filters);
      }
      if (!this.records.length) {
        this.$$table.highlightKey = '';
        return QmMessageBox.alert(this.$t('qm.table.fastSearch.notMatch'), this.$t('qm.button.confirmPrompt'), {
          confirmButtonText: this.$t('qm.dialog.confirm'),
        }).catch(() => {});
      }
      // 处理索引
      if (type === 'next') {
        this.curIndex = this.curIndex < 0 ? 0 : this.curIndex + 1;
        if (this.curIndex > this.records.length - 1) {
          try {
            await QmMessageBox.confirm(this.$t('qm.table.fastSearch.toTheEnd'), this.$t('qm.button.confirmPrompt'), {
              confirmButtonText: this.$t('qm.dialog.confirm'),
              cancelButtonText: this.$t('qm.dialog.close'),
            });
            this.curIndex = 0;
          } catch (err) {
            this.curIndex = this.records.length - 1;
          }
        }
      }
      if (type === 'prev') {
        this.curIndex = this.curIndex < 0 ? this.records.length - 1 : this.curIndex - 1;
        if (this.curIndex < 0) {
          try {
            await QmMessageBox.confirm(this.$t('qm.table.fastSearch.toStart'), this.$t('qm.button.confirmPrompt'), {
              confirmButtonText: this.$t('qm.dialog.confirm'),
              cancelButtonText: this.$t('qm.dialog.close'),
            });
            this.curIndex = this.records.length - 1;
          } catch (err) {
            this.curIndex = 0;
          }
        }
      }
      // 处理索引 END
      // 树结构会有问题
      const curRecord = this.records[this.curIndex];
      const curRowKey = this.$$table.getRowKey(curRecord, curRecord.index);
      this.jumpToByRowkey(curRowKey, curRecord.index);
      this.$$table.highlightKey = curRowKey;
    },
    clearFilters() {
      this.$refs['form1'].RESET_FORM();
      this.$refs['form2'].RESET_FORM();
    },
    // =======================================================
    async createFastSearchConfig() {
      if (!this.fastSearchKey) return;
      let res = await localforage.getItem(this.fastSearchKey);
      if (!res) {
        res = await this.getFastSearchConfig(this.fastSearchKey);
        if (Array.isArray(res)) {
          await localforage.setItem(this.fastSearchKey, res);
        }
      }
      if (Array.isArray(res) && res.length) {
        this.savedItems = res;
        this.currentKey = res[0].value;
      }
    },
    toggleHandle(key: string) {
      this.currentKey = key !== this.currentKey ? key : '';
    },
    async getFastSearchConfig(key: string) {
      const { global } = this.$DESIGN;
      const fetchFn = global?.['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        // ...
      }
    },
    async saveFastSearchConfig(key: string, value: unknown) {
      const { global } = this.$DESIGN;
      const fetchFn = global?.['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {
        // ...
      }
    },
    async saveConfigHandle() {
      if (!this.fastSearchKey) {
        return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
      }
      const uuid = createUidKey();
      const _savedItems = [
        ...this.savedItems,
        {
          text: this.form.name,
          value: uuid,
          list: {
            filters: this.filters,
            config: this.matchConfig,
          },
        },
      ];
      this.savedItems = _savedItems;
      this.currentKey = uuid;
      this.form.name = '';
      await localforage.setItem(this.fastSearchKey, deepToRaw(_savedItems));
      await this.saveFastSearchConfig(this.fastSearchKey, deepToRaw(_savedItems));
    },
    async removeSavedHandle(ev, key: string) {
      stop(ev);
      if (!key) return;
      const _savedItems = this.savedItems.filter((x) => x.value !== key);
      this.savedItems = _savedItems;
      if (key === this.currentKey) {
        this.currentKey = '';
      }
      await localforage.setItem(this.fastSearchKey, deepToRaw(_savedItems));
      await this.saveFastSearchConfig(this.fastSearchKey, deepToRaw(_savedItems));
    },
  },
  render(): JSXNode {
    const { tableSize } = this.$$table;
    const { form1Items, form2Items, matchConfig, records, form, savedItems, currentKey, isDisabled } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');

    return (
      <div class={`${prefixCls}-fast-search__setting`}>
        <div class={`main`}>
          <div class={`top`}>
            <div class={`container`}>
              <Tabs
                v-model={[this.activeName, 'modelValue']}
                lazyLoad={false}
                extraNode={<span>{t('qm.table.alert.total', { total: records.length })}</span>}
              >
                <TabPane label={t('qm.table.fastSearch.tabPanes.0')} name="1" key="1">
                  <Form ref={'form1'} list={form1Items} cols={1} labelWidth={110} />
                </TabPane>
                <TabPane label={t('qm.table.fastSearch.tabPanes.1')} name="2" key="2">
                  <Form ref={'form2'} list={form2Items} cols={1} labelWidth={110} />
                </TabPane>
              </Tabs>
            </div>
            <div class={`saved line`}>
              <div class="form-wrap">
                <el-input class="form-item" v-model={form.name} placeholder={t('qm.table.highSearch.configText')} disabled={isDisabled} />
                <Button type="primary" disabled={!form.name || isDisabled} style={{ marginLeft: '10px' }} onClick={() => this.saveConfigHandle()}>
                  {t('qm.table.highSearch.saveButton')}
                </Button>
              </div>
              <div class="card-wrap">
                <h5 style={{ height: `${config.rowHeightMaps[this.$$table.tableSize]}px` }}>
                  <span>{t('qm.table.fastSearch.savedSetting')}</span>
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
          <div class={`bottom`}>
            <div>
              <el-checkbox v-model={matchConfig.case} trueLabel={1} falseLabel={0}>
                {t('qm.table.fastSearch.matchCase')}
              </el-checkbox>
              <el-checkbox v-model={matchConfig.fullchar} trueLabel={1} falseLabel={0}>
                {t('qm.table.fastSearch.matchFullchar')}
              </el-checkbox>
            </div>
            <div>
              <Button onClick={() => this.clearFilters()}>{t('qm.table.fastSearch.clear')}</Button>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            height: `${SizeHeight[tableSize] + 20}px`,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
            boxSizing: 'border-box',
          }}
        >
          <qm-button onClick={() => this.$emit('close')}>{t('qm.table.fastSearch.closeButton')}</qm-button>
          <qm-button type="primary" onClick={() => this.doSearch('prev')}>
            {t('qm.table.fastSearch.queryPrev')}
          </qm-button>
          <qm-button type="primary" onClick={() => this.doSearch('next')}>
            {t('qm.table.fastSearch.queryNext')}
          </qm-button>
        </div>
      </div>
    );
  },
});
