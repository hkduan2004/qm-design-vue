/*
 * @Author: 焦质晔
 * @Date: 2021-03-31 09:27:45
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:20:36
 */
import { defineComponent } from 'vue';
import scrollIntoView from 'scroll-into-view-if-needed';
import pinyin from '../../_utils/pinyin';
import { getParserWidth, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import type { IDict } from './types';
import type { JSXNode } from '../../_utils/types';

import ClickOutside from '../../directives/click-outside';

import chinaData from './china-data';

type ICity = {
  l: string;
  n: string;
  c: string;
  p: string;
  children?: ICity[];
};

const zxsCodes: string[] = ['110000', '120000', '310000', '500000']; // 直辖市
const gaCodes: string[] = ['810000', '820000']; // 港澳

const provinceLetter: IDict[] = [
  { text: 'A', value: 'A' },
  { text: 'F', value: 'F' },
  { text: 'G', value: 'G' },
  { text: 'H', value: 'H' },
  { text: 'J', value: 'J' },
  { text: 'L', value: 'L' },
  { text: 'N', value: 'N' },
  { text: 'Q', value: 'Q' },
  { text: 'S', value: 'S' },
  { text: 'T', value: 'T' },
  { text: 'X', value: 'X' },
  { text: 'Y', value: 'Y' },
  { text: 'Z', value: 'Z' },
  { text: '直辖市', value: 'Z1' },
  { text: '港澳', value: 'Z2' },
];

const cityLetter: IDict[] = [
  { text: 'A', value: 'A' },
  { text: 'B', value: 'B' },
  { text: 'C', value: 'C' },
  { text: 'D', value: 'D' },
  { text: 'E', value: 'E' },
  { text: 'F', value: 'F' },
  { text: 'G', value: 'G' },
  { text: 'H', value: 'H' },
  { text: 'J', value: 'J' },
  { text: 'K', value: 'K' },
  { text: 'L', value: 'L' },
  { text: 'M', value: 'M' },
  { text: 'N', value: 'N' },
  { text: 'P', value: 'P' },
  { text: 'Q', value: 'Q' },
  { text: 'R', value: 'R' },
  { text: 'S', value: 'S' },
  { text: 'T', value: 'T' },
  { text: 'W', value: 'W' },
  { text: 'X', value: 'X' },
  { text: 'Y', value: 'Y' },
  { text: 'Z', value: 'Z' },
  { text: '直辖市', value: 'Z1' },
  { text: '港澳', value: 'Z2' },
];

const createPyt = (input: string): string => {
  return pinyin
    .parse(input)
    .map((v) => {
      if (v.type === 2) {
        return v.target.toLowerCase().slice(0, 1);
      }
      return v.target;
    })
    .join('');
};

const formatChinaData = (data: any, key: string, step: number = 1): ICity[] | undefined => {
  if (step > 2 || !data[key]) return;
  const codes: string[] = key === '86' ? Object.keys(data[key]).filter((x) => ![...zxsCodes, ...gaCodes].includes(x)) : Object.keys(data[key]);
  return codes.map((x) => ({
    l: createPyt(data[key][x].slice(0, 1)).toUpperCase(),
    n: data[key][x],
    c: x,
    p: key,
    children: formatChinaData(data, x, step + 1),
  }));
};

const createOtherData = (data: any, codes: string[]): ICity[] => {
  return codes.map((x) => ({
    l: createPyt(data['86'][x].slice(0, 1)).toUpperCase(),
    n: data['86'][x],
    c: x,
    p: '86',
    children: undefined,
  }));
};

export default defineComponent({
  name: 'FormCitySelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option'],
  data() {
    this.zxsAndGa = this.createZxsAndGa();
    this.provinces = this.createProvince();
    this.allCities = this.createAllCity();
    this.letterCities = this.createCity();
    Object.assign(this, { isLoaded: false });
    return {
      select_type: '0', // 0 -> 按省份    1 -> 按城市
      active_key: '',
      visible: false,
    };
  },
  watch: {
    visible(next: boolean): void {
      if (next) {
        this.isLoaded = next;
        this.$nextTick(() => this.setMinWidth());
      }
    },
    select_type(): void {
      this.active_key = '';
      this.$refs[`scroll`].scrollTop = 0;
    },
  },
  methods: {
    clickHadnle(val: string): void {
      const { form } = this.$$form;
      const { fieldName, onChange = noop } = this.option;
      form[fieldName] = val;
      this.visible = !1;
      this.setSoftFocus();
      onChange(val, this.createTextValue(val));
    },
    createTextValue(val: string): string {
      return this.allCities.find((x) => x.c === val)?.n || '';
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
    scrollHandle(val: string): void {
      this.active_key = val;
      scrollIntoView(this.$refs[val] as HTMLElement, {
        block: 'start',
        behavior: 'smooth',
        boundary: this.$refs[`scroll`],
      });
    },
    createZxsAndGa(): ICity[] {
      return [
        { l: 'Z1', n: '直辖市', c: '', p: '', children: createOtherData(chinaData, zxsCodes) },
        { l: 'Z2', n: '港澳', c: '', p: '', children: createOtherData(chinaData, gaCodes) },
      ];
    },
    createProvince(): ICity[] {
      const result: ICity[] = formatChinaData(chinaData, '86') ?? [];
      return result.concat(this.zxsAndGa);
    },
    createAllCity(): ICity[] {
      const result: ICity[] = [];
      this.provinces.forEach((x) => result.push(...x.children));
      return result;
    },
    createCity(): ICity[] {
      const result: ICity[] = cityLetter
        .filter((x) => x.value !== 'Z1' && x.value !== 'Z2')
        .map((x) => {
          return {
            l: x.value,
            n: x.text,
            c: '',
            p: '',
            children: this.allCities.filter((x) => ![...zxsCodes, ...gaCodes].includes(x.c)).filter((k) => k.l === x.value),
          };
        });
      return result.concat(this.zxsAndGa);
    },
    renderType(): JSXNode {
      const { t } = useLocale();
      return (
        <el-radio-group v-model={this.select_type} size="mini">
          <el-radio-button label="0">{t('qm.form.citySelectType.0')}</el-radio-button>
          <el-radio-button label="1">{t('qm.form.citySelectType.1')}</el-radio-button>
        </el-radio-group>
      );
    },
    renderLetter(): JSXNode[] {
      const letters: IDict[] = this.select_type === '0' ? provinceLetter : cityLetter;
      return letters.map((x) => (
        <li key={x.value} class={{ tag: !0, actived: x.value === this.active_key }} onClick={() => this.scrollHandle(x.value)}>
          {x.text}
        </li>
      ));
    },
    renderSelect(): JSXNode {
      const { form } = this.$$form;
      const { t } = useLocale();
      const { fieldName, onChange = noop } = this.option;
      return (
        <el-select
          size="mini"
          v-model={form[fieldName]}
          placeholder={t('qm.form.selectPlaceholder')}
          filterable
          teleported={false}
          onChange={(val: string): void => {
            setTimeout(() => this.clickHadnle(val));
          }}
          v-slots={{
            default: (): JSXNode[] => this.allCities.map((x) => <el-option key={x.c} value={x.c} label={x.n} />),
          }}
        />
      );
    },
    renderCity(val: string): JSXNode[] {
      const cites: ICity[] = this.select_type === '0' ? this.provinces : this.letterCities;
      return cites.map((x) => (
        <>
          <dt ref={x.l}>{x.n}：</dt>
          <dd>
            {x.children?.map((k) => (
              <li key={k.c} class={{ actived: k.c === val }} onClick={() => this.clickHadnle(k.c)}>
                {k.n}
              </li>
            ))}
          </dd>
        </>
      ));
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
    const prefixCls = getPrefixCls('city-select');
    let textValue: string = this.createTextValue(form[fieldName]);
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
        <div class="city-select">
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
              {this.isLoaded && (
                <div class="city-drop">
                  <div class="city-drop-toper">
                    <div class="city-drop-toper__type">{this.renderType()}</div>
                    <div class="city-drop-toper__search">{this.renderSelect()}</div>
                  </div>
                  <div class="city-drop-letter">{this.renderLetter()}</div>
                  <div ref="scroll" class="city-drop-list">
                    <dl>{this.renderCity(form[fieldName])}</dl>
                  </div>
                </div>
              )}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
