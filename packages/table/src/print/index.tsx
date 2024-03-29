/*
 * @Author: 焦质晔
 * @Date: 2020-03-26 11:44:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 19:06:32
 */
import { defineComponent } from 'vue';
import { flatten, groupBy, map, spread, mergeWith } from 'lodash-es';
import { convertToRows, deepFindColumn, filterTableColumns, getCellValue } from '../utils';
import { deepToRaw } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { localeMixin } from '../../../mixins';
import { download } from '../../../_utils/download';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IDerivedColumn, IRecord } from '../table/types';

import config from '../config';
import { PrinterIcon } from '../../../icons';

const defaultHtmlStyle = `
  * {
    margin: 0;
    padding: 0;
  }
  body * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  table {
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
  }
  table--print {
    font-size: 14px;
    text-align: left;
  }
  .table--print th,
  .table--print td {
    padding: 5px;
    border: 1px solid #000;
  }
  .no-border th,
  .no-border td {
    border: 0!important;
  }
  .table--print th[colspan]:not([colspan='1']) {
    text-align: center;
  }
  .page-break {
    page-break-after: always;
  }
`;

export default defineComponent({
  name: 'PrintTable',
  props: ['tableColumns', 'flattenColumns'],
  inject: ['$$table'],
  mixins: [localeMixin],
  computed: {
    headColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.tableColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
    },
    flatColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.flattenColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
    },
    printFixedColumns(): IColumn[] {
      return this.tableColumns.filter((column: IColumn) => column.printFixed);
    },
  },
  methods: {
    createChunkColumnRows(chunkColumns: IDerivedColumn[][], tableColumns: IColumn[]): Array<IDerivedColumn[][]> {
      let res: Array<IDerivedColumn[][]> = [];
      chunkColumns.forEach((columns) => {
        let tmp: IDerivedColumn[] = [];
        columns.forEach((column) => {
          if (column.level === 1) {
            tmp.push(column);
          } else {
            // 深度拆分列
            tmp.push(this.deepCreateColumn(column, tableColumns));
          }
        });
        // 合并列
        tmp = this.mergeColumns(tmp);
        res.push(convertToRows(tmp));
      });
      return res;
    },
    deepCreateColumn(column: IDerivedColumn, columns: IColumn[]): IDerivedColumn {
      const parent = Object.assign({}, deepFindColumn(columns, column.parentDataIndex as string)) as IDerivedColumn;
      parent.children = [column];
      if (parent.level && parent.level > 1) {
        return this.deepCreateColumn(parent, columns);
      }
      return parent;
    },
    mergeColumns(columns: IColumn[]): IColumn[] {
      const keys: string[] = [...new Set(columns.map((x) => x.dataIndex))];
      return keys.map((x) => {
        const res = columns.filter((k) => k.dataIndex === x);
        if (res.length <= 1) {
          return res[0];
        } else {
          return this.doMerge(res, 'dataIndex')[0];
        }
      });
    },
    doMerge(columns: IColumn[], mark: string): IColumn[] {
      return map(
        groupBy(flatten(columns), mark),
        spread((...rest) => {
          return mergeWith(...(rest as [any, unknown]), (objValue, srcValue) => {
            if (Array.isArray(objValue)) {
              return this.doMerge(objValue.concat(srcValue), mark);
            }
          });
        })
      );
    },
    createChunkColumns(columns: IColumn[]): IColumn[][] {
      let res: IColumn[][] = [];
      let tmp: IColumn[] = [];
      let sum = 0;
      let i = 0;
      for (; i < columns.length; ) {
        const column = columns[i];
        const w = column.width || column.renderWidth || config.defaultColumnWidth;
        sum += w;
        if (sum <= config.printWidth) {
          tmp.push(column);
          if (i === columns.length - 1) {
            res.push(tmp);
          }
          i++;
        } else if (i > 0) {
          columns.splice(0, i);
          this.printFixedColumns.length && columns.unshift(...this.printFixedColumns);
          res.push(tmp);
          tmp = [];
          sum = 0;
          i = 0;
        } else {
          column.width = config.printWidth;
          tmp.push(column);
          res.push(tmp);
          i++;
        }
      }
      return res;
    },
    printHandle(): void {
      const opts = { filename: 'print', type: 'html', isDownload: false };
      this.downloadFile(opts, this.toHtml()).then(({ content, blob }) => {
        let printFrame: any = document.createElement('iframe');
        printFrame.setAttribute('frameborder', '0');
        printFrame.setAttribute('width', '100%');
        printFrame.setAttribute('height', '0');
        printFrame.style.display = 'none';
        document.body.appendChild(printFrame);
        if (this.$$table.isIE) {
          printFrame.contentDocument.write(content);
          printFrame.contentDocument.execCommand('print');
          printFrame.parentNode.removeChild(printFrame);
          printFrame = null;
        } else {
          printFrame.onload = (ev) => {
            if ((ev.target as any).src) {
              (ev.target as any).contentWindow.print();
            }
            setTimeout(() => {
              printFrame.parentNode.removeChild(printFrame);
              printFrame = null;
            });
          };
          printFrame.src = URL.createObjectURL(blob);
        }
      });
    },
    toHtml(): string {
      const { allTableData } = this.$$table;
      const chunkFlatColumns = this.createChunkColumns([...this.flatColumns]);
      const chunkColumnRows = this.createChunkColumnRows(chunkFlatColumns, this.headColumns);
      let html = [
        `<!DOCTYPE html>`,
        `<html>`,
        `<head>`,
        `<meta charset="utf-8">`,
        `<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">`,
        `<style>${defaultHtmlStyle}</style>`,
        `</head>`,
        `<body>`,
      ].join('');
      for (let i = 0; i < chunkFlatColumns.length; i++) {
        html += this._toTable(chunkColumnRows[i], chunkFlatColumns[i], allTableData);
        html += `<div class="page-break"></div>`;
      }
      return html + `</body></html>`;
    },
    _toTable(columnRows: Array<IDerivedColumn[]>, flatColumns: IColumn[], dataList: IRecord[]): string {
      const summationRows = this.$$table.$refs[`tableFooter`]?.summationRows ?? [];
      const { tablePrint, showHeader, showSummary } = this.$$table;
      const { showLogo = true } = tablePrint;
      let html = `<table class="table--print" width="100%" border="0" cellspacing="0" cellpadding="0">`;
      html += `<colgroup>${flatColumns
        .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
        .join('')}</colgroup>`;
      if (showHeader) {
        html += [
          `<thead>`,
          showLogo ? `<tr><th colspan="${flatColumns.length}" style="border: 0">${this._toLogo()}</th></tr>` : '',
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
      if (showSummary && summationRows.length) {
        html += [
          `<tfoot>`,
          summationRows
            .map(
              (row) =>
                `<tr>${flatColumns
                  .map((column, index) => {
                    const { dataIndex, summation } = column;
                    const text = summation?.render ? summation.render(dataList) : getCellValue(row, `${dataIndex}_text`);
                    return `<td>${index === 0 && text === '' ? this.$t('qm.table.config.summaryText') : text}</td>`;
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
    _toLogo(): string {
      const { global } = this.$DESIGN;
      const leftLogoUrl: string = global['print']?.leftLogo ?? '';
      const rightLogoUrl: string = global['print']?.rightLogo ?? '';
      const __html__: string[] = [
        `<table class="no-border" width="100%" border="0" cellspacing="0" cellpadding="0">`,
        `<tr>`,
        `<td width="50%" align="left">`,
        leftLogoUrl ? `<img src="${leftLogoUrl}" border="0" height="26" />` : '',
        `</td>`,
        `<td width="50%" align="right">`,
        rightLogoUrl ? `<img src="${rightLogoUrl}" border="0" height="38" />` : '',
        `</td>`,
        `</tr>`,
        `</table>`,
      ];
      return __html__.join('');
    },
    downloadFile(opts: any, content: string): Promise<any> | undefined {
      const { filename, type, isDownload } = opts;
      const name = `${filename}.${type}`;
      if (window.Blob) {
        const blob: Blob = new Blob([content], { type: `text/${type}` });
        if (!isDownload) {
          return Promise.resolve({ type, content, blob });
        }
        download(blob, name);
      }
    },
    renderCell(row: IRecord, rowIndex: number, column: IColumn, columnIndex: number): unknown {
      let result = this.$$table.tableBodyRef.renderCellTitle(column, row, rowIndex, columnIndex);
      return result;
    },
  },
  render(): JSXNode {
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <span class={`${prefixCls}-print`} title={t('qm.table.print.text')} onClick={this.printHandle}>
        <i class="svgicon icon">
          <PrinterIcon />
        </i>
      </span>
    );
  },
});
