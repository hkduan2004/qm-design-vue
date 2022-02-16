/*
 * @Author: 焦质晔
 * @Date: 2021-04-07 08:23:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:14:17
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { getPrefixCls } from '../../../_utils/prefix';
import { sleep } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import type { IColumn } from '../table/types';
import type { JSXNode } from '../../../_utils/types';

import Form from '../../../form';
import Button from '../../../button';
import ColumnDefine from './define';

export default defineComponent({
  name: 'ExportSetting',
  emits: ['ok', 'close'],
  props: ['defaultValue', 'onClose', 'onOk'],
  inject: ['$$table'],
  data() {
    return {
      loading: false,
      initialValue: this.getInitialvalue(),
      formList: this.createFormList(),
    };
  },
  methods: {
    getInitialvalue() {
      return Object.assign(
        {},
        {
          fileName: `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
          fileType: 'xlsx',
          sheetName: 'sheet1',
          exportType: 'all',
          'startIndex|endIndex': [1, this.$$table.total],
          footSummation: this.$$table.showSummary ? 1 : 0,
          useStyle: 0,
        },
        this.defaultValue
      );
    },
    createFormList() {
      const { t } = useLocale();
      return [
        {
          type: 'INPUT',
          label: t('qm.table.export.fileName'),
          fieldName: 'fileName',
        },
        {
          type: 'SELECT',
          label: t('qm.table.export.fileType'),
          fieldName: 'fileType',
          options: {
            itemList: [
              { text: 'xlsx', value: 'xlsx' },
              { text: 'csv', value: 'csv' },
            ],
          },
        },
        {
          type: 'INPUT',
          label: t('qm.table.export.sheetName'),
          fieldName: 'sheetName',
        },
        {
          type: 'RANGE_INPUT_NUMBER',
          label: '',
          fieldName: 'startIndex|endIndex',
          labelOptions: {
            type: 'SELECT',
            fieldName: 'exportType',
            options: {
              itemList: [
                { text: t('qm.table.export.all'), value: 'all' },
                { text: t('qm.table.export.selected'), value: 'selected', disabled: this.$$table.rowSelection?.type !== 'checkbox' },
                { text: t('qm.table.export.custom'), value: 'custom' },
              ],
            },
            onChange: (val: string): void => {
              this.formList.find((x) => x.fieldName === 'startIndex|endIndex').disabled = val !== 'custom';
            },
          },
          options: {
            min: 1,
          },
          disabled: true,
        },
        {
          type: 'INPUT',
          label: t('qm.table.columnFilter.text'),
          fieldName: 'columns',
          render: (_, vm) => {
            return (
              <ColumnDefine
                columns={vm.form.columns}
                onChange={(columns: IColumn[]): void => {
                  vm.SET_FIELDS_VALUE({ columns });
                }}
              />
            );
          },
        },
        {
          type: 'CHECKBOX',
          label: t('qm.table.export.footSummation'),
          fieldName: 'footSummation',
          disabled: !this.$$table.showSummary,
          options: {
            trueValue: 1,
            falseValue: 0,
          },
        },
        {
          type: 'CHECKBOX',
          label: t('qm.table.export.useStyle'),
          fieldName: 'useStyle',
          options: {
            trueValue: 1,
            falseValue: 0,
          },
        },
      ];
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
    async confirmHandle(): Promise<void> {
      const [err, data] = await this.$refs[`form`].GET_FORM_DATA();
      if (err) return;
      this.loading = !0;
      for (let key in data) {
        if (key === 'footSummation' || key === 'useStyle') {
          data[key] = !!data[key];
        }
      }
      await sleep(0);
      this.$emit('ok', data);
      await sleep(500);
      this.loading = !1;
      this.cancelHandle();
    },
  },
  render(): JSXNode {
    const { initialValue, formList, loading } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}-export__setting`}>
        <Form ref="form" initialValue={initialValue} list={formList} cols={1} labelWidth={110} />
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
          <Button onClick={() => this.cancelHandle()}>{t('qm.table.export.closeButton')}</Button>
          <Button type="primary" loading={loading} onClick={() => this.confirmHandle()}>
            {t('qm.table.export.text')}
          </Button>
        </div>
      </div>
    );
  },
});
