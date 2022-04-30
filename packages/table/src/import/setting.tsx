/*
 * @Author: 焦质晔
 * @Date: 2021-04-07 08:23:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 14:15:14
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { sleep } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import { localeMixin } from '../../../mixins';
import exportMixin from '../export/mixin';
import config from '../config';
import type { JSXNode } from '../../../_utils/types';

import Form from '../../../form';
import Button from '../../../button';
import SelectFile from './SelectFile';
import { IColumn, IRecord } from '../table/types';

export default defineComponent({
  name: 'ImportSetting',
  emits: ['close'],
  props: ['columns', 'onClose'],
  inject: ['$$table'],
  mixins: [localeMixin, exportMixin] as any,
  data() {
    return {
      formList: this.createFormList(),
      disabled: true,
      loading: false,
      initialValue: {
        fileType: 'xlsx',
        importType: 'fill',
      },
    };
  },
  methods: {
    createFormList() {
      const { t } = useLocale();
      return [
        {
          type: 'INPUT',
          label: t('qm.table.export.fileName'),
          fieldName: 'fileName',
          render: (_, vm) => {
            const { fileName, fileType } = vm.form;
            return (
              <>
                {!fileName ? (
                  <SelectFile
                    fileType={fileType}
                    onChange={(fileName, file) => {
                      vm.SET_FORM_VALUES({ fileName, file });
                      file && (this.disabled = false);
                    }}
                  />
                ) : (
                  <span>{fileName}</span>
                )}
              </>
            );
          },
        },
        {
          type: 'SELECT',
          label: t('qm.table.export.fileType'),
          fieldName: 'fileType',
          clearable: false,
          options: {
            itemList: [{ text: 'xlsx', value: 'xlsx' }],
          },
        },
        {
          type: 'SELECT',
          label: t('qm.table.import.importType'),
          fieldName: 'importType',
          clearable: false,
          options: {
            itemList: [
              { text: t('qm.table.import.fillText'), value: 'fill' },
              { text: t('qm.table.import.addText'), value: 'add' },
              { text: t('qm.table.import.insertText'), value: 'insert' },
            ],
          },
          onChange: (val) => {
            this.formList.find((x) => x.fieldName === 'posIndex')!.hidden = val !== 'insert';
          },
        },
        {
          type: 'INPUT_NUMBER',
          label: t('qm.table.import.insertPos'),
          fieldName: 'posIndex',
          hidden: true,
          rules: [{ required: true, message: '', trigger: 'blur' }],
          style: { width: `calc(100% - 40px)` },
          options: {
            min: 1,
            max: this.$$table.tableFullData.length,
            toFinance: true,
          },
          descOptions: {
            content: '条',
            style: { width: '30px' },
          },
        },
      ];
    },
    createColumns(columns: IColumn[]): IColumn[] {
      return columns.filter(
        (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
      );
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
    async confirmHandle(): Promise<void> {
      const [err, data] = await this.$refs[`form`].GET_FORM_DATA();
      if (err) return;
      this.loading = !0;
      this.importXLSX({ columns: this.createColumns(this.columns), file: data.file }, (records: IRecord[]) => {
        if (data.importType === 'fill') {
          this.$$table.createTableData(records);
        }
        if (data.importType === 'add') {
          const { tableFullData } = this.$$table;
          this.$$table.createTableData([...tableFullData, ...records]);
        }
        if (data.importType === 'insert') {
          const { tableFullData } = this.$$table;
          const v = data.posIndex;
          const results: IRecord[] = tableFullData.slice(0, v).concat(records).concat(tableFullData.slice(v));
          this.$$table.createTableData(results);
        }
      });
      await sleep(500);
      this.loading = !1;
      this.cancelHandle();
    },
  },
  render(): JSXNode {
    const { initialValue, formList, loading, disabled } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}-import__setting`}>
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
          <Button type="primary" loading={loading} disabled={disabled} onClick={() => this.confirmHandle()}>
            {t('qm.table.import.text')}
          </Button>
        </div>
      </div>
    );
  },
});
1;
