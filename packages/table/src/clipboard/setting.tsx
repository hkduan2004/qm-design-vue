/*
 * @Author: 焦质晔
 * @Date: 2021-04-07 08:23:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 14:03:49
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { setCellValue } from '../utils';

import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IRecord } from '../table/types';

import Form from '../../../form';
import Button from '../../../button';

export default defineComponent({
  name: 'ClipboardSetting',
  props: ['columns', 'onClose'],
  emits: ['close'],
  inject: ['$$table'],
  data() {
    return {
      formList: this.createFormList(),
    };
  },
  methods: {
    createFormList() {
      const { t } = useLocale();
      return [
        {
          type: 'INPUT_NUMBER',
          label: t('qm.table.clipboard.rowIndex'),
          fieldName: 'rowIndex',
          options: {
            min: 1,
          },
          style: { width: `calc(100% - 40px)` },
          descOptions: {
            content: '行',
            style: { width: '30px' },
          },
          rules: [{ required: true, message: t('qm.table.clipboard.noEmpty') }],
        },
        {
          type: 'SELECT',
          label: t('qm.table.clipboard.colIndex'),
          fieldName: 'dataIndex',
          options: {
            itemList: this.columns.map((x, i) => ({ value: i, text: x.title })),
          },
          rules: [{ required: true, message: t('qm.table.clipboard.noEmpty') }],
          style: { width: `calc(100% - 40px)` },
          descOptions: {
            content: '列',
            style: { width: '30px' },
          },
        },
        {
          type: 'TEXT_AREA',
          label: t('qm.table.clipboard.content'),
          fieldName: 'content',
          placeholder: t('qm.table.clipboard.placeholder'),
          options: {
            maxrows: 4,
          },
          rules: [{ required: true, message: t('qm.table.clipboard.noEmpty'), trigger: 'change' }],
        },
      ];
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
    async confirmHandle(): Promise<void> {
      const [err, data] = await this.$refs[`form`].GET_FORM_DATA();
      if (err) return;
      const { store, tableFullData } = this.$$table;
      // 解析 excel 数据
      // '"许强\n张三"\n任刚\n"许强\n张三"'
      const val: string = data.content.replace(/(\r|\n)$/, '');
      let _str = val.replace(/"[^"]+"/g, '^');
      const _arr = val.match(/"[^"]+"/g)?.map((x) => x.replace(/"/g, '').replace(/\r|\n/g, ' ')) || [];
      _arr.forEach((x) => {
        _str = _str.replace(/\^/, x);
      });
      const rows = _str.split(/\r|\n/);
      rows.forEach((row, index) => {
        const vals = row.split(/\t/);
        vals.forEach((x, i) => {
          const record: IRecord = tableFullData[data.rowIndex - 1 + index];
          const column: IColumn = this.columns[data.dataIndex + i];
          if (record && column) {
            setCellValue(record, column.dataIndex, x);
            store.addToUpdated(record);
          }
        });
      });
      this.cancelHandle();
    },
  },
  render(): JSXNode {
    const { formList } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}-clipboard__setting`}>
        <h3 class={`info`}>{t('qm.table.clipboard.supportText')}</h3>
        <Form ref="form" list={formList} cols={1} labelWidth={110} />
        <div style="height: 20px"></div>
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
          <Button type="primary" onClick={() => this.confirmHandle()}>
            {t('qm.table.clipboard.text')}
          </Button>
        </div>
      </div>
    );
  },
});
