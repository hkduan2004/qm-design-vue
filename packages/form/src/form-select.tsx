/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 14:53:16
 */
import { defineComponent } from 'vue';
import { get, cloneDeep } from 'lodash-es';
import { useLocale } from '../../hooks';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import pinyin from '../../_utils/pinyin';
import type { IDict } from './types';
import type { JSXNode, Nullable, AnyObject } from '../../_utils/types';

export default defineComponent({
  name: 'FormSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    // 原始数据
    Object.assign(this, { originItemList: [] });
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
    ['option.options.itemList']: {
      handler(next: Array<IDict>): void {
        if (this.isFetch) return;
        this.itemList = next ?? [];
        this.originItemList = cloneDeep(this.itemList);
      },
      immediate: true,
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    createViewText<T = string>(val: T | T[]): T {
      return !this.multiple
        ? this.itemList.find((x) => x.value === val)?.text
        : this.itemList
            .filter((x) => (val as T[])?.includes(x.value))
            .map((x) => x.text)
            .join(',');
    },
    filterMethodHandle(queryString = '', isPyt: boolean): Array<IDict> {
      const res: IDict[] = this.originItemList.filter(this.createSearchHelpFilter(queryString, isPyt));
      // 动态改变列表项
      this.itemList = res;
      return res;
    },
    createSearchHelpFilter(queryString: string, isPyt = true): Function {
      return (state) => {
        const pyt: string = pinyin
          .parse(state.text)
          .map((v) => {
            if (v.type === 2) {
              return v.target.toLowerCase().slice(0, 1);
            }
            return v.target;
          })
          .join('');
        const str: string = isPyt ? `${state.text}|${pyt}` : state.text;
        return str.toLowerCase().includes(queryString.toLowerCase());
      };
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, dataKey, valueKey = 'value', textKey = 'text' } = this.option.request;
      try {
        const res = await fetchApi(params);
        if (res.code === 200) {
          const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
          this.itemList = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
          this.originItemList = cloneDeep(this.itemList);
        }
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { multiple } = this;
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
      placeholder = t('qm.form.selectPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onEnter = noop,
      onChange = noop,
    } = this.option;
    const { filterable = !0, collapseTags = !0, openPyt = !0, limit } = options;

    const textVal: string = this.createViewText(form[fieldName]);
    this.$$form.setViewValue(fieldName, textVal);

    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val: string): void => {
        form[fieldName] = val;
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
        <el-select
          ref={type}
          {...wrapProps}
          multiple={multiple}
          multipleLimit={limit}
          collapseTags={collapseTags && multiple}
          filterable={filterable}
          title={multiple ? textVal : null}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          disabled={disabled}
          style={{ ...style }}
          filterMethod={(queryString: string): void => {
            if (!filterable) return;
            const res: Array<IDict> = this.filterMethodHandle(queryString, openPyt);
            // 精确匹配，直接赋值
            if (!multiple && res.length === 1) {
              form[fieldName] = res[0].value;
              // 触发 change 事件
              onChange(form[fieldName], res[0].text);
              // 失去焦点，自动带值
              this.$nextTick(() => this.$refs[type].blur());
            }
          }}
          onVisibleChange={(visible: boolean): void => {
            if (filterable && visible) {
              this.filterMethodHandle('');
            }
          }}
          onKeyup={(ev) => {
            if (ev.keyCode !== 13) return;
            const val = ev.target.value;
            onEnter(form[fieldName], val);
          }}
          onChange={(val: string): void => {
            onChange(val, this.createViewText(val));
          }}
          v-slots={{
            default: (): JSXNode[] => this.itemList.map((x) => <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />),
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
