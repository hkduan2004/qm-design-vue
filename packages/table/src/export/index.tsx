/*
 * @Author: 焦质晔
 * @Date: 2020-02-02 15:58:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-15 15:11:15
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { get, cloneDeep } from 'lodash-es';
import { getCellValue, setCellValue, convertToRows, createFilterColumns, columnsFlatMap, getVNodeText, filterTableColumns } from '../utils';
import { deepToRaw, isVNode } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { localeMixin } from '../../../mixins';
import { download } from '../../../_utils/download';
import type { IColumn, IFetch, IRecord } from '../table/types';
import type { JSXNode, AnyObject, Nullable } from '../../../_utils/types';

import config from '../config';
import exportMixin from './mixin';

import { DownloadIcon } from '../../../icons';
import Dialog from '../../../dialog';
import ExportSetting from './setting';

export type IOptions = {
  fileName: string;
  fileType: 'xlsx' | 'csv';
  sheetName: string;
  exportType: 'all' | 'selected' | 'custom';
  columns: IColumn[];
  startIndex: number;
  endIndex: number;
  footSummation: boolean;
  useStyle: boolean;
};

export default defineComponent({
  name: 'Export',
  props: ['tableColumns', 'flattenColumns'],
  inject: ['$$table'],
  mixins: [localeMixin, exportMixin],
  data() {
    return {
      visible: false,
      exporting: false,
    };
  },
  computed: {
    headColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.tableColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
    },
    flatColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.flattenColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
    },
    exportFetch(): Nullable<IFetch> {
      return this.$$table.exportExcel.fetch ?? null;
    },
    disabledState(): boolean {
      return !this.$$table.total || this.exporting;
    },
  },
  methods: {
    createDataList(list: IRecord[]): IRecord[] {
      return list.map((x, i) => {
        let item: AnyObject<any> = { ...x, index: i, pageIndex: i };
        this.flatColumns.forEach((column, index) => {
          const { dataIndex } = column;
          if (dataIndex === 'index' || dataIndex === 'pageIndex') return;
          setCellValue(item, dataIndex, getCellValue(item, dataIndex));
        });
        return item;
      });
    },
    calcSummationValues(columns: IColumn[], tableData: IRecord[]): Record<string, number>[] {
      const { summaries, isGroupSubtotal, getGroupValidData } = this.$$table;
      const result: Record<string, number> = {};
      columns
        .filter((x) => !!x.summation)
        .forEach((column) => {
          const { dataIndex } = column;
          let value: number;
          // 服务端合计
          if (Object.keys(summaries).includes(dataIndex)) {
            value = Number(getCellValue(summaries, dataIndex));
          } else {
            const dataList: IRecord[] = !isGroupSubtotal ? tableData : getGroupValidData(tableData);
            value = dataList.reduce((prev, curr) => {
              if (curr?.[config.summaryIgnore]) {
                return prev;
              }
              const value = Number(getCellValue(curr, dataIndex));
              if (!Number.isNaN(value)) {
                return prev + value;
              }
              return prev;
            }, 0);
          }
          setCellValue(result, dataIndex, value);
        });
      return [result];
    },
    async getTableData(options: IOptions): Promise<void> {
      const { fileName, fileType, exportType, startIndex = 1, endIndex } = options;
      const { fetch, fetchParams, total, isFetch, allTableData, selectionRows } = this.$$table;
      let tableList: IRecord[] = [];

      if (isFetch) {
        this.exporting = !0;
        const { api, dataKey } = fetch;
        try {
          const res = await api({ ...fetchParams, currentPage: 1, pageSize: total });
          if (res.code === 200) {
            tableList = this.createDataList(Array.isArray(res.data) ? res.data : get(res.data, dataKey) ?? []);
          }
        } catch (err) {}
        this.exporting = !1;
      } else {
        tableList = allTableData.slice(0);
      }

      if (exportType === 'selected') {
        tableList = selectionRows.slice(0);
      }
      if (exportType === 'custom') {
        tableList = tableList.slice(startIndex - 1, endIndex ? endIndex : undefined);
      }
      if (fileType === 'xlsx') {
        const blob = await this.exportXLSX(options, tableList);
        download(blob, `${fileName}.xlsx`);
        this.recordExportLog(`${fileName}.xlsx`);
      }
      if (fileType === 'csv') {
        const blob = this.exportCSV(options, this._toTable(options, tableList));
        download(blob, `${fileName}.csv`);
        this.recordExportLog(`${fileName}.csv`);
      }
    },
    async exportHandle(fileName: string): Promise<void> {
      const { fetchParams } = this.$$table;
      this.exporting = !0;
      try {
        const res = await this.exportFetch.api({
          columns: this.flatColumns.map((column) => {
            const { title, dataIndex, hidden } = column;
            const { type } = column.filter || {};
            return { title, dataIndex, type, hidden };
          }),
          ...fetchParams,
          tsortby: undefined,
          tsummary: undefined,
          tgroupby: undefined,
          currentPage: undefined,
          pageSize: undefined,
        });
        if (res.data) {
          download(res.data, fileName);
          this.recordExportLog(fileName);
        }
      } catch (err) {}
      this.exporting = !1;
    },
    _toTable(options: IOptions, dataList: IRecord[]): string {
      const { columns, footSummation } = options;
      const { showHeader, showSummary } = this.$$table;
      const columnRows = convertToRows(columns);
      const flatColumns = columnsFlatMap(columns);
      let html = `<table width="100%" border="0" cellspacing="0" cellpadding="0">`;
      html += `<colgroup>${flatColumns
        .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
        .join('')}</colgroup>`;
      if (showHeader) {
        html += [
          `<thead>`,
          columnRows
            .map(
              (columns) =>
                `<tr>${columns
                  .map((column) => {
                    const { rowSpan, colSpan } = column;
                    if (colSpan === 0) {
                      return null;
                    }
                    return `<th colspan="${colSpan}" rowspan="${rowSpan}">${column.title}</th>`;
                  })
                  .join('')}</tr>`
            )
            .join(''),
          `</thead>`,
        ].join('');
      }
      if (dataList.length) {
        html += `<tbody>${dataList
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { rowspan, colspan } = this.$$table.getSpan(row, column, row.index, index, dataList);
                  if (!rowspan || !colspan) {
                    return null;
                  }
                  return `<td rowspan="${rowspan}" colspan="${colspan}">${this.renderCell(row, row.index, column, index)}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}</tbody>`;
      }
      if (showSummary && footSummation) {
        html += [
          `<tfoot>`,
          this.calcSummationValues(flatColumns, dataList)
            .map(
              (row) =>
                `<tr>${flatColumns
                  .map((column, index) => {
                    const { dataIndex, summation } = column;
                    const text = summation?.render ? summation.render(dataList) : getCellValue(row, dataIndex);
                    return `<td>${
                      index === 0 && text === '' ? this.$t('qm.table.config.summaryText') : isVNode(text) ? getVNodeText(text).join('') : text
                    }</td>`;
                  })
                  .join('')}</tr>`
            )
            .join(''),
          `</tfoot>`,
        ].join('');
      }
      html += '</table>';
      return html;
    },
    renderCell(row: IRecord, rowIndex: number, column: IColumn, columnIndex: number): string | number {
      const { precision, formatType } = column;
      let result = this.$$table.tableBodyRef.renderCellTitle(column, row, rowIndex, columnIndex);
      // 处理 number 类型
      if ((precision as number) >= 0 && !formatType && result !== '') {
        result = Number(result);
      }
      return result;
    },
    recordExportLog(fileName: string): void {
      const { global } = this.$DESIGN;
      const fetchFn = global['table']?.recordExportLog;
      try {
        fetchFn?.({ fileName });
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { visible, headColumns, exportFetch, disabledState } = this;
    const { exportExcel } = this.$$table;
    const { t } = useLocale();
    const exportFileName = exportExcel.fileName ?? `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
    const exportFileType = exportFileName.slice(exportFileName.lastIndexOf('.') + 1).toLowerCase();
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.export.settingTitle'),
      width: '600px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    const settingProps = {
      fileName: exportFileName.slice(0, exportFileName.lastIndexOf('.')),
      fileType: exportFileType,
      columns: cloneDeep(headColumns),
      useStyle: exportExcel.cellStyle ? 1 : 0,
    };
    const cls = {
      [`${prefixCls}-export`]: true,
      disabled: disabledState,
    };
    return (
      <>
        <span
          class={cls}
          title={t('qm.table.export.text')}
          onClick={(): void => {
            if (disabledState) return;
            exportFetch ? this.exportHandle(exportFileName) : (this.visible = !0);
          }}
        >
          <i class="svgicon icon">
            <DownloadIcon />
          </i>
        </span>
        <Dialog {...wrapProps}>
          <ExportSetting
            defaultValue={settingProps}
            onClose={(): void => {
              this.visible = !1;
            }}
            onOk={(data: IOptions): void => {
              this.getTableData(Object.assign({}, data, { columns: createFilterColumns(data.columns) }));
            }}
          />
        </Dialog>
      </>
    );
  },
});
