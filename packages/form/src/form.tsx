/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 16:58:07
 */
import { ComponentPublicInstance, defineComponent } from 'vue';
import scrollIntoView from 'scroll-into-view-if-needed';
import { cloneDeep, xor } from 'lodash-es';
import { getParserWidth, isObject, isFunction } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { useSize, useLocale, useGlobalConfig } from '../../hooks';
import { warn } from '../../_utils/error';
import { noop, difference, isEmptyValue } from './utils';
import { FormColsMixin } from './form-cols-mixin';
import { PublicMethodsMixin } from './public-methods-mixin';
import { AuthMixin } from './auth-mixin';
import { props, ARRAY_TYPE, UNFIX_TYPE, DEFAULT_TRUE_VALUE, DEFAULT_FALSE_VALUE } from './types';
import type { IFormData, IFormItem, IFormDesc, IFormItemType } from './types';
import type { AnyObject, JSXNode, Nullable, ValueOf } from '../../_utils/types';

import { InfoCircleIcon, UpIcon, DownIcon, SearchIcon, ReloadIcon } from '../../icons';

import Space from '../../space';
import Button from '../../button';
import FieldsFilter from './fields-filter';
import FormInput from './form-input';
import FormRangeInput from './form-range-input';
import FromInputNumber from './form-input-number';
import FromRangeInputNumber from './form-range-input-number';
import FormTreeSelect from './form-tree-select';
import FormCascader from './form-cascader';
import FormSelect from './form-select';
import FormRegionSelect from './form-region-select';
import FormCitySelect from './form-city-select';
import FormSwitch from './form-switch';
import FormRadio from './form-radio';
import FromCheckbox from './form-checkbox';
import FormCheckboxGroup from './form-checkbox-group';
import FormTextArea from './form-text-area';
import FormDivider from './form-divider';
import FormSearchHelper from './form-search-helper';
import FormMultipleSearchHelper from './form-multiple-search-helper';
import FormTreeTableHelper from './form-tree-table-helper';
import FormMultipleTreeHelper from './form-multiple-tree-table-helper';
import FormiImmediate from './form-immediate';
import FormTime from './form-time';
import FormRangeTime from './form-range-time';
import FormTimeSelect from './form-time-select';
import FormRangeTimeSelect from './form-range-time-select';
import FormDate from './form-date';
import FormRangeDateEl from './form-range-date-el';
import FormRangeDate from './form-range-date';
import FormUploadImg from './form-upload-img';
import FormUploadFile from './form-upload-file';
import FormTinymce from './form-tinymce';

const EMITS: string[] = ['collapse', 'valuesChange', 'change', 'finish', 'finishFailed', 'reset'];

type IComponentData = {
  form: IFormData;
  desc: IFormDesc;
  view: Record<string, string>;
  expand: Record<string, boolean>;
  collapse: boolean;
};

