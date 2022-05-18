/*
 * @Author: 焦质晔
 * @Date: 2020-03-22 14:34:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-12 15:27:00
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { get, merge, isEqual } from 'lodash-es';
import { getCellValue, setCellValue, deepFindColumn, toDate, dateFormat } from '../utils';
import { noop, isObject } from '../../../_utils/util';
import { useLocale } from '../../../hooks';
import { warn } from '../../../_utils/error';
import { SizeHeight } from '../../../_utils/types';
import { DEFAULT_TRUE_VALUE, DEFAULT_FALSE_VALUE } from '../table/types';
import type { JSXNode, Nullable } from '../../../_utils/types';
import type { IColumn, IEditerReturn, IRecord, IRule } from '../table/types';

import { SearchIcon } from '../../../icons';
import Checkbox from '../checkbox';
import InputText from './InputText';
import InputNumber from './InputNumber';
import SearchHelper from '../../../search-helper';
import TreeHelper from '../../../tree-helper';
import Button from '../../../button';
import Dialog from '../../../dialog';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'CellEdit',
  props: ['column', 'record', 'rowKey', 'columnKey', 'clicked'],
  inject: ['$$table', '$$body'],
  data() {
    return {
      shDeriveValue: {},
      shVisible: false, // 是否显示搜索帮助面板
      shMatching: false, // 是否正在匹配数据回显
    };
  },
  computed: {
    store() {
      return this.$$table.store;
    },
    size(): string {
      return this.$$table.tableSize !== 'small' ? 'default' : 'small';
    },
    options(): IEditerReturn {
      return this.column.editRender(this.record, this.column);
    },
    editable(): boolean {
      const { editable, disabled } = this.options;
      return (editable || isEqual(this.clicked, [this.rowKey, this.columnKey])) && !disabled;
    },
    dataKey(): string {
      return `${this.rowKey}|${this.columnKey}`;
    },
    currentKey(): string {
      return this.clicked.length === 2 ? `${this.clicked[0]}|${this.clicked[1]}` : '';
    },
    passValidate(): boolean {
      return ![...this.store.state.required, ...this.store.state.validate].some(({ x, y }) => x === this.rowKey && y === this.columnKey);
    },
    requiredText(): string {
      return this.store.state.required.find(({ x, y }) => x === this.rowKey && y === this.columnKey)?.text;
    },
    validateText(): string {
      return this.store.state.validate.find(({ x, y }) => x === this.rowKey && y === this.columnKey)?.text;
    },
    isEditing(): boolean {
      return this.editable || !this.passValidate || this.shVisible || this.shMatching;
    },
  },
  watch: {
    clicked(): void {
      if (!this.editable) return;
      const { type } = this.options;
      const { currentKey } = this;
      if (!currentKey) return;
      if (type === 'text' || type === 'number' || type === 'search-helper') {
        this.$nextTick(() => {
          this.$refs[`${type}-${currentKey}`]?.select();
        });
      }
      if (type === 'select' || type === 'select-multiple') {
        this.$nextTick(() => {
          this.$refs[`${type}-${currentKey}`]?.focus();
        });
      }
    },
  },
  methods: {
    createFieldValidate(rules: IRule[], val: unknown): void {
      const { rowKey, columnKey } = this;
      this.$$table.createFieldValidate(rules, val, rowKey, columnKey);
    },
    textHandle(row: IRecord, column: IColumn): JSXNode {
      const { t } = useLocale();
      const { dataIndex } = column;
      const { type, extra = {}, rules = [], onInput = noop, onChange = noop, onEnter = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <InputText
          ref={`${type}-${this.dataKey}`}
          size={this.size}
          {...inputProps}
          placeholder={t('qm.table.editable.inputPlaceholder')}
          maxlength={extra.maxlength}
          onInput={(val) => {
            onInput({ [this.dataKey]: val }, row);
          }}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.$refs[`text-${this.dataKey}`].blur();
              setTimeout(() => onEnter({ [this.dataKey]: ev.target.value }, row));
            }
          }}
          readonly={extra.readonly}
          disabled={extra.disabled}
        />
      );
    },
    numberHandle(row: IRecord, column: IColumn): JSXNode {
      const { t } = useLocale();
      const { dataIndex, precision } = column;
      const { type, extra = {}, rules = [], onInput = noop, onChange = noop, onEnter = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <InputNumber
          ref={`${type}-${this.dataKey}`}
          size={this.size}
          {...inputProps}
          precision={precision}
          min={extra.min}
          max={extra.max}
          maxlength={extra.maxlength}
          placeholder={t('qm.table.editable.inputPlaceholder')}
          style={{ width: '100%' }}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.$refs[`number-${this.dataKey}`].blur();
              setTimeout(() => onEnter({ [this.dataKey]: ev.target.value }, row));
            }
          }}
          readonly={extra.readonly}
          disabled={extra.disabled}
        />
      );
    },
    selectHandle(row: IRecord, column: IColumn, isMultiple: boolean): JSXNode {
      const { t } = useLocale();
      const { dataIndex, dictItems = [] } = column;
      const { type, extra = {}, rules = [], items, onChange = noop } = this.options;
      const itemList = items || dictItems;
      const prevValue = getCellValue(row, dataIndex);
      const selectProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <el-select
          ref={`${type}-${this.dataKey}`}
          size={this.size}
          popper-class={'table-editable__popper'}
          {...selectProps}
          multiple={isMultiple}
          collapseTags={isMultiple}
          placeholder={t('qm.table.editable.selectPlaceholder')}
          clearable={extra.clearable ?? !0}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
          v-slots={{
            default: (): JSXNode[] => itemList.map((x) => <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />),
          }}
        />
      );
    },
    [`select-multipleHandle`](row: IRecord, column: IColumn): JSXNode {
      return this.selectHandle(row, column, !0);
    },
    dateHandle(row: IRecord, column: IColumn, isDateTime: boolean): JSXNode {
      const { t } = useLocale();
      const { dataIndex } = column;
      const { extra = {}, rules = [], onChange = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const dateProps = {
        modelValue: toDate(prevValue),
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, dateFormat(val, !isDateTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'));
        },
      };
      return (
        <el-date-picker
          size={this.size}
          type={!isDateTime ? 'date' : 'datetime'}
          popper-class={'table-editable__popper'}
          {...dateProps}
          style={{ width: '100%' }}
          disabledDate={(oDate) => {
            return this.setDisabledDate(oDate, [extra.minDateTime, extra.maxDateTime]);
          }}
          clearable={extra.clearable ?? !0}
          placeholder={!isDateTime ? t('qm.table.editable.datePlaceholder') : t('qm.table.editable.datetimePlaceholder')}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
        />
      );
    },
    datetimeHandle(row: IRecord, column: IColumn): JSXNode {
      return this.dateHandle(row, column, !0);
    },
    timeHandle(row: IRecord, column: IColumn): JSXNode {
      const { t } = useLocale();
      const { dataIndex } = column;
      const { extra = {}, rules = [], onChange = noop } = this.options;
      const timeFormat = 'HH:mm:ss';
      const prevValue = getCellValue(row, dataIndex);
      const timeProps = {
        modelValue: toDate(prevValue),
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, dateFormat(val, `YYYY-MM-DD ${timeFormat}`));
        },
      };
      return (
        <el-time-picker
          size={this.size}
          popper-class={'table-editable__popper'}
          {...timeProps}
          format={timeFormat}
          style={{ width: '100%' }}
          clearable={extra.clearable ?? !0}
          placeholder={t('qm.table.editable.datetimePlaceholder')}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
        />
      );
    },
    checkboxHandle(row: IRecord, column: IColumn): JSXNode {
      const { dataIndex } = column;
      const { extra = {}, onChange = noop } = this.options;
      const { trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE, text = '', disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      const checkboxProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <Checkbox
          {...checkboxProps}
          onChange={(val) => {
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          trueValue={trueValue}
          falseValue={falseValue}
          label={text}
          disabled={disabled}
        />
      );
    },
    switchHandle(row: IRecord, column: IColumn): JSXNode {
      const { dataIndex } = column;
      const { extra = {}, onChange = noop } = this.options;
      const { trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE, disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      const switchProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <el-switch
          size={this.size}
          {...switchProps}
          activeValue={trueValue}
          inactiveValue={falseValue}
          onChange={(val) => {
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={disabled}
        />
      );
    },
    [`search-helperHandle`](row: IRecord, column: IColumn): JSXNode {
      const { t } = useLocale();
      const { dataIndex, precision } = column;
      const { extra = {}, helper, rules = [], onClick = noop, onChange = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const createFieldAliasMap = () => {
        const fieldAliasMap = helper.fieldAliasMap;
        if (!fieldAliasMap) {
          warn('Table', 'helper 需要配置 `fieldAliasMap` 选项');
        }
        const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
        if (!Object.keys(alias).includes(dataIndex)) {
          warn('Table', 'fieldAliasMap 选项必须包含自身 `dataIndex` 值');
        }
        return alias;
      };
      const setHelperValues = (val = '', others?: any) => {
        // 对其他单元格赋值 & 校验
        if (isObject(others) && Object.keys(others).length) {
          for (let otherDataIndex in others) {
            const otherValue = others[otherDataIndex];
            const otherColumn = deepFindColumn(this.$$table.columns, otherDataIndex);
            if (otherColumn) {
              setCellValue(row, otherDataIndex, otherValue, otherColumn.precision);
              const otherOptions = otherColumn.editRender?.(row, otherColumn);
              if (otherOptions && Array.isArray(otherOptions.rules)) {
                this.$$table.createFieldValidate(otherOptions.rules, otherValue, this.rowKey, otherDataIndex);
              }
            } else {
              setCellValue(row, otherDataIndex, otherValue);
            }
          }
        }
        // 修改当前单元格的值
        setCellValue(row, dataIndex, val, precision);
        this.createFieldValidate(rules, val);
        this.store.addToUpdated(row);
        onChange({ [this.dataKey]: val }, row);
        this.$$table.dataChangeHandle();
        // 更新状态变量
        this._is_change = !1;
      };
      const closeHelperHandle = (visible, data) => {
        if (isObject(data)) {
          const alias = createFieldAliasMap();
          // 其他字段的集合
          const others = {};
          for (let key in alias) {
            const dataKey = alias[key];
            if (key === dataIndex) continue;
            others[key] = data[dataKey];
          }
          const current = alias[dataIndex] ? data[alias[dataIndex]] : '';
          // 关闭的前置钩子
          const beforeClose = helper.beforeClose ?? helper.close ?? trueNoop;
          const before = beforeClose(data, { [this.dataKey]: prevValue }, row, column);
          if (before?.then) {
            before
              .then(() => {
                doClose();
                setHelperValues(current, others);
              })
              .catch(() => {});
          } else if (before !== false) {
            doClose();
            setHelperValues(current, others);
          }
        } else {
          doClose();
        }
      };
      const setHelperFilterValues = (val) => {
        const { filterAliasMap = noop } = helper;
        const alias = Object.assign([], filterAliasMap());
        const inputParams = { [dataIndex]: val };
        alias.forEach((x) => (inputParams[x] = val));
        return inputParams;
      };
      const getHelperData = (val): Promise<IRecord[]> => {
        const { table, initialValue = {}, beforeFetch = (k) => k } = helper;
        return new Promise(async (resolve, reject) => {
          this.shMatching = !0;
          const params = merge({}, table.fetch?.params, beforeFetch({ ...initialValue, ...setHelperFilterValues(val) }), {
            currentPage: 1,
            pageSize: 500,
          });
          try {
            const res = await table.fetch.api(params);
            if (res.code === 200) {
              const list = Array.isArray(res.data) ? res.data : get(res.data, table.fetch.dataKey) ?? [];
              resolve(list);
            } else {
              reject();
            }
          } catch (err) {
            reject();
          }
          this.shMatching = !1;
        });
      };
      const resetHelperValue = (list: IRecord[] = [], val) => {
        const alias = createFieldAliasMap();
        const records = list.filter((data) => {
          return getCellValue(data, alias[dataIndex]).toString().includes(val);
        });
        if (records.length === 1) {
          return closeHelperHandle(false, records[0]);
        }
        openHelperPanel(val);
      };
      const openHelperPanel = (val) => {
        // 打开的前置钩子
        const beforeOpen = helper.beforeOpen ?? helper.open ?? trueNoop;
        const before = beforeOpen({ [this.dataKey]: prevValue }, row, column);
        if (before?.then) {
          before
            .then(() => {
              this.shDeriveValue = setHelperFilterValues(val);
              this.shVisible = true;
            })
            .catch(() => {});
        } else if (before !== false) {
          this.shDeriveValue = setHelperFilterValues(val);
          this.shVisible = true;
        }
      };
      const doClose = () => {
        this.shVisible = false;
      };
      const dialogProps = {
        visible: this.shVisible,
        title: t('qm.searchHelper.text'),
        width: helper?.width ?? '60%',
        height: helper?.height,
        loading: false,
        destroyOnClose: true,
        containerStyle: { paddingBottom: `${SizeHeight[this.$$table.tableSize] + 20}px` },
        'onUpdate:visible': (val) => {
          this.shVisible = val;
        },
        onClose: () => {
          const { closed = noop } = helper;
          this.shDeriveValue = {};
          if (this._is_change) {
            setHelperValues('');
          }
          closed(row);
        },
      };
      const shProps = {
        ...helper,
        size: this.$$table.tableSize,
        initialValue: merge({}, helper?.initialValue, this.shDeriveValue),
        onClose: closeHelperHandle,
      };
      const remoteMatch = helper && (helper.remoteMatch ?? !0);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
          this._is_change = !0;
        },
      };
      return (
        <div class="search-helper">
          <InputText
            ref={`search-helper-${this.dataKey}`}
            size={this.size}
            {...inputProps}
            placeholder={t('qm.table.editable.selectPlaceholder')}
            maxlength={extra.maxlength}
            readonly={extra.readonly}
            clearable={extra.clearable ?? !0}
            disabled={extra.disabled}
            onChange={(val) => {
              if (val && remoteMatch) {
                return getHelperData(val)
                  .then((list) => resetHelperValue(list, val))
                  .catch(() => setHelperValues(''));
              }
              setHelperValues(val);
            }}
            onDblclick={(ev) => {
              if (extra.disabled) return;
              isObject(helper) && openHelperPanel(ev.target.value);
            }}
            onKeydown={(ev) => {
              if (ev.keyCode === 13) {
                isObject(helper) && openHelperPanel(ev.target.value);
              }
            }}
            v-slots={{
              append: (): JSXNode => (
                <Button
                  tabindex={-1}
                  size={this.size}
                  icon={<SearchIcon />}
                  click={(ev) => {
                    isObject(helper) ? openHelperPanel(prevValue) : onClick({ [this.dataKey]: prevValue }, row, column, setHelperValues, ev);
                  }}
                />
              ),
            }}
          />
          {isObject(helper) && (
            <Dialog {...dialogProps}>
              <SearchHelper {...shProps} />
            </Dialog>
          )}
        </div>
      );
    },
    [`tree-helperHandle`](row: IRecord, column: IColumn): JSXNode {
      const { t } = useLocale();
      const { dataIndex, precision } = column;
      const { extra = {}, helper = {}, rules = [], onClick = noop, onEnter = noop, onChange = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);

      const fieldAliasMap = helper.fieldAliasMap;
      if (!fieldAliasMap) {
        warn('Table', 'helper 需要配置 `fieldAliasMap` 选项');
      }

      const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
      if (!Object.keys(alias).includes(dataIndex)) {
        warn('Table', 'fieldAliasMap 选项必须包含自身 `dataIndex` 值');
      }

      const setHelperValues = (val = '', others?: any) => {
        // 对其他单元格赋值 & 校验
        if (isObject(others) && Object.keys(others).length) {
          for (let otherDataIndex in others) {
            const otherValue = others[otherDataIndex];
            const otherColumn = deepFindColumn(this.$$table.columns, otherDataIndex);
            if (otherColumn) {
              setCellValue(row, otherDataIndex, otherValue, otherColumn.precision);
              const otherOptions = otherColumn.editRender?.(row, otherColumn);
              if (otherOptions && Array.isArray(otherOptions.rules)) {
                this.$$table.createFieldValidate(otherOptions.rules, otherValue, this.rowKey, otherDataIndex);
              }
            } else {
              setCellValue(row, otherDataIndex, otherValue);
            }
          }
        }
        // 修改当前单元格的值
        setCellValue(row, dataIndex, val, precision);
        this.createFieldValidate(rules, val);
        this.store.addToUpdated(row);
        onChange({ [this.dataKey]: val }, row);
        this.$$table.dataChangeHandle();
      };

      const openSearchHelper = () => {
        // 打开的前置钩子
        const beforeOpen = helper.beforeOpen ?? helper.open ?? trueNoop;
        const before = beforeOpen({ [this.dataKey]: prevValue }, row, column);
        if (before?.then) {
          before
            .then(() => {
              this.shVisible = true;
            })
            .catch(() => {});
        } else if (before !== false) {
          this.shVisible = true;
        }
      };

      const closeSearchHelper = (data: Record<string, any>) => {
        // 其他字段的集合
        const others = {};
        for (let key in alias) {
          const dataKey = alias[key];
          if (key === dataIndex) continue;
          others[key] = data[dataKey];
        }
        const current = alias[dataIndex] ? data[alias[dataIndex]] : '';
        // 关闭的前置钩子
        const beforeClose = helper.beforeClose ?? helper.close ?? trueNoop;
        const before = beforeClose(data, { [this.dataKey]: prevValue }, row, column);
        if (before?.then) {
          before
            .then(() => {
              doClose();
              setHelperValues(current, others);
            })
            .catch(() => {});
        } else if (before !== false) {
          doClose();
          setHelperValues(current, others);
        }
      };

      const closeButNotSelect = () => {
        doClose();
      };

      const doClose = () => {
        this.shVisible = false;
      };

      const dialogProps = {
        visible: this.shVisible,
        title: t('qm.searchHelper.text'),
        width: helper?.width ?? '30%',
        height: helper?.height,
        loading: false,
        destroyOnClose: true,
        containerStyle: { paddingBottom: `${SizeHeight[this.$$table.tableSize] + 20}px` },
        'onUpdate:visible': (val) => {
          this.shVisible = val;
        },
        onClose: () => {
          const { closed = noop } = helper;
          closed(row);
        },
      };

      const shProps = {
        ...helper,
        size: this.$$table.tableSize,
        onClose: (data) => {
          if (data) {
            closeSearchHelper(data);
          } else {
            closeButNotSelect();
          }
        },
      };

      return (
        <div class="search-helper">
          <el-input
            ref={`tree-helper-${this.dataKey}`}
            size={this.size}
            modelValue={prevValue}
            placeholder={t('qm.table.editable.selectPlaceholder')}
            clearable={extra.clearable ?? !0}
            readonly={extra.readonly}
            disabled={extra.disabled}
            onChange={(val) => {
              if (val) return;
              setHelperValues(val);
            }}
            onDblclick={() => {
              if (extra.disabled) return;
              openSearchHelper();
            }}
            onKeydown={(ev) => {
              if (ev.keyCode === 13) {
                this.$refs[`tree-helper-${this.dataKey}`].blur();
                setTimeout(() => onEnter({ [this.dataKey]: ev.target.value }, row));
              }
            }}
            v-slots={{
              append: (): JSXNode => (
                <Button
                  tabindex={-1}
                  size={this.size}
                  icon={<SearchIcon />}
                  click={() => {
                    openSearchHelper();
                  }}
                />
              ),
            }}
          />
          <Dialog {...dialogProps}>
            <TreeHelper {...shProps} />
          </Dialog>
        </div>
      );
    },
    // 设置日期控件的禁用状态
    setDisabledDate(oDate: Date, [minDateTime, maxDateTime]): boolean {
      const min = minDateTime ? dayjs(minDateTime).toDate().getTime() : 0;
      const max = maxDateTime ? dayjs(maxDateTime).toDate().getTime() : 0;
      if (min && max) {
        return !(oDate.getTime() >= min && oDate.getTime() <= max);
      }
      if (!!min) {
        return oDate.getTime() < min;
      }
      if (!!max) {
        return oDate.getTime() > max;
      }
      return false;
    },
    renderEditCell(): Nullable<JSXNode> {
      const { type } = this.options;
      const render = this[`${type}Handle`];
      if (!render) {
        warn('Table', '单元格编辑的类型 `type` 配置不正确');
        return null;
      }
      const { passValidate, requiredText, validateText } = this;
      const cls = [
        `cell--edit`,
        {
          [`is-error`]: !passValidate,
        },
      ];
      return (
        <div class={cls}>
          {render(this.record, this.column)}
          {!passValidate && <div class="cell-error">{requiredText || validateText}</div>}
        </div>
      );
    },
    renderCell(): JSXNode {
      const { record, column } = this;
      const text = getCellValue(record, column.dataIndex);
      return <span class="cell--text">{this.$$body.renderText(text, column, record)}</span>;
    },
  },
  render(): JSXNode {
    return this.isEditing ? this.renderEditCell() : this.renderCell();
  },
});
