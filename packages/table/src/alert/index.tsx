/*
 * @Author: 焦质晔
 * @Date: 2020-03-18 10:22:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 15:56:46
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';

import { InfoCircleFilledIcon } from '../../../icons';

export default defineComponent({
  name: 'Alert',
  props: ['total', 'selectionKeys'],
  inject: ['$$table'],
  computed: {
    showClear(): boolean {
      const { rowSelection, rowHighlight, isHeadSorter, isHeadFilter } = this.$$table;
      return rowSelection || rowHighlight || isHeadSorter || isHeadFilter;
    },
  },
  methods: {
    clearHandle(): void {
      // 清空列选中
      this.$$table.clearRowSelection();
      // 清空行高亮
      this.$$table.clearRowHighlight();
      // 清空表头排序
      this.$$table.clearTableSorter();
      // 清空表头筛选
      this.$$table.clearTableFilter();
      // 清空高级检索
      this.$$table.clearSuperSearch();
    },
  },
  render(): JSXNode {
    const { total, rowSelection, selectionKeys, allTableData, isTreeTable } = this.$$table;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const cls = {
      [`${prefixCls}__alert`]: true,
    };
    return (
      <div class={cls}>
        <i class="svgicon icon">
          <InfoCircleFilledIcon />
        </i>
        <span>
          {t('qm.table.alert.total', { total: !isTreeTable ? total : allTableData.length })}
          {!!rowSelection ? `，${t('qm.table.alert.selected', { total: selectionKeys.length })}` : ''}
        </span>
        {this.showClear && <em onClick={this.clearHandle}>{t('qm.table.alert.clear')}</em>}
      </div>
    );
  },
});