export default defineComponent({
  name: 'QmForm',
  componentName: 'QmForm',
  inheritAttrs: false,
  mixins: [FormColsMixin, PublicMethodsMixin, AuthMixin],
  provide() {
    return {
      $$form: this,
    };
  },
  emits: EMITS,
  props,
  data() {
    return {
      form: {}, // 表单
      desc: {}, // 描述信息
      view: {}, // 视图数据
      expand: {}, // 分隔符的 展开/收起
      collapse: false, // 筛选器 展开/收起 状态
    } as IComponentData;
  },
  computed: {
    formItems(): IFormItem[] {
      return this.list.filter((item: IFormItem) => !item.noAuth && !item.hidden);
    },
    flattenItems(): IFormItem[] {
      const result: Array<IFormItem> = [];
      this.formItems
        .filter((x) => x.type !== 'BREAK_SPACE' && x.fieldName)
        .forEach((x) => {
          if (isObject(x.labelOptions) && x.labelOptions.fieldName) {
            result.push(x.labelOptions);
          }
          result.push(x);
        });
      return result;
    },
    fieldNames(): string[] {
      return this.flattenItems.map((x) => x.fieldName);
    },
    rules(): Record<string, IFormItem['rules']> {
      const result: Record<string, IFormItem['rules']> = {};
      this.flattenItems.forEach((x) => {
        if (!x.rules) return;
        result[x.fieldName] = x.rules;
      });
      return result;
    },
    descContents(): Array<IFormDesc> {
      return this.flattenItems.filter((x) => isObject(x.descOptions)).map((x) => ({ fieldName: x.fieldName, content: x.descOptions.content }));
    },
    isFilterType(): boolean {
      return this.formType === 'search';
    },
    dividers(): Array<IFormItem> {
      return this.formItems.filter((x) => x.type === 'BREAK_SPACE');
    },
    blockFieldNames(): Array<Pick<IFormItem, 'fieldName' | 'label'>>[] {
      const result: any[] = [];
      for (let i = 0, len = this.dividers.length; i < len; i++) {
        let index: number = this.formItems.findIndex((x) => x === this.dividers[i]);
        let nextIndex: number | undefined = this.formItems.findIndex((x) => x === this.dividers[i + 1]);
        nextIndex = (nextIndex as number) > -1 ? nextIndex : undefined;
        result.push(this.formItems.slice(index, nextIndex).map((x) => ({ label: x.label, fieldName: x.fieldName })));
      }
      return result;
    },
    isDividerCollapse(): boolean {
      return this.dividers.some((x) => !!x.collapse);
    },
    showFilterCollapse(): boolean {
      return this.isCollapse && this.formItems.length >= this.flexCols;
    },
  },
  watch: {
    fieldNames: {
      handler(next: string[], prev: string[]): void {
        if ([...new Set(next)].length !== next.length) {
          warn('Form', `配置项 fieldName 属性是唯一的，不能重复`);
        }
        // 暂时先注掉，回头排查问题
        // this.createInputFocus();
        if (!Array.isArray(prev)) return;
        const diffs: string[] = xor(prev, next);
        if (!diffs.length) return;
        diffs.forEach((x) => {
          if (prev.includes(x)) {
            delete this.form[x];
          } else {
            let item: IFormItem = this.flattenItems.find((k) => k.fieldName === x);
            this.form[x] = this.getInitialValue(item, this.form[x] ?? this.initialValue[x]);
          }
        });
      },
      immediate: true,
    },
    form: {
      handler(val: IFormData): void {
        const diff = difference<IFormData>(val, this.initialValues);
        if (!Object.keys(diff).length) return;
        this.$emit('valuesChange', diff);
      },
      deep: true,
    },
    desc: {
      handler(val: IFormDesc): void {
        this.flattenItems.forEach((x) => {
          if (isObject(x.descOptions)) {
            x.descOptions.content = val[x.fieldName];
          }
        });
      },
      deep: true,
    },
    rules(): void {
      this.$nextTick(() => this.$refs[`form`].clearValidate());
    },
    descContents(val: Array<IFormDesc>): void {
      val.forEach((x) => (this.desc[x.fieldName] = x.content));
    },
    collapse(next: boolean): void {
      if (!this.showFilterCollapse) return;
      this.$emit('collapse', next);
    },
  },
  created() {
    this.initialHandle();
  },
  methods: {
    // 组件初始化方法
    initialHandle(): void {
      const _form = this.createFormValue();
      const _desc = this.createDescription();
      this.initialValues = cloneDeep(_form); // 用于重置表单值 - 深拷贝
      this.initialExtras = Object.assign({}, _desc); // 用于重置描述 - 浅拷贝
      this.form = _form;
      this.desc = _desc;
      this.expand = this.createDividerExpand();
    },
    // 创建表单数据
    createFormValue(): IFormData {
      const target: IFormData = {};
      this.flattenItems.forEach((x) => {
        target[x.fieldName] = this.getInitialValue(x, this.initialValue[x.fieldName]);
      });
      return Object.assign({}, this.initialValue, target);
    },
    // 创建描述数据
    createDescription(): IFormDesc {
      const target: IFormDesc = {};
      this.flattenItems
        .filter((x) => isObject(x.descOptions))
        .forEach((x) => {
          target[x.fieldName] = x.descOptions.content;
        });
      return Object.assign({}, target);
    },
    // 创建分隔符 展开/收起
    createDividerExpand(): IComponentData['expand'] {
      const target = {};
      this.dividers.filter((x) => x.collapse).forEach((x) => (target[x.fieldName] = !!x.collapse.defaultExpand));
      return Object.assign({}, this.expand, target);
    },
    // 获取表单数据的初始值
    getInitialValue(item: IFormItem, val: any): ValueOf<IFormData> {
      const { type, options = {}, readonly } = item;
      val = val ?? undefined;
      if (ARRAY_TYPE.includes(type)) {
        val = val ?? [];
      }
      if (type === 'CHECKBOX' || type === 'SWITCH') {
        val = val ?? options.falseValue ?? DEFAULT_FALSE_VALUE;
      }
      return val;
    },
    setViewValue(fieldName: string, val: string): void {
      if (!this.isDividerCollapse) return;
      if (val !== this.view[fieldName]) {
        this.view = Object.assign({}, this.view, { [fieldName]: val });
      }
    },
    createInputFocus(): void {
      if (!this.isAutoFocus) return;
      const { type, fieldName } = this.formItems.filter((x) => x.fieldName)[0] || {};
      if ((type === 'INPUT' || type === 'INPUT_NUMBER') && fieldName) {
        setTimeout(() => this.$$(`${fieldName}-${type}`)?.focus());
      }
    },
    createFormItemLabel(option): JSXNode {
      const { form } = this;
      const { label, type, description, fieldName, options = {}, style = {}, disabled, onChange = noop } = option;
      const { itemList, trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE } = options;
      return (
        <div class="custom-label__wrap" style={{ ...style }}>
          {type === 'SELECT' && (
            <el-select v-model={form[fieldName]} placeholder={''} disabled={disabled} onChange={onChange}>
              {itemList.map((x) => (
                <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
              ))}
            </el-select>
          )}
          {type === 'CHECKBOX' && (
            <>
              <span style={{ paddingRight: '5px' }}>{label}</span>
              <el-checkbox v-model={form[fieldName]} trueLabel={trueValue} falseLabel={falseValue} disabled={disabled} onChange={onChange} />
            </>
          )}
          {description && (
            <>
              <span style={{ paddingRight: '5px' }}>{label}</span>
              <el-tooltip tabindex={-1} effect="dark" placement="top" content={description}>
                <i class="svgicon">
                  <InfoCircleIcon />
                </i>
              </el-tooltip>
            </>
          )}
        </div>
      );
    },
    createFormItemDesc(option): JSXNode {
      const { fieldName, isTooltip, style = {} } = option;
      const content: JSXNode | string = this.desc[fieldName] ?? '';
      if (isTooltip) {
        return (
          <el-tooltip
            tabindex={-1}
            effect="dark"
            placement="right"
            v-slots={{
              content: (): JSXNode => <div>{content}</div>,
            }}
          >
            <i class="svgicon desc-icon">
              <InfoCircleIcon />
            </i>
          </el-tooltip>
        );
      }
      return (
        <span title={content as string} class="desc-text" style={{ ...style }}>
          {content}
        </span>
      );
    },
    renderFormItem(option: IFormItem): JSXNode {
      const { label, fieldName, labelWidth, labelOptions, style = {}, render = noop } = option;
      return (
        <el-form-item
          key={fieldName}
          label={label}
          labelWidth={labelWidth ? getParserWidth(labelWidth) : ''}
          prop={fieldName}
          v-slots={{
            label: (): JSXNode => labelOptions && this.createFormItemLabel(Object.assign({}, { label }, labelOptions)),
          }}
        >
          <div style={{ width: '100%', ...style }}>{render(option, this)}</div>
        </el-form-item>
      );
    },
    // ============================================
    BREAK_SPACE(option: IFormItem): JSXNode {
      return <FormDivider ref={option.fieldName} option={option} />;
    },
    // input + search helper
    INPUT(option: IFormItem): JSXNode {
      return <FormInput ref={option.fieldName} option={option} />;
    },
    RANGE_INPUT(option: IFormItem): JSXNode {
      return <FormRangeInput ref={option.fieldName} option={option} />;
    },
    INPUT_NUMBER(option: IFormItem): JSXNode {
      return <FromInputNumber ref={option.fieldName} option={option} />;
    },
    RANGE_INPUT_NUMBER(option: IFormItem): JSXNode {
      return <FromRangeInputNumber ref={option.fieldName} option={option} />;
    },
    TREE_SELECT(option: IFormItem): JSXNode {
      return <FormTreeSelect ref={option.fieldName} option={option} />;
    },
    MULTIPLE_TREE_SELECT(option: IFormItem): JSXNode {
      return <FormTreeSelect ref={option.fieldName} option={option} multiple />;
    },
    CASCADER(option: IFormItem): JSXNode {
      return <FormCascader ref={option.fieldName} option={option} />;
    },
    MULTIPLE_CASCADER(option: IFormItem): JSXNode {
      return <FormCascader ref={option.fieldName} option={option} multiple />;
    },
    SELECT(option: IFormItem): JSXNode {
      return <FormSelect ref={option.fieldName} option={option} />;
    },
    MULTIPLE_SELECT(option: IFormItem): JSXNode {
      return <FormSelect ref={option.fieldName} option={option} multiple />;
    },
    REGION_SELECT(option: IFormItem): JSXNode {
      return <FormRegionSelect ref={option.fieldName} option={option} />;
    },
    CITY_SELECT(option: IFormItem): JSXNode {
      return <FormCitySelect ref={option.fieldName} option={option} />;
    },
    SWITCH(option: IFormItem): JSXNode {
      return <FormSwitch ref={option.fieldName} option={option} />;
    },
    RADIO(option: IFormItem): JSXNode {
      return <FormRadio ref={option.fieldName} option={option} />;
    },
    CHECKBOX(option: IFormItem): JSXNode {
      return <FromCheckbox ref={option.fieldName} option={option} />;
    },
    MULTIPLE_CHECKBOX(option: IFormItem): JSXNode {
      return <FormCheckboxGroup ref={option.fieldName} option={option} />;
    },
    TEXT_AREA(option: IFormItem): JSXNode {
      return <FormTextArea ref={option.fieldName} option={option} />;
    },
    SEARCH_HELPER(option: IFormItem): JSXNode {
      return <FormSearchHelper ref={option.fieldName} option={option} />;
    },
    MULTIPLE_SEARCH_HELPER(option: IFormItem): JSXNode {
      return <FormMultipleSearchHelper ref={option.fieldName} option={option} />;
    },
    TREE_TABLE_HELPER(option: IFormItem): JSXNode {
      return <FormTreeTableHelper ref={option.fieldName} option={option} />;
    },
    MULTIPLE_TREE_TABLE_HELPER(option: IFormItem): JSXNode {
      return <FormMultipleTreeHelper ref={option.fieldName} option={option} />;
    },
    IMMEDIATE(option: IFormItem): JSXNode {
      return <FormiImmediate ref={option.fieldName} option={option} />;
    },
    TIME(option: IFormItem): JSXNode {
      return <FormTime ref={option.fieldName} option={option} />;
    },
    RANGE_TIME(option: IFormItem): JSXNode {
      return <FormRangeTime ref={option.fieldName} option={option} />;
    },
    TIME_SELECT(option: IFormItem): JSXNode {
      return <FormTimeSelect ref={option.fieldName} option={option} />;
    },
    RANGE_TIME_SELECT(option: IFormItem): JSXNode {
      return <FormRangeTimeSelect ref={option.fieldName} option={option} />;
    },
    DATE(option: IFormItem): JSXNode {
      return <FormDate ref={option.fieldName} option={option} />;
    },
    RANGE_DATE(option: IFormItem): JSXNode {
      return <FormRangeDate ref={option.fieldName} option={option} />;
    },
    RANGE_DATE_EL(option: IFormItem): JSXNode {
      return <FormRangeDateEl ref={option.fieldName} option={option} />;
    },
    UPLOAD_IMG(option: IFormItem): JSXNode {
      return <FormUploadImg ref={option.fieldName} option={option} />;
    },
    UPLOAD_FILE(option: IFormItem): JSXNode {
      return <FormUploadFile ref={option.fieldName} option={option} />;
    },
    TINYMCE(option: IFormItem): JSXNode {
      return <FormTinymce ref={option.fieldName} option={option} />;
    },
    // ============================================
    // 锚点定位没有通过校验的表单项
    scrollToField(fields: AnyObject<unknown>): void {
      const ids: string[] = Object.keys(fields);
      if (!ids.length) return;
      scrollIntoView(this.$refs[`form`].$el.querySelector(`#${ids[0]}`) as HTMLElement, {
        block: 'start',
        behavior: 'smooth',
        scrollMode: 'always',
        boundary: document.body,
      });
    },
    // 处理 from data 数据
    excuteFormValue(form: IFormData): void {
      for (let key in form) {
        const val = form[key];
        if (Array.isArray(val)) {
          val.forEach((x, i) => {
            if (isEmptyValue(x)) {
              val[i] = '';
            }
          });
        }
        if (key.includes('|') && Array.isArray(val)) {
          let [start, end] = key.split('|');
          form[start] = val[0] ?? '';
          form[end] = val[1] ?? '';
        }
      }
    },
    // 对返回数据进行格式化
    formatFormValue(form: IFormData): IFormData {
      const formData = {};
      for (let key in form) {
        if (!isEmptyValue(form[key])) continue;
        this.isFilterType ? (formData[key] = undefined) : (formData[key] = '');
      }
      return cloneDeep(Object.assign({}, form, formData));
    },
    // 表单校验
    formValidate(): Promise<IFormData> {
      this.excuteFormValue(this.form);
      return new Promise((resolve, reject) => {
        this.$refs[`form`].validate((valid, fields) => {
          const shChanged: boolean = this.flattenItems
            .filter((x: IFormItem) => x.type === 'SEARCH_HELPER')
            .some((x: IFormItem) => this.$$(x.fieldName)?._is_change);
          if (!valid || shChanged) {
            reject(fields);
            if (!valid) {
              !this.isFilterType ? this.scrollToField(fields) : (this.collapse = true);
            }
          } else {
            resolve(this.form);
          }
        });
      });
    },
    // 表单字段校验
    formItemValidate(fieldName: string): void {
      this.$refs[`form`].validateField(fieldName);
    },
    // 表单提交
    async submitForm(ev: Event): Promise<void> {
      ev?.preventDefault();
      try {
        const res = await this.formValidate();
        const data = this.formatFormValue(res);
        this.$emit('finish', data);
        this.$emit('change', data);
      } catch (err) {
        this.$emit('finishFailed', err);
      }
    },
    // 表单重置
    resetForm(): void {
      this.flattenItems.forEach((x: IFormItem) => {
        if (!x.noResetable) {
          this.SET_FIELDS_VALUE({ [x.fieldName]: cloneDeep(this.initialValues[x.fieldName]) });
        }
        // 搜索帮助
        if (x.type === 'SEARCH_HELPER' || x.type === 'IMMEDIATE') {
          this.$$(x.fieldName)?.reset();
        }
      });
      // 额外字段
      this.clearForm(this.fieldNames);
      // this.$refs[`form`].resetFields();
      this.desc = Object.assign({}, this.initialExtras);
      this.$refs[`form`].clearValidate();
      if (this.isFilterType) {
        this.$emit('reset');
        // 重置后，执行表单提交 - 此功能待确认
        this.submitForm();
      }
    },
    // 清空表单
    clearForm(excludes?: string[]): void {
      for (let key in this.form) {
        if (excludes?.includes(key)) continue;
        this.form[key] = Array.isArray(this.form[key]) ? [] : undefined;
      }
    },
    // 获取表单项的 label
    getFormItemLabel(option: IFormItem): string {
      const { label, labelOptions } = option;
      if (typeof label === 'string' && label) {
        return label;
      }
      if (labelOptions?.type === 'SELECT') {
        const { fieldName, options = {} } = labelOptions;
        const { itemList = [] } = options;
        if (!itemList.length) {
          warn('QmForm', `fieldName 为 ${fieldName} 的表单项的 \`itemList\` 配置有误`);
          return '';
        }
        const value = this.form[fieldName] ?? itemList[0].value;
        return itemList.find((x) => x.value === value)?.text || '';
      }
      return '';
    },
    // 获取元素的显示状态
    getElementDisplay({ type, fieldName }): boolean {
      if (type === 'BREAK_SPACE') {
        return !0;
      }
      for (let i = 0, len = this.blockFieldNames.length; i < len; i++) {
        let arr = this.blockFieldNames[i];
        let divider = this.dividers.find((x) => x.fieldName === arr[0].fieldName);
        let limit = divider.collapse?.showLimit ?? arr.length - 1;
        for (let k = 1; k < arr.length; k++) {
          let x = arr[k];
          if (x.fieldName === fieldName && k > limit) {
            return this.expand[arr[0].fieldName];
          }
        }
      }
      return !0;
    },
    // 表单元素
    createFormItem(item: IFormItem): Nullable<JSXNode> {
      if (!isFunction(this[item.type])) {
        warn('Form', `配置项 ${item.fieldName} 的 type 类型错误`);
        return null;
      }
      return !item.invisible ? (item.render ? this.renderFormItem(item) : this[item.type](item)) : null;
    },
    // 表单布局
    createFormLayout(): Array<JSXNode> {
      const { flexCols: cols, defaultRows, formType, isFilterType, collapse, isFieldsDefine, isDividerCollapse, showFilterCollapse } = this;

      // 栅格列的数组
      const colsArr: Partial<IFormItem>[] = [];
      this.formItems.forEach((x: IFormItem) => {
        const { offsetLeft = 0, offsetRight = 0 } = x;
        for (let i = 0; i < offsetLeft; i++) {
          colsArr.push({});
        }
        colsArr.push(x);
        for (let i = 0; i < offsetRight; i++) {
          colsArr.push({});
        }
      });

      const colSpan = 24 / cols;
      const fieldCols: number[] = [];
      // 栅格所占的总列数
      const total = colsArr.reduce((prev, cur) => {
        const { selfCol = 1 } = cur;
        const sum: number = prev + selfCol;
        fieldCols.push(sum); // 当前栅格及之前所跨的列数
        return sum;
      }, 0);

      // 默认展示的行数
      const defaultPlayRows: number = defaultRows > Math.ceil(total / cols) ? Math.ceil(total / cols) : defaultRows;

      const tmpArr: number[] = []; // 用于获取最后一个展示栅格的 cols
      const colFormItems = colsArr.map((x, i) => {
        let { fieldName, selfCol = 1, type } = x;
        // 调整 selfCol 的大小
        selfCol = selfCol >= 24 || type === 'BREAK_SPACE' || type === 'TINYMCE' ? cols : selfCol;
        // 判断改栅格是否显示
        const isBlock: boolean = collapse || !showFilterCollapse ? true : fieldCols[i] < defaultPlayRows * cols;
        const isDisplay: boolean = isDividerCollapse ? this.getElementDisplay(x) : !0;
        if (isBlock) {
          tmpArr.push(fieldCols[i]);
        }
        return (
          <el-col
            key={i}
            type={UNFIX_TYPE.includes(type as IFormItemType) ? 'UN_FIXED' : 'FIXED'}
            id={fieldName}
            span={selfCol * colSpan}
            style={isFilterType ? { display: !showFilterCollapse || isBlock ? 'block' : 'none' } : { display: isDisplay ? 'block' : 'none' }}
          >
            {type ? this.createFormItem(x) : null}
          </el-col>
        );
      });

      const resultNodes = [...colFormItems];
      // 自定义表单项
      if (isFieldsDefine && formType === 'default') {
        resultNodes.push(<div class="form-fields__define">{this.createFieldsDefine()}</div>);
      }
      resultNodes.push(this.createSearchButtonLayout(tmpArr[tmpArr.length - 1]));

      return resultNodes;
    },
    // 搜索类型按钮布局
    createSearchButtonLayout(lastCols = 0): Nullable<JSXNode> {
      const { flexCols: cols, collapse, showFilterCollapse, $size, isFilterType, isSearchBtn, isFieldsDefine = true } = this;
      const { t } = useLocale();
      // 不是搜索类型
      if (!isFilterType) {
        return null;
      }
      const colSpan = 24 / cols;
      // 左侧偏移量
      const offset = cols - (lastCols % cols) - 1;
      return isSearchBtn ? (
        <el-col key="-" class="col-button" span={colSpan} offset={offset * colSpan} style={{ textAlign: 'right' }}>
          <Space containerStyle={{ marginRight: '10px' }}>
            <Button type="primary" size={$size} icon={<SearchIcon />} onClick={this.submitForm}>
              {t('qm.form.search')}
            </Button>
            <Button size={$size} icon={<ReloadIcon />} onClick={this.resetForm}>
              {t('qm.form.reset')}
            </Button>
          </Space>
          {isFieldsDefine ? this.createFieldsDefine() : null}
          {showFilterCollapse ? (
            <Button type="text" size={$size} style={{ marginLeft: '8px' }} onClick={() => (this.collapse = !collapse)}>
              {collapse ? t('qm.form.collect') : t('qm.form.spread')}
              <i class="svgicon" style={{ marginLeft: '2px' }}>
                {collapse ? <UpIcon /> : <DownIcon />}
              </i>
            </Button>
          ) : null}
        </el-col>
      ) : null;
    },
    // 表单类型按钮列表
    createFormButtonLayout(): Nullable<JSXNode> {
      const { flexCols: cols, formType, $size, isFilterType, isSubmitBtn } = this;
      const { t } = useLocale();
      if (isFilterType) {
        return null;
      }
      const colSpan = 24 / cols;
      return isSubmitBtn && formType === 'default' ? (
        <el-row gutter={0}>
          <el-col key="-" class="col-button" span={colSpan}>
            <el-form-item label={''}>
              <Space>
                <Button type="primary" size={$size} onClick={this.submitForm}>
                  {t('qm.form.save')}
                </Button>
                <Button size={$size} onClick={this.resetForm}>
                  {t('qm.form.reset')}
                </Button>
              </Space>
            </el-form-item>
          </el-col>
        </el-row>
      ) : null;
    },
    createFieldsDefine(): JSXNode {
      return <FieldsFilter size={this.$size} list={this.list} uniqueKey={this.uniqueKey} />;
    },
    // 获取子组件实例
    $$(paths: string): ComponentPublicInstance {
      let ret = this;
      paths.split('-').forEach((path) => {
        ret = ret?.$refs[path];
      });
      return ret;
    },
  },
  render(): JSXNode {
    const { form, rules, layout, labelWidth, formType, customClass } = this;
    const prefixCls = getPrefixCls('form');
    const { global } = useGlobalConfig();
    const { $size } = useSize(this.$props);
    const isVertical = layout === 'vertical';
    const wrapProps = {
      size: $size,
      model: form,
      rules,
      labelPosition: !isVertical ? 'right' : 'top',
      labelWidth: getParserWidth(labelWidth),
      onSubmit: (ev: Event): void => ev.preventDefault(),
    };
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}__vertical`]: isVertical,
      [`${prefixCls}__only-show`]: formType === 'onlyShow',
      [`${prefixCls}__label-error-color`]: global?.form?.showLabelErrorColor ?? false,
      [customClass]: !!customClass,
    };
    this.$size = $size;
    return (
      <div class={cls}>
        <el-form ref="form" {...wrapProps}>
          <el-row gutter={isVertical ? 20 : 0}>{this.createFormLayout()}</el-row>
          {this.createFormButtonLayout()}
        </el-form>
      </div>
    );
  },
});
