/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-13 22:07:30
 */
import { defineComponent } from 'vue';
import { merge } from 'lodash-es';
import { useSize, useLocale } from '../../hooks';
import { noop } from './utils';
import { prevent } from '../../_utils/dom';
import { getParserWidth, isObject } from '../../_utils/util';
import { SizeHeight } from '../../_utils/types';
import type { IFormData } from './types';
import type { JSXNode, ValueOf, AnyFunction, Nullable } from '../../_utils/types';

import { SearchIcon } from '../../icons';
import Button from '../../button';
import Dialog from '../../dialog';
import TreeTableHelper from '../../tree-table-helper';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'FormTreeTableHelper',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  data() {
    Object.assign(this, { alias: {} });
    return {
      visible: false,
      extraKeys: [],
      descKeys: [],
    };
  },
  async mounted() {
    this.alias = await this.createFieldAlias();
  },
  methods: {
    reset(val?: string): void {
      this.extraKeys.forEach((key) => (this.$$form.form[key] = val));
      this.descKeys.forEach((key) => (this.$$form.desc[key] = val));
    },
    // 创建 field alias 别名
    async createFieldAlias(): Promise<Record<string, string>> {
      const { name, fieldsDefine, getServerConfig, fieldAliasMap = noop } = this.option.searchHelper;
      let alias: Record<string, string> = {}; // 别名映射
      // tds
      if (name && fieldsDefine && getServerConfig) {
        const DEFINE = ['valueName', 'displayName', 'descriptionName'];
        const target: Record<string, string> = {};
        try {
          const res = await getServerConfig({ name });
          if (res?.code === 200) {
            for (let key in fieldsDefine) {
              if (!DEFINE.includes(key)) continue;
              target[fieldsDefine[key]] = res.data[key];
            }
          }
        } catch (err) {}
        alias = Object.assign({}, target);
      } else {
        alias = Object.assign({}, fieldAliasMap());
      }
      return alias;
    },
  },
  render(): JSXNode {
    const { form, formType } = this.$$form;
    const { t } = useLocale();
    const { $size } = useSize(this.$$form.$props);
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { minlength = 0, maxlength, prefixIcon, suffixIcon, onFocus = noop, onBlur = noop, onClick = noop, onDblClick = noop } = options;

    // 搜索帮助关闭，回显值事件
    const closeSearchHelper = (data: Record<string, unknown>): void => {
      const aliasKeys: string[] = Object.keys(this.alias);
      if (isObject(data) && aliasKeys.length) {
        for (let key in this.alias) {
          const val = data[this.alias[key]];
          if (key === fieldName && form[fieldName] !== val) {
            this._is_change = !0;
          }
          if (key !== 'extra' && !key.endsWith('__desc')) {
            form[key] = val;
          }
          if (key === 'extra') {
            this.$$form.desc[fieldName] = val;
          }
          if (key.endsWith('__desc')) {
            this.$$form.desc[key.slice(0, -6)] = val;
          }
        }
        if (aliasKeys.includes(fieldName)) {
          searchHelperChangeHandle(form[fieldName]);
        }
      }
      const { closed = noop } = searchHelper;
      closed(data);
      this.visible = false;
    };

    // 搜索帮助 change 事件
    const searchHelperChangeHandle = (val: string): void => {
      if (this.visible) return;
      const others: Record<string, ValueOf<IFormData>> = {};
      this.extraKeys.forEach((key) => (others[key] = form[key]));
      onChange(val, Object.keys(others).length ? others : null);
    };

    // 执行打开动作
    const todoOpen = (): void => {
      this.visible = !0;
    };

    // 打开搜索帮助面板
    const openSearchHelper = (cb?: AnyFunction<void>): void => {
      // 打开的前置钩子
      const beforeOpen = searchHelper.beforeOpen ?? searchHelper.open ?? trueNoop;
      const before = beforeOpen(form);
      if ((before as Promise<void>)?.then) {
        (before as Promise<void>)
          .then(() => {
            todoOpen();
            cb?.();
          })
          .catch(() => {});
      } else if (before !== false) {
        todoOpen();
        cb?.();
      }
    };

    // 清空搜索帮助
    const clearSearchHelperValue = (): void => {
      this.reset();
      form[fieldName] = undefined;
      searchHelperChangeHandle('');
    };

    const fieldKeys = [...Object.keys(searchHelper.fieldAliasMap?.() ?? {}), ...Object.values(searchHelper.fieldsDefine ?? {})] as string[];
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

    const createSuffix = (): Nullable<{ append: () => JSXNode }> => {
      return {
        append: () => (
          <Button
            tabindex={-1}
            icon={<SearchIcon />}
            style={disabled && { cursor: 'not-allowed' }}
            click={(): void => {
              if (disabled) return;
              openSearchHelper();
            }}
          />
        ),
      };
    };

    const dialogProps = {
      visible: this.visible,
      title: t('qm.searchHelper.text'),
      width: searchHelper.width ?? '60%',
      height: searchHelper.height,
      loading: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: `${SizeHeight[$size || 'default'] + 20}px` },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
      onClose: (): void => {
        this.visible = false;
      },
    };

    const searchHelperProps = {
      ...searchHelper,
      initialValue: merge({}, searchHelper.initialValue),
      onClose: (visible: boolean, data): void => {
        if (data) {
          closeSearchHelper(data);
        } else {
          this.visible = false;
        }
      },
    };

    const cls = {
      [`el-search-helper`]: true,
    };

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
        <el-input
          ref={type}
          class={cls}
          modelValue={form[fieldName]}
          title={form[fieldName]}
          minlength={minlength}
          maxlength={maxlength}
          placeholder={!disabled ? placeholder : ''}
          prefix-icon={prefixIcon}
          suffix-icon={suffixIcon}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          onChange={(val: string): void => {
            !val && clearSearchHelperValue();
          }}
          onFocus={onFocus}
          onBlur={() => {
            onBlur(form[fieldName]);
          }}
          onClick={() => {
            onClick(form[fieldName]);
          }}
          onDblclick={() => {
            onDblClick(form[fieldName]);
            if (disabled) return;
            openSearchHelper();
          }}
          onKeydown={(ev) => {
            if (ev.keyCode !== 13) return;
            prevent(ev);
            openSearchHelper();
          }}
          v-slots={createSuffix()}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
        <Dialog {...dialogProps}>
          <TreeTableHelper {...searchHelperProps} />
        </Dialog>
      </el-form-item>
    );
  },
});
