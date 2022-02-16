/*
 * @Author: 焦质晔
 * @Date: 2020-03-01 23:54:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:51:30
 */
import { defineComponent } from 'vue';
import { setCellValue, getCellValue } from '../utils';
import formatMixin from '../body/format';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop, isFunction } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn, IRecord } from '../table/types';
import config from '../config';

export default defineComponent({
  name: 'TableFooter',
  props: ['flattenColumns'],
  inject: ['$$table'],
  mixins: [formatMixin],
  computed: {
    summationRows(): Record<string, number | string>[] {
      const { tableFullData, selectionKeys, selectionRows, summaries, isGroupSubtotal, getGroupValidData } = this.$$table;
      const summationColumns = this.flattenColumns.filter((x) => typeof x.summation !== 'undefined');
      // 结果
      const res: Record<string, number | string> = {};
      summationColumns.forEach((column) => {
        const {
          dataIndex,
          precision,
          formatType = 'finance', // 默认货币格式
          summation: { sumBySelection, displayWhenNotSelect, unit = '', onChange = noop },
        } = column;
        const tableDataList: IRecord[] = !isGroupSubtotal ? tableFullData : getGroupValidData(tableFullData);
        // 未选择时，显示合计结果
        const notSelectAndDisplay: boolean = !selectionKeys.length && displayWhenNotSelect;
        // 可选择列动态合计
        const values: IRecord[] = !sumBySelection || notSelectAndDisplay ? tableDataList : selectionRows;
        // 累加求和
        let result: number = values.reduce((prev, curr) => {
          if (curr?.[config.summaryIgnore]) {
            return prev;
          }
          const value = Number(getCellValue(curr, dataIndex));
          if (!Number.isNaN(value)) {
            return prev + value;
          }
          return prev;
        }, 0);
        // 服务端合计
        if (Object.keys(summaries).includes(dataIndex) && (!sumBySelection || notSelectAndDisplay)) {
          result = Number(getCellValue(summaries, dataIndex));
        }
        // 设置合计值 - 数值类型
        setCellValue(res, dataIndex, result);
        // 处理数值精度
        let result2: string = precision >= 0 ? result.toFixed(precision) : result.toString();
        // 处理数据格式化
        result2 = this[`${formatType}Format`]?.(result2) ?? result2;
        // 设置合计单元格文本 - 字符串
        setCellValue(res, `${dataIndex}_text`, unit ? `${result2} ${unit}` : result2);
        // 触发事件
        onChange(result);
      });
      return [res];
    },
  },
  mounted() {
    this.setElementStore();
  },
  methods: {
    setElementStore(): void {
      const { elementStore } = this.$$table;
      elementStore[`$footer`] = this.$refs[`footer`];
    },
    renderColgroup(): JSXNode {
      const {
        layout: { gutterWidth },
        scrollY,
      } = this.$$table;
      return (
        <colgroup>
          {this.flattenColumns.map((column) => {
            const { dataIndex, width, renderWidth } = column;
            return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
          })}
          {scrollY && <col style={{ width: `${gutterWidth}px`, minWidth: `${gutterWidth}px` }} />}
        </colgroup>
      );
    },
    renderRows(): JSXNode[] {
      const { scrollY, isIE, rightFixedColumns } = this.$$table;
      const cls = [
        `gutter`,
        {
          [`cell-fix-right`]: !!rightFixedColumns.length,
        },
      ];
      const stys = !isIE
        ? {
            right: rightFixedColumns.length ? 0 : '',
          }
        : null;
      return this.summationRows.map((row, index) => (
        <tr key={index} class="footer--row">
          {this.flattenColumns.map((column, index) => this.renderCell(column, row, index))}
          {scrollY && <td class={cls} style={{ ...stys }}></td>}
        </tr>
      ));
    },
    renderCell(column: IColumn, row: IRecord, index: number): JSXNode {
      const {
        tableFullData,
        leftFixedColumns,
        rightFixedColumns,
        getStickyLeft,
        getStickyRight,
        layout: { gutterWidth },
        scrollY,
        isIE,
      } = this.$$table;
      const { dataIndex, fixed, align, summation } = column;
      const { t } = useLocale();
      const cls = [
        `footer--column`,
        `col--ellipsis`,
        {
          [`col--center`]: align === 'center',
          [`col--right`]: align === 'right',
          [`cell-fix-left`]: !isIE && fixed === 'left',
          [`cell-fix-right`]: !isIE && fixed === 'right',
          [`cell-fix-left-last`]: !isIE && fixed === 'left' && leftFixedColumns[leftFixedColumns.length - 1].dataIndex === dataIndex,
          [`cell-fix-right-first`]: !isIE && fixed === 'right' && rightFixedColumns[0].dataIndex === dataIndex,
        },
      ];
      const stys = !isIE
        ? {
            left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
            right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
          }
        : null;
      const text = summation?.render ? summation.render(tableFullData) : getCellValue(row, `${dataIndex}_text`);
      const cellValue = index === 0 && text === '' ? t('qm.table.config.summaryText') : text;
      return (
        <td key={dataIndex} title={cellValue} class={cls} style={{ ...stys }}>
          <div class="cell">{cellValue}</div>
        </td>
      );
    },
  },
  render(): JSXNode {
    const {
      footRender,
      layout: { tableBodyWidth },
      tableData,
      tableFullData,
    } = this.$$table;
    const prefixCls = getPrefixCls('table');
    return (
      <div ref="footer" class={`${prefixCls}--footer-wrapper`}>
        {isFunction(footRender) ? (
          footRender(this.flattenColumns, tableData, tableFullData)
        ) : (
          <table class={`${prefixCls}--footer`} cellspacing="0" cellpadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
            {this.renderColgroup()}
            <tfoot>{this.renderRows()}</tfoot>
          </table>
        )}
      </div>
    );
  },
});
