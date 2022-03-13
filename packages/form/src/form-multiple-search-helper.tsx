/*
 * @Author: 焦质晔
 * @Date: 2022-03-12 11:36:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-13 12:47:40
 */
import { defineComponent } from 'vue';
import { merge, isEqual } from 'lodash-es';
import { useLocale, useSize } from '../../hooks';
import { noop } from './utils';
import { warn } from '../../_utils/error';
import { getPrefixCls } from '../../_utils/prefix';
import { getParserWidth } from '../../_utils/util';
import { SizeHeight } from '../../_utils/types';
import type { JSXNode } from '../../_utils/types';

import { SearchIcon } from '../../icons';
import Dialog from '../../dialog';
import SearchHelper from '../../search-helper';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'FormMultipleSearchHelper',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  data() {
    return {
      visible: false,
      itemList: [],
    };
  },
  created() {
    this.initialHandle();
  },
  methods: {
    initialHandle(): void {
      const { searchHelper = {} } = this.option;
      const { fieldAliasMap } = searchHelper;
      if (!fieldAliasMap) {
        warn('QmForm', 'searchHelper 需要配置 `fieldAliasMap` 选项');
      }
      this.alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
      if (!(Object.keys(this.alias).includes('valueKey') && Object.keys(this.alias).includes('textKey'))) {
        warn('QmForm', 'fieldAliasMap 选项必须包含自身 `valueKey` 和  `textKey`');
      }
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
      placeholder = t('qm.form.selectPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { collapseTags } = options;

    // 打开搜索帮助面板
    const openSearchHelper = (cb?: () => void): void => {
      const beforeOpen = searchHelper.beforeOpen ?? searchHelper.open ?? trueNoop;
      const before = beforeOpen(form);
      if ((before as Promise<void>)?.then) {
        (before as Promise<void>)
          .then(() => {
            this.visible = true;
            cb?.();
          })
          .catch(() => {});
      } else if (before !== false) {
        this.visible = true;
        cb?.();
      }
    };

    // 搜索帮助关闭，回显值事件
    const closeSearchHelper = (data: Record<string, any>[]): void => {
      const { textKey, valueKey } = this.alias;
      const itemList = data.map((x) => ({ text: x[textKey], value: x[valueKey] }));
      this.itemList = itemList;
      setFormItemValue(itemList.map((x) => x.value));
      const { closed } = searchHelper;
      this.visible = false;
      closed?.(data);
    };

    const setFormItemValue = (value: string[]): void => {
      form[fieldName] = value;
      const { itemList } = this;
      const values = itemList.map((x) => x.value);
      if (!isEqual(value, values)) {
        this.itemList = itemList.filter((x) => value.includes(x.value));
      }
      onChange(value, this.itemList);
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
      multiple: true,
      initialValue: merge({}, searchHelper.initialValue),
      onClose: (visible: boolean, data): void => {
        if (data) {
          closeSearchHelper(data);
        } else {
          this.visible = false;
        }
      },
    };

    const textVal: string = this.itemList.map((x) => x.text).join(',');
    this.$$form.setViewValue(fieldName, textVal);

    const prefixCls = getPrefixCls('multiple-sh');

    const cls = {
      [prefixCls]: true,
    };

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
        <div class="multiple-sh" style={{ ...style }}>
          <el-select
            class={cls}
            modelValue={form[fieldName]}
            popper-class="select-option"
            multiple
            collapseTags={collapseTags}
            title={textVal}
            placeholder={!disabled ? placeholder : ''}
            clearable={clearable}
            disabled={disabled}
            teleported={false}
            onDblclick={() => {
              if (disabled) return;
              openSearchHelper();
            }}
            onChange={(val) => {
              setFormItemValue(val);
            }}
            suffix-icon={<SearchIcon />}
            v-slots={{
              default: (): JSXNode[] => this.itemList.map((x) => <el-option key={x.value} label={x.text} value={x.value} />),
            }}
          />
          <span
            class="search-btn"
            style={{ cursor: !disabled ? 'pointer' : 'not-allowed' }}
            onClick={() => {
              if (disabled) return;
              openSearchHelper();
            }}
          />
        </div>
        <Dialog {...dialogProps}>
          <SearchHelper {...searchHelperProps} />
        </Dialog>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
