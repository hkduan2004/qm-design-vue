/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:09
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import dayjs from 'dayjs';
import { useLocale } from '../../hooks';
import { noop, toDate, dateFormat, setDisabledDate } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormDate',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  mounted() {
    const $input: HTMLInputElement = this.$el.querySelector('.el-form-item__content .el-input__inner');
    this._event = addEventListener($input, 'input', (ev: Event): void => {
      this.inputText = (ev.target as HTMLInputElement).value;
    });
  },
  beforeUnmount() {
    this._event?.remove();
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
      placeholder,
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { dateType = 'date', minDateTime, maxDateTime, shortCuts = !0 } = options;

    this.$$form.setViewValue(fieldName, form[fieldName]);

    const DATE_CONF = {
      date: {
        placeholder: t('qm.form.datePlaceholder'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      datetime: {
        placeholder: t('qm.form.timePlaceholder'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      exactdate: {
        placeholder: t('qm.form.datePlaceholder'),
        valueFormat: 'YYYY-MM-DD',
      },
      week: {
        placeholder: t('qm.form.weekPlaceholder'),
        valueFormat: 'YYYY-MM-DD',
      },
      month: {
        placeholder: t('qm.form.monthPlaceholder'),
        valueFormat: 'YYYY-MM',
      },
      year: {
        placeholder: t('qm.form.yearPlaceholder'),
        valueFormat: 'YYYY',
      },
    };

    // 日期快捷键方法
    const pickers = [
      {
        text: t('qm.form.datePickers.0'),
        value: new Date(),
      },
      {
        text: t('qm.form.datePickers.1'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24);
          return date;
        })(),
      },
      {
        text: t('qm.form.datePickers.2'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
          return date;
        })(),
      },
      {
        text: t('qm.form.datePickers.3'),
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
          return date;
        })(),
      },
    ];

    const wrapProps = {
      modelValue: toDate(form[fieldName]),
      'onUpdate:modelValue': (val): void => {
        let value: string = dateFormat(val ?? undefined, DATE_CONF[dateType].valueFormat) as string;
        if (value && dateType === 'date') {
          value = value.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00');
        }
        form[fieldName] = value;
      },
      ...(dateType === 'week' ? { format: 'gggg 第 ww 周' } : null), // 需要改成多语言
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
        <el-date-picker
          ref={type}
          type={dateType.replace('exact', '')}
          {...wrapProps}
          range-separator={'-'}
          placeholder={!disabled ? placeholder ?? DATE_CONF[dateType].placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          disabledDate={(time: Date): boolean => {
            return setDisabledDate(time, [minDateTime, maxDateTime]);
          }}
          shortcuts={shortCuts && dateType.includes('date') ? pickers : []}
          onChange={(): void => onChange(form[fieldName])}
          onBlur={() => {
            if (!['date', 'exactdate', 'datetime'].includes(dateType)) return;
            let val: string = this.inputText || '';
            this.inputText = '';
            // 检测格式是否合法
            if (!/^[\d-\s\:]+$/.test(val)) return;
            const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
            const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
            if (dateType === 'date' || dateType === 'exactdate') {
              val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
            }
            if (dateType === 'datetime') {
              val = val.replace(dateReg, '$1-$2-$3').replace(dateTimeReg, '$1-$2-$3 $4:$5:$6').slice(0, 19);
            }
            const oDate: Date = dayjs(val).toDate();
            const passed: boolean = !setDisabledDate(oDate, [minDateTime, maxDateTime]);
            if (!passed) return;
            val = dateFormat(oDate, DATE_CONF[dateType].valueFormat) as string;
            form[fieldName] = dateType === 'date' ? val.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00') : val;
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
