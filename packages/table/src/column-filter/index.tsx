/*
 * @Author: 焦质晔
 * @Date: 2020-03-17 10:29:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:20:44
 */
import { defineComponent } from 'vue';
import classnames from 'classnames';
import { cloneDeep } from 'lodash-es';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop, isUndefined } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import localStorageMixin from '../local-storage';
import type { IColumn, IFixed } from '../table/types';
import type { JSXNode } from '../../../_utils/types';

import { SettingIcon, HolderIcon, CloseCircleIcon, StepForwardIcon, StepBackwardIcon } from '../../../icons';
import Draggable from 'vuedraggable';
import Checkbox from '../checkbox';
import Button from '../../../button';

export default defineComponent({
  name: 'ColumnFilter',
  props: ['columns'],
  inject: ['$$table'],
  mixins: [localStorageMixin],
  data() {
    Object.assign(this, { colGroups: [] }); // 表头跨列分组
    return {
      visible: false,
      leftFixedColumns: [],
      rightFixedColumns: [],
      mainColumns: [],
    };
  },
  computed: {
    realColumns(): IColumn[] {
      return [...this.leftFixedColumns, ...this.mainColumns, ...this.rightFixedColumns];
    },
    showButtonText(): boolean {
      return !this.$$table.onlyShowIcon;
    },
  },
  watch: {
    columns(next: IColumn[]): void {
      this.createColumns();
      this.setLocalColumns(next);
    },
  },
  created(): void {
    this.createColumns();
    this.createColGroups();
  },
  methods: {
    createColumns(): void {
      this.leftFixedColumns = this.columns.filter((column) => !column.noAuth && column.fixed === 'left');
      this.rightFixedColumns = this.columns.filter((column) => !column.noAuth && column.fixed === 'right');
      this.mainColumns = this.columns.filter((column) => !column.noAuth && !column.fixed);
    },
    createColGroups(): void {
      this.columns
        .filter((column) => !column.noAuth)
        .forEach((column, i) => {
          const { colSpan } = column;
          if (colSpan > 1 && this.columns.slice(i + 1, i + colSpan).every(({ colSpan }) => colSpan === 0)) {
            this.colGroups.push(this.columns.slice(i, i + colSpan));
          }
        });
    },
    fixedChangeHandle(column: IColumn, dir: IFixed): void {
      column.fixed = dir;
      this.createColumns();
      this.changeHandle();
    },
    cancelFixedHandle(column: IColumn): void {
      delete column.fixed;
      this.createColumns();
      this.changeHandle();
    },
    changeHandle(): void {
      const { columnsChange = noop } = this.$$table;
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
              if (!isUndefined(column.fixed)) {
                target.fixed = column.fixed;
              } else if (target.fixed) {
                delete target.fixed;
              }
            }
            return target;
          })
        );
      });
      this.columns.forEach((column: IColumn, index: number) => {
        if (column.noAuth) {
          resultColumns.splice(index, 0, column);
        }
      });
      columnsChange(resultColumns);
    },
    resetColumnsHandle(): void {
      const { originColumns, columnsChange = noop } = this.$$table;
      columnsChange(cloneDeep(originColumns));
    },
    renderListItem(column: IColumn, type: string): JSXNode {
      const { colSpan } = column;
      if (colSpan === 0) {
        return <li key={column.dataIndex} style={{ display: 'none' }} />;
      }
      const { t } = useLocale();
      const cls = [`svgicon`, `handle`, `${type}-handle`];
      const checkboxProps = {
        modelValue: !column.hidden,
        'onUpdate:modelValue': (val) => {
          column.hidden = !val;
        },
      };
      return (
        <li key={column.dataIndex} class="item">
          <Checkbox {...checkboxProps} disabled={column.required} onChange={this.changeHandle} />
          <i class={cls} title={t('qm.table.columnFilter.draggable')}>
            <HolderIcon />
          </i>
          <span class="text" title={column.title}>
            {column.title}
          </span>
          {type === 'main' ? (
            <span class="fixed">
              <i class="svgicon" title={t('qm.table.columnFilter.fixedLeft')} onClick={() => this.fixedChangeHandle(column, 'left')}>
                <StepBackwardIcon />
              </i>
              <i class="svgicon" title={t('qm.table.columnFilter.fixedRight')} onClick={() => this.fixedChangeHandle(column, 'right')}>
                <StepForwardIcon />
              </i>
            </span>
          ) : (
            <span class="fixed">
              <i class="svgicon" title={t('qm.table.columnFilter.cancelFixed')} onClick={() => this.cancelFixedHandle(column)}>
                <CloseCircleIcon />
              </i>
            </span>
          )}
        </li>
      );
    },
    renderColumnFilter(): JSXNode {
      const { leftFixedColumns, mainColumns, rightFixedColumns } = this;
      const { t } = useLocale();

      const leftDragProps = {
        modelValue: leftFixedColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.left-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.leftFixedColumns = val;
        },
        onChange: this.changeHandle,
      };

      const mainDragProps = {
        modelValue: mainColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.main-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.mainColumns = val;
        },
        onChange: this.changeHandle,
      };

      const rightDragProps = {
        modelValue: rightFixedColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.right-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.rightFixedColumns = val;
        },
        onChange: this.changeHandle,
      };

      return (
        <div class="column-filter--wrap" style={{ maxHeight: `calc(100vh - 10px)` }}>
          <div class="reset">
            <Button type="text" size="small" autoInsertSpace={false} onClick={this.resetColumnsHandle}>
              {t('qm.table.columnFilter.reset')}
            </Button>
          </div>
          <div class="left">
            <Draggable
              {...leftDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'left');
                },
              }}
            />
          </div>
          <div class="divider" />
          <div class="main">
            <Draggable
              {...mainDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'main');
                },
              }}
            />
          </div>
          <div class="divider" />
          <div class="right">
            <Draggable
              {...rightDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'right');
                },
              }}
            />
          </div>
        </div>
      );
    },
  },
  render(): JSXNode {
    const { tableSize } = this.$$table;
    const { t } = useLocale();
    const { visible, showButtonText } = this;
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
        // v-model={[this.visible, 'visible']}
        width="auto"
        trigger="click"
        placement="bottom-end"
        fallback-placements={['bottom-end', 'left']}
        transition="el-zoom-in-top"
        offset={8}
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
            <span
              class={{ [`${prefixCls}-column-filter`]: !0, [`selected`]: visible }}
              title={!showButtonText ? t('qm.table.columnFilter.text') : undefined}
            >
              <i class="icon svgicon">
                <SettingIcon />
              </i>
              <span>{showButtonText && t('qm.table.columnFilter.text')}</span>
            </span>
          ),
        }}
      >
        {this.visible && this.renderColumnFilter()}
      </el-popover>
    );
  },
});
