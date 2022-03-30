/*
 * @Author: 焦质晔
 * @Date: 2020-05-20 09:36:38
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 15:59:11
 */
import { defineComponent } from 'vue';
import { cloneDeep } from 'lodash-es';
import { useLocale } from '../../../hooks';
import type { IColumn, IRecord } from '../table/types';
import type { JSXNode } from '../../../_utils/types';
import config from '../config';

import VTable from '../table';
import Button from '../../../button';

export default defineComponent({
  name: 'SelectCollectionResult',
  props: ['columns', 'selectionKeys', 'selectionRows', 'onClose'],
  inject: ['$$table'],
  data() {
    return {
      vColumns: this.createColumns(),
      list: this.createTableList(),
    };
  },
  methods: {
    createTableList(): IRecord[] {
      const _list = cloneDeep(this.selectionRows);
      return _list.map((row) => {
        delete row.children;
        return row;
      });
    },
    setSelectionKeys(keys: string[]): void {
      this.$$table.selectionKeys = keys;
    },
    filterColumns(columns: IColumn[]): IColumn[] {
      return columns.map((column) => {
        const item: IColumn = {
          dataIndex: column.dataIndex,
          title: column.title,
          ...((column.width as number) > 0 ? { width: column.width } : null),
          ...((column.precision as number) >= 0 ? { precision: column.precision } : null),
          dictItems: column.dictItems ?? [],
          ...(column.render ? { render: column.render } : null),
        };
        if (Array.isArray(column.children)) {
          item.children = this.filterColumns(column.children);
        }
        return item;
      });
    },
    createColumns(): IColumn[] {
      return this.filterColumns(
        this.columns.filter(
          (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
        )
      );
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { vColumns, list, selectionKeys } = this;
    const { t } = useLocale();
    const { rowKey } = this.$$table;
    return (
      <div>
        <VTable
          dataSource={list}
          columns={vColumns}
          rowKey={rowKey}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectionKeys,
            onChange: (val) => {
              this.setSelectionKeys(val);
            },
          }}
          minHeight={300}
          webPagination={true}
          showFullScreen={false}
          showFastSearch={false}
          showSelectCollection={false}
          showColumnDefine={false}
          columnsChange={(columns) => (this.vColumns = columns)}
        />
        <div style="height: 10px;" />
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
          <Button onClick={() => this.cancelHandle()}>{t('qm.table.selectCollection.closeButton')}</Button>
        </div>
      </div>
    );
  },
});
