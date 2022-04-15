/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-07 15:15:24
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { useLocale } from '../../hooks';
import { noop, deepFindValues, deepMapList } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { IDictDeep } from './types';
import type { AnyObject, JSXNode, Nullable } from '../../_utils/types';

export default defineComponent({
  name: 'FormCascader',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    return {
      itemList: [],
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
  },
  watch: {
    fetchParams(): void {
      this.getItemList();
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    createFormValue(vals: any[] | null): string | string[] {
      if (!this.multiple) {
        return vals?.join(',') || '';
      }
      return vals?.map((arr) => arr.join(',')) || [];
    },
    createCascaderValue(val = ''): any {
      if (!this.multiple) {
        return val.split(',');
      }
      return (val as unknown as string[]).map((x) => x.split(','));
    },
    createViewText(val = ''): string {
      if (!this.multiple) {
        return deepFindValues<IDictDeep>(this.itemList, val)
          .map((option) => option.text)
          .join('/');
      }
      return (val as unknown as string[])
        .map((x) => {
          return deepFindValues<IDictDeep>(this.itemList, x)
            .map((option) => option.text)
            .join('/');
        })
        .join(',');
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, dataKey, valueKey = 'value', textKey = 'text' } = this.option.request;
      try {
        const res = await fetchApi(params);
        if (res.code === 200) {
          const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
          this.itemList = deepMapList<IDictDeep>(dataList, valueKey, textKey);
        }
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { multiple, isFetch } = this;
    const { form } = this.$$form;
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
      onChange = noop,
    } = this.option;
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    this.$$form.setViewValue(fieldName, this.createViewText(form[fieldName]));
    const wrapProps = {
      modelValue: this.createCascaderValue(form[fieldName]),
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = this.createFormValue(val);
      },
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
        <el-cascader
          {...wrapProps}
          props={{ children: 'children', label: 'text', multiple }}
          options={this.itemList}
          clearable={clearable}
          disabled={disabled}
          placeholder={!disabled ? placeholder : ''}
          style={{ ...style }}
          filterable
          collapse-tags
          show-all-levels
          onChange={() => {
            onChange(form[fieldName]);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
