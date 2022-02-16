/*
 * @Author: 焦质晔
 * @Date: 2020-03-17 10:29:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:20:48
 */
import { defineComponent } from 'vue';
import classnames from 'classnames';
import { isUndefined } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import type { IColumn } from '../table/types';
import type { JSXNode } from '../../../_utils/types';

import { SettingIcon, HolderIcon } from '../../../icons';
import Draggable from 'vuedraggable';
import Checkbox from '../checkbox';

export default defineComponent({
  name: 'ColumnFilter',
  props: ['columns'],
  inject: ['$$table'],
  emits: ['change'],
  data() {
    Object.assign(this, { colGroups: [] }); // 表头跨列分组
    return {
      visible: false,
      realColumns: [...this.columns],
    };
  },
  created(): void {
    this.createColGroups();
  },
  methods: {
    createColGroups(): void {
      this.columns.forEach((column, i) => {
        const { colSpan } = column;
        if (colSpan > 1 && this.columns.slice(i + 1, i + colSpan).every(({ colSpan }) => colSpan === 0)) {
          this.colGroups.push(this.columns.slice(i, i + colSpan));
        }
      });
    },
    changeHandle(): void {
      const resultColumns: IColumn[] = [];
      this.realColumns.forEach((column: IColumn) => {
        const { colSpan, dataIndex } = column;
        if (colSpan === 0) return;
        if (colSpan === 1) {
          return resultColumns.push(column);
        }
        const groupIndex = this.colGroups.findIndex((group) => group.map((x) => x.dataIndex).includes(dataIndex));
        if (groupIndex === -1) {
          return resultColumns.push(column);
        }
        resultColumns.push(
          ...this.colGroups[groupIndex].map(({ dataIndex }, index) => {
            const target: IColumn = this.realColumns.find((x) => x.dataIndex === dataIndex);
            if (index > 0) {
              if (!isUndefined(column.hidden)) {
                target.hidden = column.hidden;
              }
            }
            return target;
          })
        );
      });
      this.$emit('change', resultColumns);
    },
    renderListItem(column: IColumn, type: string): JSXNode {
      const { t } = useLocale();
      const { colSpan } = column;
      if (colSpan === 0) {
        return <li key={column.dataIndex} style={{ display: 'none' }} />;
      }
      const cls = [`svgicon`, `handle`, `${type}-handle`];
      const checkboxProps = {
        modelValue: !column.hidden,
        'onUpdate:modelValue': (val) => {
          column.hidden = !val;
        },
      };
      return (
        <li key={column.dataIndex} class="item">
          <Checkbox {...checkboxProps} onChange={this.changeHandle} />
          <i class={cls} title={t('qm.table.columnFilter.draggable')}>
            <HolderIcon />
          </i>
          <span class="text" title={column.title}>
            {column.title}
          </span>
        </li>
      );
    },
    renderColumnFilter(): JSXNode {
      const mainDragProps = {
        modelValue: this.realColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.main-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.realColumns = val;
        },
        onChange: this.changeHandle,
      };

      return (
        <div class="column-filter--wrap" style={{ overflowY: 'auto', maxHeight: `calc(100vh - 10px)` }}>
          <Draggable
            {...mainDragProps}
            v-slots={{
              item: ({ element: column }): JSXNode => {
                return this.renderListItem(column, 'main');
              },
            }}
          />
        </div>
      );
    },
  },
  render(): JSXNode {
    const { tableSize } = this.$$table;
    const { t } = useLocale();
    const { visible } = this;
    const prefixCls = getPrefixCls('table');
    const popperCls = {
      [`${prefixCls}__popper`]: true,
      [`${prefixCls}__popper--medium`]: tableSize === 'medium',
      [`${prefixCls}__popper--small`]: tableSize === 'small',
      [`${prefixCls}__popper--mini`]: tableSize === 'mini',
    };
    return (
      <el-popover
        popper-class={`${classnames(popperCls, 'column-filter__popper')}`}
        v-model={[this.visible, 'visible']}
        width="auto"
        trigger="click"
        placement="right"
        transition="el-zoom-in-top"
        offset={10}
        teleported={true}
        stop-popper-mouse-event={false}
        gpu-acceleration={false}
        v-slots={{
          reference: (): JSXNode => (
            <span class={{ [`${prefixCls}-column-filter`]: !0, [`selected`]: visible }} title={t('qm.table.columnFilter.text')}>
              <i class="icon svgicon">
                <SettingIcon />
              </i>
              <span>{t('qm.table.columnFilter.text')}</span>
            </span>
          ),
        }}
      >
        {this.visible && this.renderColumnFilter()}
      </el-popover>
    );
  },
});
