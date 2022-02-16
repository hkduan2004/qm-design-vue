/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:20:41
 */
import { defineComponent, CSSProperties } from 'vue';
import { get } from 'lodash-es';
import { useLocale } from '../../hooks';
import { noop, deepFind, deepMapList } from './utils';
import { getPrefixCls } from '../../_utils/prefix';
import { getParserWidth } from '../../_utils/util';
import type { IDictDeep } from './types';
import type { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import ClickOutside from '../../directives/click-outside';

export default defineComponent({
  name: 'FormTreeSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option', 'multiple'],
  data() {
    Object.assign(this, { isLoaded: false });
    return {
      filterText: '',
      itemList: [],
      visible: false,
      width: '200px',
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
    formItemValue(): string | string[] {
      const { fieldName } = this.option;
      return this.$$form.form[fieldName];
    },
  },
  watch: {
    visible(next: boolean): void {
      if (next) {
        this.isLoaded = next;
        this.$nextTick(() => (this.width = this.calcSelectWidth()));
      }
    },
    fetchParams(): void {
      this.getItemList();
    },
    formItemValue(next: string | string[]): void {
      this.$refs[`tree`]?.setCheckedKeys(Array.isArray(next) ? next : [next]);
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    treeFilterTextHandle(input: string): void {
      this.$refs[`tree`].filter(input);
    },
    getItemText(val: string): string {
      return deepFind<IDictDeep>(this.itemList, val)?.text || '';
    },
    createSelectValue<T = string>(val: T | T[]): T | T[] {
      return !this.multiple ? this.getItemText(val as T) : (val as T[]).map((x) => this.getItemText(x)).filter((x) => !!x);
    },
    createTextValue<T = string>(val: T | T[]): T {
      const labels = this.createSelectValue(val);
      return !Array.isArray(labels) ? labels : labels.join(',');
    },
    calcSelectWidth(): string {
      return this.$refs[`select`].$el.getBoundingClientRect().width + 'px';
    },
    setSoftFocus(): void {
      this._is_lock = true;
      this.$refs[`select`].focus();
      this.$nextTick(() => (this._is_lock = false));
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
    // 工具方法
    deepFindValue(arr: IDictDeep[], mark: string): Nullable<IDictDeep> {
      let res = null;
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i].children)) {
          res = this.deepFindValue(arr[i].children, mark);
        }
        if (res) {
          return res;
        }
        if (arr[i].text === mark) {
          return arr[i];
        }
      }
      return res;
    },
  },
  render(): JSXNode {
    const { isFetch, multiple, width } = this;
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
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    const innerStyle: CSSProperties = {
      minWidth: '195px',
      maxHeight: '300px',
      marginLeft: '-12px',
      marginRight: '-12px',
      paddingLeft: '10px',
      paddingRight: '10px',
      overflowY: 'auto',
    };
    const prefixCls = getPrefixCls('tree-select');
    const textVal: string = this.createTextValue(form[fieldName]);
    this.$$form.setViewValue(fieldName, textVal);
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
        <div class="tree-select">
          <el-popover
            ref="popper"
            popper-class={`${prefixCls}__popper`}
            v-model={[this.visible, 'visible']}
            width={width}
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
            fallback-placements={['auto']}
            teleported={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            onAfterLeave={(): void => {
              this.filterText = '';
              this.treeFilterTextHandle(this.filterText);
            }}
            v-slots={{
              reference: (): JSXNode => (
                <el-select
                  ref="select"
                  popper-class="select-option"
                  modelValue={this.createSelectValue(form[fieldName])}
                  multiple={multiple}
                  title={multiple ? textVal : null}
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
                  onRemoveTag={(tag) => {
                    if (!multiple) return;
                    const val: string = this.deepFindValue(this.itemList, tag)?.value;
                    form[fieldName] = form[fieldName].filter((x) => x !== val);
                    onChange(form[fieldName], this.createTextValue(form[fieldName]));
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
                    form[fieldName] = !multiple ? undefined : [];
                    onChange(form[fieldName], '');
                  }}
                />
              ),
            }}
          >
            <div style={{ ...innerStyle, ...style }}>
              {this.isLoaded && (
                <>
                  <el-input
                    v-model={this.filterText}
                    placeholder={t('qm.form.treePlaceholder')}
                    onInput={(val: string): void => {
                      this.treeFilterTextHandle(val);
                    }}
                  />
                  <el-tree
                    ref="tree"
                    class="tree-select__tree"
                    data={this.itemList}
                    nodeKey={'value'}
                    props={{ children: 'children', label: 'text' }}
                    defaultCheckedKeys={multiple ? form[fieldName] : undefined}
                    style={{ marginTop: '5px' }}
                    checkStrictly={true}
                    defaultExpandAll={true}
                    expandOnClickNode={false}
                    showCheckbox={multiple}
                    checkOnClickNode={multiple}
                    // 节点过滤，配合输入框筛选使用
                    filterNodeMethod={(val, data): boolean => {
                      if (!val) return true;
                      return data.text.indexOf(val) !== -1;
                    }}
                    onNodeClick={(item): void => {
                      if (multiple || item.disabled) return;
                      form[fieldName] = item.value;
                      this.visible = !1;
                      this.setSoftFocus();
                      onChange(form[fieldName], this.createTextValue(form[fieldName]));
                    }}
                    onCheck={(data, item): void => {
                      if (!multiple) return;
                      form[fieldName] = item.checkedKeys;
                      onChange(form[fieldName], this.createTextValue(form[fieldName]));
                    }}
                  />
                </>
              )}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
