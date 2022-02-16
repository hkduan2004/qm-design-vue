/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:23:55
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { getParserWidth, isEmpty, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import { deepFind, deepMapList } from './utils';
import type { IDict, IDictDeep } from './types';
import type { JSXNode, AnyObject, Nullable } from '../../_utils/types';

import ClickOutside from '../../directives/click-outside';
import Tabs from '../../tabs';
import TabPane from '../../tab-pane';

import chinaData from './china-data';

const formatChinaData = (data: any, key: string): IDictDeep[] | undefined => {
  if (!data[key]) return;
  return Object.keys(data[key]).map((x) => ({
    text: data[key][x],
    value: x,
    children: formatChinaData(data, x),
  }));
};

// 判断 港澳
const isGA = (values: string[]): boolean => {
  return ['810000', '820000'].includes(values[0]);
};

const LEAVE_THREE = 3; // 省市区
const LEAVE_FOUR = 4; // 省市区-街道

export default defineComponent({
  name: 'FormRegionSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option'],
  data() {
    Object.assign(this, { prevText: '', isLoaded: false });
    return {
      itemList: [], // 省市区，不包含街道
      values: [],
      tabs: [], // 二维数组
      activeName: '0',
      visible: false,
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    isFetchStreet(): boolean {
      return !!this.option.request?.fetchStreetApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
    leave(): number {
      return !this.isFetchStreet ? LEAVE_THREE : LEAVE_FOUR;
    },
    formItemValue(): string {
      const { fieldName } = this.option;
      return this.$$form.form[fieldName];
    },
  },
  watch: {
    visible(next: boolean): void {
      if (next) {
        this.isLoaded = next;
        this.$nextTick(() => this.setMinWidth());
      }
    },
    fetchParams(): void {
      this.getItemList();
    },
    itemList(next: Array<IDictDeep>): void {
      this.tabs[0] = next.map((x) => ({ text: x.text, value: x.value })) as IDict[];
      this.isFetch && this.createTabs();
    },
    formItemValue(next: string): void {
      if (this.values.join(',') === next) return;
      this.initial();
    },
  },
  created() {
    if (this.isFetch) {
      this.getItemList();
    } else {
      this.itemList = this.option.options?.itemList ?? formatChinaData(chinaData, '86');
    }
    this.initial();
  },
  methods: {
    initial(): void {
      const { form } = this.$$form;
      const { fieldName } = this.option;
      this.values = (form[fieldName] ? form[fieldName].split(',') : []) as string[];
      this.createTabs();
      this.createActiveName(this.values.length ? this.values.length - 1 : 0);
    },
    setFormItemValue(): void {
      const { form } = this.$$form;
      const { fieldName, onChange = noop } = this.option;
      form[fieldName] = this.values.join(',');
      this.visible = !1;
      this.setSoftFocus();
      onChange(form[fieldName], this.createTextValue(form[fieldName]));
    },
    createActiveName(index: number): void {
      this.activeName = index.toString();
    },
    createTextValue(val: string): string {
      const values: string[] = val ? val.split(',') : [];
      return values.map((x, i) => this.tabs[i]?.find((k) => k.value === x)?.text).join('/');
    },
    setMinWidth(): void {
      setStyle(
        document.getElementById(this.$refs[`popper`].popperId) as HTMLElement,
        'minWidth',
        `${this.$refs[`select`].$el.getBoundingClientRect().width}px`
      );
    },
    setSoftFocus(): void {
      this._is_lock = true;
      this.$refs[`select`].focus();
      this.$nextTick(() => (this._is_lock = false));
    },
    createTabs(): void {
      if (!this.itemList.length) return;
      this.tabs = this.tabs.slice(0, 1);
      for (let i = 0; i < this.values.length; i++) {
        const target: Nullable<IDictDeep> = deepFind<IDictDeep>(this.itemList, this.values[i]);
        if (target && isEmpty(target.children)) {
          if (this.isFetchStreet) {
            this.getStreetList(this.values[i]);
          }
          break;
        }
        if (Array.isArray(target?.children)) {
          this.tabs[i + 1] = target?.children.map((x) => ({ text: x.text, value: x.value })) as IDict[];
        }
      }
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, dataKey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      try {
        const res = await fetchApi(params);
        if (res.code === 200) {
          const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
          this.itemList = deepMapList<IDictDeep>(dataList, valueKey, textKey);
        }
      } catch (err) {}
    },
    async getStreetList(code: string): Promise<void> {
      const { fetchStreetApi, dataKey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      try {
        const res = await fetchStreetApi({ code });
        if (res.code === 200) {
          const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
          this.tabs.push(dataList.map((x) => ({ text: x[textKey], value: x[valueKey] })) as IDict[]);
        }
      } catch (err) {}
    },
    renderTabs(): JSXNode {
      const { t } = useLocale();
      const tabPanes = this.tabs.map((arr, index) => {
        let label: string =
          arr.find((x) => x.value === this.values[index])?.text ||
          `${t('qm.form.selectPlaceholder').replace('...', '')}(${t(`qm.form.regionSelectLabel.${index}`)})`;
        let tabPaneProps = {
          label,
          name: index.toString(),
        };
        return (
          <TabPane key={label} {...tabPaneProps}>
            <div class="region-box">
              {arr.map((x) => (
                <span
                  key={x.value}
                  class={{ [`region-box__item`]: true, actived: this.values.includes(x.value) }}
                  title={x.text}
                  onClick={(): void => {
                    this.values[index] = x.value;
                    this.values = this.values.slice(0, index + 1);
                    // 港澳 是两级，比正常的少一级
                    const n = !isGA(this.values) ? this.leave : this.leave - 1;
                    if (index + 1 >= n) {
                      return this.setFormItemValue();
                    }
                    this.createTabs();
                    this.createActiveName(index + 1);
                  }}
                >
                  {x.text}
                </span>
              ))}
            </div>
          </TabPane>
        );
      });
      if (!tabPanes.length) {
        return <p class="el-select-dropdown__empty">{t('qm.form.emptyText')}</p>;
      }
      return <Tabs v-model={[this.activeName, 'modelValue']}>{tabPanes}</Tabs>;
    },
  },
  render(): JSXNode {
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
      onChange = noop,
    } = this.option;
    const prefixCls = getPrefixCls('region-select');

    let textValue: string = this.prevText;
    if (!this.visible) {
      let temp: string = this.createTextValue(form[fieldName]);
      if (temp === '' || temp.split('/').every((x) => x !== '')) {
        textValue = temp;
        this.prevText = textValue;
      }
    }

    this.$$form.setViewValue(fieldName, textValue);
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
        <div class="region-select">
          <el-popover
            ref="popper"
            popper-class={`${prefixCls}__popper`}
            v-model={[this.visible, 'visible']}
            width="auto"
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
            teleported={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            v-slots={{
              reference: (): JSXNode => (
                <el-select
                  ref="select"
                  popper-class="select-option"
                  modelValue={textValue}
                  placeholder={!disabled ? placeholder : ''}
                  clearable={clearable}
                  disabled={disabled}
                  readonly={readonly}
                  style={readonly && { pointerEvents: 'none' }}
                  teleported={false}
                  v-click-outside={($down, $up): void => {
                    if (document.getElementById(this.$refs[`popper`].popperId)?.contains($up)) return;
                    this.visible = !1;
                  }}
                  onFocus={(): void => {
                    if (disabled || readonly) return;
                    if (this._is_lock) return;
                    this.visible = !0;
                    this._focus_visible = !0;
                  }}
                  onKeydown={(ev): void => {
                    if (ev.keyCode === 9 || ev.keyCode === 27) {
                      this.visible = !1;
                    }
                  }}
                  onClick={(): void => {
                    if (disabled || readonly) return;
                    if (this._focus_visible) {
                      this._focus_visible = !1;
                    } else {
                      this.visible = !this.visible;
                    }
                  }}
                  onClear={(): void => {
                    if (disabled || readonly) return;
                    form[fieldName] = undefined;
                    onChange(form[fieldName], '');
                  }}
                />
              ),
            }}
          >
            <div class="container" style={{ ...style }}>
              {this.isLoaded && this.renderTabs()}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
