/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 21:30:12
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 19:57:29
 */
import { defineComponent } from 'vue';
import { get, intersection, union, xor } from 'lodash-es';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import type { IRecord } from '../table/types';
import type { JSXNode } from '../../../_utils/types';

import { DownIcon } from '../../../icons';
import Checkbox from '../checkbox';

// intersection -> 交集(去重)
// union -> 并集(去重)
// xor -> 补集(并集 + 除了交集)

export default defineComponent({
  name: 'AllSelection',
  props: ['selectionKeys'],
  inject: ['$$table'],
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    size(): string {
      return this.$$table.tableSize !== 'small' ? 'default' : 'small';
    },
    isFilterable(): boolean {
      const { rowSelection } = this.$$table;
      return rowSelection.filterable ?? !0;
    },
    filterAllRowKeys(): string[] {
      const { allTableData, allRowKeys, rowSelection } = this.$$table;
      const { disabled = noop } = rowSelection;
      return allRowKeys.filter((key, index) => !disabled(allTableData[index]));
    },
    indeterminate(): boolean {
      const { rowSelection, total } = this.$$table;
      // 性能待优化
      // this.selectionKeys.length > 0 && intersection(this.selectionKeys, this.filterAllRowKeys).length < this.filterAllRowKeys.length;
      return this.selectionKeys.length > 0 && this.selectionKeys.length < (rowSelection.fetchAllRowKeys ? total : this.filterAllRowKeys.length);
    },
    selectable(): boolean {
      return !this.indeterminate && this.selectionKeys.length > 0;
    },
  },
  methods: {
    async getAllSelectionKeys(): Promise<IRecord[]> {
      const { fetchParams } = this.$$table;
      const { fetchAllRowKeys: fetch } = this.$$table.rowSelection;
      let rowKeys: IRecord[] = [];
      this.$$table.showLoading = !0;
      try {
        const res = await fetch.api(fetchParams);
        if (res.code === 200) {
          rowKeys = Array.isArray(res.data) ? res.data : get(res.data, fetch.dataKey) ?? [];
        }
      } catch (err) {}
      this.$$table.showLoading = !1;
      return rowKeys;
    },
    async changeHandle(val: boolean): Promise<void> {
      const { selectionKeys, filterAllRowKeys } = this;
      const { rowSelection } = this.$$table;
      if (rowSelection.fetchAllRowKeys) {
        this.$$table.selectionKeys = val ? await this.getAllSelectionKeys() : [];
      } else {
        // 性能待优化
        // this.$$table.selectionKeys = val ? union(selectionKeys, filterAllRowKeys) : selectionKeys.filter((x) => !filterAllRowKeys.includes(x));
        this.$$table.selectionKeys = val ? filterAllRowKeys.slice(0) : [];
      }
    },
    selectAllHandle(): void {
      this.changeHandle(true);
    },
    async invertHandle(): Promise<void> {
      const { rowSelection } = this.$$table;
      if (rowSelection.fetchAllRowKeys) {
        this.$$table.selectionKeys = xor(this.selectionKeys, await this.getAllSelectionKeys());
      } else {
        this.$$table.selectionKeys = xor(this.selectionKeys, this.filterAllRowKeys);
      }
    },
    clearAllHandle(): void {
      this.changeHandle(false);
    },
    renderDropdown(): JSXNode {
      const { t } = useLocale();
      return (
        <ul class={`el-dropdown-menu el-dropdown-menu--${this.size}`}>
          <li class="el-dropdown-menu__item" onClick={() => this.selectAllHandle()}>
            {t('qm.table.selection.all')}
          </li>
          <li class="el-dropdown-menu__item" onClick={() => this.invertHandle()}>
            {t('qm.table.selection.invert')}
          </li>
          <li class="el-dropdown-menu__item" onClick={() => this.clearAllHandle()}>
            {t('qm.table.selection.clear')}
          </li>
        </ul>
      );
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    return (
      <div class="cell--selection">
        <Checkbox
          indeterminate={this.indeterminate}
          disabled={!this.filterAllRowKeys.length}
          modelValue={this.selectable}
          onChange={this.changeHandle}
        />
        {this.isFilterable && (
          <el-popover
            popper-class={`${prefixCls}__popper head-selection--popper`}
            // v-model={[this.visible, 'visible']}
            width="auto"
            trigger="click"
            placement="bottom-start"
            transition="el-zoom-in-top"
            offset={4}
            show-arrow={false}
            teleported={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            onBeforeEnter={() => {
              this.visible = true;
            }}
            onAfterLeave={() => {
              this.visible = false;
            }}
            v-slots={{
              reference: (): JSXNode => (
                <span class="svgicon icon">
                  <DownIcon />
                </span>
              ),
            }}
          >
            {this.renderDropdown()}
          </el-popover>
        )}
      </div>
    );
  },
});
