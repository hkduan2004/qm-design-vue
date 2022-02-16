/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:15:22
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import { noop, toDate, dateFormat, setDisabledDate } from './utils';
import { getParserWidth } from '../../_utils/util';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormRangeDateEl',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
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
    const { dateType = 'daterange', minDateTime, maxDateTime, shortCuts = !0, unlinkPanels = !0 } = options;

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

    const wrapProps = {
      modelValue: toDate(form[fieldName]),
      'onUpdate:modelValue': (val): void => {
        let value: string[] = dateFormat(val ?? [], DATE_RANGE_CONF[dateType].valueFormat) as string[];
        if (value.length && dateType === 'daterange') {
          value.map((x, i) => {
            return i === 0 ? x.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00') : x.replace(/\d{2}:\d{2}:\d{2}$/, '23:59:59');
          });
        }
        form[fieldName] = value;
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
        <el-date-picker
          type={dateType.replace('exact', '')}
          {...wrapProps}
          range-separator={'-'}
          start-placeholder={!disabled ? placeholder[0] ?? DATE_RANGE_CONF[dateType].startPlaceholder : ''}
          end-placeholder={!disabled ? placeholder[1] ?? DATE_RANGE_CONF[dateType].endPlaceholder : ''}
          unlink-panels={unlinkPanels}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          disabledDate={(time: Date): boolean => {
            return setDisabledDate(time, [minDateTime, maxDateTime]);
          }}
          shortcuts={shortCuts && dateType.includes('date') ? pickers : []}
          onChange={(): void => onChange(form[fieldName])}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
