/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 16:19:58
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 15:58:38
 */
import { defineComponent } from 'vue';
import localforage from 'localforage';
import { createUidKey } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { deepToRaw } from '../../../_utils/util';
import { stop } from '../../../_utils/dom';
import { warn } from '../../../_utils/error';
import { useLocale } from '../../../hooks';
import { localeMixin } from '../../../mixins';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IDict } from '../table/types';

import config from '../config';

import { CloseCircleIcon, PlusIcon } from '../../../icons';
import Button from '../../../button';
import VTable from '../table';
import Dialog from '../../../dialog';
import Empty from '../../../empty';
import GroupSummaryResult from './result';

export default defineComponent({
  name: 'GroupSummarySetting',
  props: ['columns', 'onClose'],
  inject: ['$$table'],
  mixins: [localeMixin] as any,
  emits: ['close'],
  data() {
    Object.assign(this, {
      // 分组项 字典
      groupItems: this.columns.filter((x) => !x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex })),
      // 汇总列 字典
      summaryItems: [config.groupSummary.total, ...this.columns.filter((x) => !!x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex }))],
      // 计算公式 字典
      formulaItems: [
        { text: this.$t('qm.table.groupSummary.sumText'), value: 'sum' },
        { text: this.$t('qm.table.groupSummary.maxText'), value: 'max' },
        { text: this.$t('qm.table.groupSummary.minText'), value: 'min' },
        { text: this.$t('qm.table.groupSummary.avgText'), value: 'avg' },
        { text: this.$t('qm.table.groupSummary.countText'), value: 'count' },
      ],
    });
    return {
      savedItems: [],
      currentKey: '',
      form: {
        name: '',
      },
      groupList: [],
      groupColumns: this.createGroupColumns(),
      summaryList: [],
      summaryColumns: this.createSummaryColumns(),
      groupTableData: [], // 分组项表格数据
      summaryTableData: [], // 汇总表格数据
      visible: false,
    };
  },
  computed: {
    $tableGroup() {
      return this.$refs.group;
    },
    $tableSummary() {
      return this.$refs.summary;
    },
    groupSummaryKey(): string {
      return this.$$table.uniqueKey ? `summary_${this.$$table.uniqueKey}` : '';
    },
    confirmDisabled(): boolean {
      const { groupTableData, summaryTableData } = this;
      const isGroup = groupTableData.length && groupTableData.every((x) => Object.values(x).every((k) => k !== ''));
      const isSummary = summaryTableData.length && summaryTableData.every((x) => Object.values(x).every((k) => k !== ''));
      return !(isGroup && isSummary);
    },
  },
  watch: {
    currentKey(next: string): void {
      if (next) {
        const { group, summary } = this.savedItems.find((x) => x.value === next).list;
        this.groupList = group;
        this.summaryList = summary;
      } else {
        this.groupList = [];
        this.summaryList = [];
      }
    },
  },
  async created(): Promise<void> {
    if (!this.groupSummaryKey) return;
    let res = await localforage.getItem(this.groupSummaryKey);
    if (!res) {
      res = await this.getGroupSummaryConfig(this.groupSummaryKey);
      if (Array.isArray(res)) {
        await localforage.setItem(this.groupSummaryKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      this.savedItems = res;
      this.currentKey = res[0].value;
    }
  },
  methods: {
    createGroupColumns(): IColumn[] {
      return [
        {
          title: this.$t('qm.table.groupSummary.operation'),
          dataIndex: '__action__',
          fixed: 'left',
          width: 80,
          render: (text, row) => {
            return (
              <div>
                <Button
                  type="text"
                  onClick={() => {
                    this.$tableGroup.REMOVE_RECORDS(row);
                  }}
                >
                  {this.$t('qm.table.groupSummary.removeText')}
                </Button>
              </div>
            );
          },
        },
        {
          dataIndex: 'group',
          title: this.$t('qm.table.groupSummary.groupItem'),
          width: 200,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.setGroupDisabled(),
              extra: {
                clearable: false,
              },
            };
          },
        },
      ];
    },
    createSummaryColumns(): IColumn[] {
      return [
        {
          title: this.$t('qm.table.groupSummary.operation'),
          dataIndex: '__action__',
          fixed: 'left',
          width: 80,
          render: (text, row) => {
            return (
              <div>
                <Button
                  type="text"
                  onClick={() => {
                    this.$tableSummary.REMOVE_RECORDS(row);
                  }}
                >
                  {this.$t('qm.table.groupSummary.removeText')}
                </Button>
              </div>
            );
          },
        },
        {
          dataIndex: 'summary',
          title: this.$t('qm.table.groupSummary.summaryColumn'),
          width: 200,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.setSummaryDisabled(),
              extra: {
                clearable: false,
              },
              onChange: (cell, row) => {
                row[`formula`] = '';
              },
            };
          },
        },
        {
          dataIndex: 'formula',
          title: this.$t('qm.table.groupSummary.calcFormula'),
          width: 150,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: row.summary === config.groupSummary.total.value ? this.formulaItems.slice(this.formulaItems.length - 1) : this.formulaItems,
              extra: {
                clearable: false,
              },
            };
          },
        },
      ];
    },
    setGroupDisabled(): IDict[] {
      return this.groupItems.map((x) => ({
        ...x,
        disabled: this.groupTableData.findIndex((k) => k.group === x.value) > -1,
      }));
    },
    setSummaryDisabled(): IDict[] {
      return this.summaryItems.map((x) => ({
        ...x,
        disabled: this.summaryTableData.findIndex((k) => k.summary === x.value) > -1,
      }));
    },
    // 切换配置信息
    toggleHandle(key: string): void {
      this.currentKey = key !== this.currentKey ? key : '';
    },
    // 保存配置
    async saveConfigHandle(): Promise<void> {
      if (!this.groupSummaryKey) {
        return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
      }
      const title = this.form.name;
      const uuid = createUidKey();
      this.savedItems.push({
        text: title,
        value: uuid,
        list: {
          group: this.groupTableData,
          summary: this.summaryTableData,
        },
      });
      this.currentKey = uuid;
      await localforage.setItem(this.groupSummaryKey, deepToRaw(this.savedItems));
      await this.saveGroupSummaryConfig(this.groupSummaryKey, deepToRaw(this.savedItems));
    },
    async getGroupSummaryConfig(key: string): Promise<unknown[] | void> {
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
    async saveGroupSummaryConfig(key: string, value: unknown): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {}
    },
    // 移除保存的 汇总配置项
    async removeSavedHandle(ev: MouseEvent, key: string): Promise<void> {
      stop(ev);
      if (!key) return;
      const index = this.savedItems.findIndex((x) => x.value === key);
      this.savedItems.splice(index, 1);
      if (key === this.currentKey) {
        this.currentKey = '';
      }
      await localforage.setItem(this.groupSummaryKey, deepToRaw(this.savedItems));
      await this.saveGroupSummaryConfig(this.groupSummaryKey, deepToRaw(this.savedItems));
    },
    // 关闭
    cancelHandle(): void {
      this.$emit('close', false);
    },
    // 显示汇总
    confirmHandle(): void {
      this.visible = true;
    },
  },
  render(): JSXNode {
    const {
      columns,
      groupList,
      groupColumns,
      summaryList,
      summaryColumns,
      form,
      savedItems,
      currentKey,
      confirmDisabled,
      visible,
      groupTableData,
      summaryTableData,
    } = this;
    const { tableSize } = this.$$table;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const cls = {
      [`${prefixCls}-group-summary__setting`]: true,
      [`${prefixCls}-group-summary--small`]: tableSize === 'small',
    };
    const wrapProps = {
      visible,
      title: t('qm.table.groupSummary.resultText'),
      width: '1000px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    return (
      <div class={cls}>
        <div class="main">
          <div class="container" style={{ width: '280px' }}>
            <VTable
              ref="group"
              height={300}
              dataSource={groupList}
              columns={groupColumns}
              showFullScreen={false}
              showFastSearch={false}
              showColumnDefine={false}
              rowKey={(record) => record.index}
              columnsChange={(columns) => (this.groupColumns = columns)}
              onDataChange={(tableData) => {
                this.groupTableData = tableData;
              }}
            >
              <Button
                type="primary"
                icon={<PlusIcon />}
                onClick={() => this.$tableGroup.INSERT_RECORDS({})}
                style={{ marginLeft: '10px', marginRight: '-10px' }}
              />
            </VTable>
          </div>
          <div class="container line" style={{ width: '430px' }}>
            <VTable
              ref="summary"
              height={300}
              dataSource={summaryList}
              columns={summaryColumns}
              showFullScreen={false}
              showFastSearch={false}
              showColumnDefine={false}
              rowKey={(record) => record.index}
              columnsChange={(columns) => (this.summaryColumns = columns)}
              onDataChange={(tableData) => {
                this.summaryTableData = tableData;
              }}
            >
              <Button type="primary" icon={<PlusIcon />} style={{ marginRight: '-10px' }} onClick={() => this.$tableSummary.INSERT_RECORDS({})} />
            </VTable>
          </div>
          <div class="saved line">
            <div class="form-wrap">
              <el-input class="form-item" v-model={form.name} placeholder={t('qm.table.groupSummary.configText')} disabled={confirmDisabled} />
              <Button type="primary" disabled={!form.name} style={{ marginLeft: '10px' }} onClick={() => this.saveConfigHandle()}>
                {t('qm.table.groupSummary.saveButton')}
              </Button>
            </div>
            <div class="card-wrap">
              <h5 style={{ height: `${config.rowHeightMaps[this.$$table.tableSize]}px` }}>
                <span>{t('qm.table.groupSummary.savedSetting')}</span>
              </h5>
              <ul>
                {savedItems.map((x) => (
                  <li key={x.value} class={{ selected: x.value === currentKey }} title={x.text} onClick={() => this.toggleHandle(x.value)}>
                    <span class="title">{x.text}</span>
                    <i class="svgicon close" title={t('qm.table.groupSummary.removeText')} onClick={(ev) => this.removeSavedHandle(ev, x.value)}>
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
          <Button onClick={() => this.cancelHandle()}>{t('qm.table.groupSummary.closeButton')}</Button>
          <Button type="primary" disabled={confirmDisabled} onClick={() => this.confirmHandle()}>
            {t('qm.table.groupSummary.confirmButton')}
          </Button>
        </div>
        <Dialog {...wrapProps}>
          <GroupSummaryResult columns={columns} group={groupTableData} summary={summaryTableData} />
        </Dialog>
      </div>
    );
  },
});
