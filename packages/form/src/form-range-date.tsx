/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:27
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks';
import { noop, toDate, dateFormat, setDisabledDate } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode, Nullable } from '../../_utils/types';

export default defineComponent({
  name: 'FormRangeDate',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  mounted() {
    const [$startInput, $endInput] = this.$el.querySelectorAll('.el-form-item__content .el-input__inner');
    this._start = addEventListener($startInput, 'input', (ev: Event): void => {
      this.startInputText = (ev.target as HTMLInputElement).value;
    });
    this._end = addEventListener($endInput, 'input', (ev: Event): void => {
      this.endInputText = (ev.target as HTMLInputElement).value;
    });
  },
  beforeUnmount() {
    this._start?.remove();
    this._end?.remove();
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
      style = {},
      placeholder = [],
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;

    const { dateType = 'daterange', minDateTime, maxDateTime, startDisabled, endDisabled, shortCuts = !0 } = options;

    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));

    const DATE_RANGE_CONF = {
      daterange: {
        startPlaceholder: t('qm.form.daterangePlaceholder.0'),
        endPlaceholder: t('qm.form.daterangePlaceholder.1'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      datetimerange: {
        startPlaceholder: t('qm.form.timerangePlaceholder.0'),
        endPlaceholder: t('qm.form.timerangePlaceholder.1'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      exactdaterange: {
        startPlaceholder: t('qm.form.daterangePlaceholder.0'),
        endPlaceholder: t('qm.form.daterangePlaceholder.1'),
        valueFormat: 'YYYY-MM-DD',
      },
      monthrange: {
        startPlaceholder: t('qm.form.monthrangePlaceholder.0'),
        endPlaceholder: t('qm.form.monthrangePlaceholder.1'),
        valueFormat: 'YYYY-MM',
      },
      yearrange: {
        startPlaceholder: t('qm.form.yearrangePlaceholder.0'),
        endPlaceholder: t('qm.form.yearrangePlaceholder.1'),
        valueFormat: 'YYYY',
      },
    };

    // 日期区间快捷键方法
    const pickers = [
      {
        text: t('qm.form.dateRangePickers.0'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers.1'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers.2'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 90);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers.3'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 180);
          return date;
        })(),
      },
    ];

    const shortcutClickHandle = (ev: Event): void => {
      if ((ev.target as HTMLElement).nodeName !== 'BUTTON') return;
      if (endDisabled) return;
      const val: string = dayjs()
        .format(DATE_RANGE_CONF[dateType].valueFormat)
        .replace(/\d{2}:\d{2}:\d{2}$/, '23:59:59');
      form[fieldName][1] = val;
    };

    const startWrapProps = {
      modelValue: toDate(form[fieldName][0]),
      'onUpdate:modelValue': (val): void => {
        let value: string = dateFormat(val ?? undefined, DATE_RANGE_CONF[dateType].valueFormat) as string;
        if (value && dateType === 'daterange') {
          value = value.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00');
        }
        form[fieldName] = [value, form[fieldName][1]];
      },
    };

    const endWrapProps = {
      modelValue: toDate(form[fieldName][1]),
      'onUpdate:modelValue': (val): void => {
        let value: string = dateFormat(val ?? undefined, DATE_RANGE_CONF[dateType].valueFormat) as string;
        if (value && dateType === 'daterange') {
          value = value.replace(/\d{2}:\d{2}:\d{2}$/, '23:59:59');
        }
        form[fieldName] = [form[fieldName][0], value];
      },
    };

    const cls = [`range-date`, { [`disabled`]: disabled }];
    const popperCls: string = `date-picker__${fieldName.replace('|', '-')}`;

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
        <div class={cls} style={{ width: '100%', ...style }}>
          <el-date-picker
            ref={`${type}__start`}
            type={dateType.replace('exact', '').slice(0, -5)}
            popper-class={popperCls}
            {...startWrapProps}
            range-separator={'-'}
            placeholder={!disabled ? placeholder[0] ?? DATE_RANGE_CONF[dateType].startPlaceholder : ''}
            readonly={readonly}
            clearable={clearable}
            disabled={disabled || startDisabled}
            style={{ width: `calc(50% - 7px)` }}
            disabledDate={(time: Date): boolean => {
              return setDisabledDate(time, [minDateTime, form[fieldName][1]]);
            }}
            shortcuts={shortCuts && dateType.includes('date') ? pickers : []}
            onChange={(): void => onChange(form[fieldName])}
            onFocus={(): void => {
              this.$nextTick(() => {
                const $pickerBar: Nullable<HTMLElement> = document.querySelector(`.${popperCls}`)?.querySelector('.el-picker-panel__sidebar') || null;
                if ($pickerBar?.nodeType === 1) {
                  this._event = addEventListener($pickerBar, 'click', shortcutClickHandle);
                }
              });
            }}
            onBlur={() => {
              setTimeout(() => this._event?.remove(), 300);
              if (!['daterange', 'exactdaterange', 'datetimerange'].includes(dateType)) return;
              let val: string = this.startInputText || '';
              this.startInputText = '';
              // 检测格式是否合法
              if (!/^[\d-\s\:]+$/.test(val)) return;
              const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
              const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
              if (dateType === 'daterange' || dateType === 'exactdaterange') {
                val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
              }
              if (dateType === 'datetimerange') {
                val = val.replace(dateReg, '$1-$2-$3').replace(dateTimeReg, '$1-$2-$3 $4:$5:$6').slice(0, 19);
              }
              const oDate: Date = dayjs(val).toDate();
              const passed: boolean = !setDisabledDate(oDate, [minDateTime, form[fieldName][1]]);
              if (!passed) return;
              val = dateFormat(oDate, DATE_RANGE_CONF[dateType].valueFormat) as string;
              form[fieldName][0] = dateType === 'daterange' ? val.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00') : val;
            }}
          />
          <span class={disabled ? 'is-disabled' : ''} style="display: inline-block; text-align: center; width: 14px;">
            -
          </span>
          <el-date-picker
            ref={`${type}__end`}
            type={dateType.replace('exact', '').slice(0, -5)}
            {...endWrapProps}
            range-separator={'-'}
            placeholder={!disabled ? placeholder[1] ?? DATE_RANGE_CONF[dateType].endPlaceholder : ''}
            readonly={readonly}
            clearable={clearable}
            disabled={disabled || endDisabled}
            style={{ width: `calc(50% - 7px)` }}
            disabledDate={(time: Date): boolean => {
              return setDisabledDate(time, [form[fieldName][0], maxDateTime]);
            }}
            onChange={(): void => onChange(form[fieldName])}
            onBlur={() => {
              if (!['daterange', 'exactdaterange', 'datetimerange'].includes(dateType)) return;
              let val: string = this.endInputText || '';
              this.endInputText = '';
              // 检测格式是否合法
              if (!/^[\d-\s\:]+$/.test(val)) return;
              const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
              const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
              if (dateType === 'daterange' || dateType === 'exactdaterange') {
                val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
              }
              if (dateType === 'datetimerange') {
                val = val.replace(dateReg, '$1-$2-$3').replace(dateTimeReg, '$1-$2-$3 $4:$5:$6').slice(0, 19);
              }
              const oDate: Date = dayjs(val).toDate();
              const passed: boolean = !setDisabledDate(oDate, [form[fieldName][0], maxDateTime]);
              if (!passed) return;
              val = dateFormat(oDate, DATE_RANGE_CONF[dateType].valueFormat) as string;
              form[fieldName][1] = dateType === 'daterange' ? val.replace(/\d{2}:\d{2}:\d{2}$/, '23:59:59') : val;
            }}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
