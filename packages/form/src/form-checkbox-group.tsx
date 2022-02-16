/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:14:38
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { AnyObject, JSXNode, Nullable } from '../../_utils/types';

export default defineComponent({
  name: 'FormCheckboxGroup',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
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
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, dataKey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      try {
        const res = await fetchApi(params);
        if (res.code === 200) {
          const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
          this.itemList = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
        }
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { isFetch } = this;
    const { form } = this.$$form;
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
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList, limit } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    this.$$form.setViewValue(
      fieldName,
      this.itemList
        .filter((x) => form[fieldName].includes(x.value))
        .map((x) => x.text)
        .join(',')
    );
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
        <el-checkbox-group v-model={form[fieldName]} max={limit} disabled={disabled} style={{ ...style }} onChange={onChange}>
          {this.itemList.map((x) => {
            return (
              <el-checkbox key={x.value} label={x.value} disabled={x.disabled}>
                {x.text}
              </el-checkbox>
            );
          })}
        </el-checkbox-group>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
