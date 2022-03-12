/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 23:18:59
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { warn } from '../../_utils/error';
import { getParserWidth, isFunction } from '../../_utils/util';
import type { IFormData } from './types';
import type { JSXNode, ValueOf } from '../../_utils/types';

type IColumn = {
  dataIndex: string;
  title: string;
  hidden?: boolean;
};

export default defineComponent({
  name: 'FormSearchHelper',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  data() {
    Object.assign(this, { prevValue: '', callback: null });
    return {
      extraKeys: [],
      descKeys: [],
    };
  },
  methods: {
    reset(val?: string): void {
      this.extraKeys.forEach((key) => (this.$$form.form[key] = val));
      this.descKeys.forEach((key) => (this.$$form.desc[key] = val));
    },
    // 获取搜索帮助数据
    async querySearchAsync(request, fieldName: string, columns: Array<IColumn>, queryString = '', cb): Promise<void> {
      const { fetchApi, params = {}, dataKey = '' } = request;
      if (!fetchApi) {
        return warn('Form', '[IMMEDIATE] 类型的 `fetchApi` 参数不正确');
      }
      try {
        const res = await fetchApi({ ...{ [fieldName]: queryString }, ...params });
        if (res.code === 200) {
          const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
          cb(this.createSerachHelperList(dataList, columns));
        }
      } catch (err) {}
    },
    // 创建搜索帮助数据列表
    createSerachHelperList(list, columns: Array<IColumn>): Record<string, unknown>[] {
      const res = list.map((x) => {
        if (!columns.length) {
          return x;
        }
        const item: Record<string, unknown> = {};
        columns.forEach((k) => {
          item[k.dataIndex] = x[k.dataIndex];
        });
        return item;
      });
      return columns.length && res.length ? [{ __isThead__: !0 }, ...res] : res;
    },
  },
  render(): JSXNode {
    const { form, formType } = this.$$form;
    const { t } = useLocale();
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      request = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onEnter = noop,
      onChange = noop,
    } = this.option;
    const { columns = [], onlySelect = !0, fieldAliasMap, itemRender } = options;

    if (!isFunction(fieldAliasMap)) {
      warn('Form', '[IMMEDIATE] 类型的 `fieldAliasMap` 参数不正确');
    }

    const fieldKeys = Object.keys(fieldAliasMap?.() ?? {});

    // 其他表单项的 fieldName
    this.extraKeys = fieldKeys.filter((x) => x !== fieldName && x !== 'extra' && !x.endsWith('__desc'));

    // 表单项的表述信息
    this.descKeys = fieldKeys
      .filter((x) => x === 'extra' || x.endsWith('__desc'))
      .map((x) => {
        if (x === 'extra') {
          return fieldName;
        }
        return x.slice(0, -6);
      });

    // 搜索帮助 change 事件
    const searchHelperChangeHandle = (val: string): void => {
      const others: Record<string, ValueOf<IFormData>> = {};
      this.extraKeys.forEach((key) => (others[key] = form[key]));
      onChange(val, Object.keys(others).length ? others : null);
    };

    // 清空搜索帮助
    const clearSearchHelperValue = (): void => {
      this.reset();
      form[fieldName] = undefined;
      searchHelperChangeHandle('');
    };

    const prefixCls = getPrefixCls('search-helper');

    this.$$form.setViewValue(fieldName, form[fieldName]);

    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth ? getParserWidth(labelWidth) : ''}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <el-autocomplete
          ref={type}
          v-model={form[fieldName]}
          popper-class={`${prefixCls}__popper`}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          onSelect={(val): void => {
            const alias: Record<string, string> = fieldAliasMap();
            for (let key in alias) {
              if (key !== 'extra' && !key.endsWith('__desc')) {
                form[key] = val[alias[key]];
              }
              if (key === 'extra') {
                this.$$form.desc[fieldName] = val[alias[key]];
              }
              if (key.endsWith('__desc')) {
                this.$$form.desc[key.slice(0, -6)] = val[alias[key]];
              }
            }
            if (onlySelect) {
              this[`prevValue`] = form[fieldName];
              searchHelperChangeHandle(form[fieldName]);
            } else {
              onChange(form[fieldName]);
            }
          }}
          onFocus={(): void => {
            if (!onlySelect) return;
            this[`callback`]?.([]);
          }}
          onBlur={(ev): void => {
            if (!onlySelect) return;
            if (ev.target.value) {
              form[fieldName] = this[`prevValue`];
            } else {
              this[`prevValue`] = '';
            }
          }}
          onDblclick={() => {
            this.$refs[type].handleFocus();
          }}
          onKeyup={(ev) => {
            if (ev.keyCode !== 13) return;
            onEnter(ev.target.value);
            this.$$form.formItemValidate(fieldName);
            if (formType === 'search') {
              this.$$form.submitForm(ev);
            }
          }}
          onChange={(val: string): void => {
            val = val.trim();
            form[fieldName] = val;
            if (!onlySelect) {
              onChange(form[fieldName]);
            } else {
              !val && clearSearchHelperValue();
            }
          }}
          fetchSuggestions={(queryString, cb): void => {
            !this[`callback`] && (this[`callback`] = cb);
            this.querySearchAsync(request, fieldName, columns, queryString, cb);
          }}
          v-slots={{
            // 作用域插槽
            default: ({ item }) => {
              return !itemRender
                ? item.__isThead__
                  ? columns
                      .filter((x) => !x.hidden)
                      .map((x) => (
                        <th key={x.dataIndex} style={{ width: `${x.width}px`, pointerEvents: 'none' }}>
                          <span>{x.title}</span>
                        </th>
                      ))
                  : columns
                      .filter((x) => !x.hidden)
                      .map((x) => (
                        <td key={x.dataIndex}>
                          <span>{get(item, x.dataIndex)}</span>
                        </td>
                      ))
                : itemRender(item);
            },
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
