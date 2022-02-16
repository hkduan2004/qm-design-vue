/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:12:50
 */
import { defineComponent, PropType } from 'vue';
import { useLocale } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

import config from './config';
import Form from '../../form';
import Button from '../../button';

export default defineComponent({
  name: 'Setting',
  emits: ['change', 'close'],
  props: ['setting', 'onChange', 'onClose'],
  data() {
    return {
      initialValue: this.getInitialvalue(),
      formList: this.createFormList(),
    };
  },
  methods: {
    getInitialvalue() {
      const { setting } = this;
      const { distance } = setting;
      return Object.assign(
        {},
        {
          disleft: distance.left,
          disright: distance.right,
          distop: distance.top,
          disbottom: distance.bottom,
          pageSize: setting.pageSize,
          direction: setting.direction,
          doubleSide: setting.doubleSide,
          doubleSideType: setting.doubleSideType,
          fixedLogo: setting.fixedLogo,
        }
      );
    },
    createFormList() {
      const { t } = useLocale();
      return [
        {
          type: 'BREAK_SPACE',
          label: t('qm.print.setPanel.printParameter'),
        },
        {
          type: 'SELECT',
          label: t('qm.print.setPanel.pagerType'),
          fieldName: 'pageSize',
          options: {
            itemList: [
              { text: 'A2', value: '420*594' },
              { text: 'A3', value: '420*297' },
              { text: 'A4', value: '210*297' },
              { text: 'A5', value: '210*148' },
              { text: t('qm.print.setPanel.carbonPaper'), value: '241*280' },
            ],
          },
        },
        {
          type: 'RADIO',
          label: t('qm.print.setPanel.printDirection'),
          fieldName: 'direction',
          options: {
            itemList: [
              { text: t('qm.print.setPanel.vertical'), value: 'vertical' },
              { text: t('qm.print.setPanel.horizontal'), value: 'horizontal' },
            ],
          },
        },
        {
          type: 'CHECKBOX',
          label: t('qm.print.setPanel.doublePrint'),
          fieldName: 'doubleSide',
          labelOptions: {
            type: 'SELECT',
            fieldName: 'doubleSideType',
            options: {
              itemList: [
                { text: t('qm.print.setPanel.autoDoublePrint'), value: 'auto' },
                { text: t('qm.print.setPanel.manualDoublePrint'), value: 'manual' },
              ],
            },
            disabled: !this.setting.doubleSide,
          },
          options: {
            trueValue: 1,
            falseValue: 0,
          },
          onChange: (val) => {
            this.formList.find((x) => x.fieldName === 'doubleSide').labelOptions.disabled = !val;
          },
        },
        {
          type: 'CHECKBOX',
          label: t('qm.print.setPanel.fixedLogo'),
          fieldName: 'fixedLogo',
          options: {
            trueValue: 1,
            falseValue: 0,
          },
        },
        {
          type: 'BREAK_SPACE',
          label: t('qm.print.setPanel.printMargin'),
        },
        {
          type: 'INPUT_NUMBER',
          label: t('qm.print.setPanel.leftMargin'),
          fieldName: 'disleft',
          options: {
            min: config.defaultDistance,
            step: 0.05,
            precision: 2,
            controls: true,
          },
          style: { width: `calc(100% - 50px)` },
          descOptions: {
            content: t('qm.print.setPanel.sizeUnit'),
          },
          rules: [{ required: true, message: t('qm.print.setPanel.noEmpty'), trigger: 'change' }],
        },
        {
          type: 'INPUT_NUMBER',
          label: t('qm.print.setPanel.rightMargin'),
          fieldName: 'disright',
          options: {
            min: config.defaultDistance,
            step: 0.05,
            precision: 2,
            controls: true,
          },
          style: { width: `calc(100% - 50px)` },
          descOptions: {
            content: t('qm.print.setPanel.sizeUnit'),
          },
          rules: [{ required: true, message: t('qm.print.setPanel.noEmpty'), trigger: 'change' }],
        },
        {
          type: 'INPUT_NUMBER',
          label: t('qm.print.setPanel.topMargin'),
          fieldName: 'distop',
          options: {
            min: config.defaultDistance,
            step: 0.05,
            precision: 2,
            controls: true,
          },
          style: { width: `calc(100% - 50px)` },
          descOptions: {
            content: t('qm.print.setPanel.sizeUnit'),
          },
          rules: [{ required: true, message: t('qm.print.setPanel.noEmpty'), trigger: 'change' }],
        },
        {
          type: 'INPUT_NUMBER',
          label: t('qm.print.setPanel.bottomMargin'),
          fieldName: 'disbottom',
          options: {
            min: config.defaultDistance,
            step: 0.05,
            precision: 2,
            controls: true,
          },
          style: { width: `calc(100% - 50px)` },
          descOptions: {
            content: t('qm.print.setPanel.sizeUnit'),
          },
          rules: [{ required: true, message: t('qm.print.setPanel.noEmpty'), trigger: 'change' }],
        },
      ];
    },
    async confirmHandle(): Promise<void> {
      const [err, data] = await this.$refs[`form`].GET_FORM_DATA();
      if (err) return;
      this.$emit('change', {
        distance: {
          left: data.disleft,
          right: data.disright,
          top: data.distop,
          bottom: data.disbottom,
        },
        pageSize: data.pageSize,
        direction: data.direction,
        doubleSide: data.doubleSide,
        doubleSideType: data.doubleSideType,
        fixedLogo: data.fixedLogo,
      });
      this.cancelHandle();
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { initialValue, formList } = this;
    const { t } = useLocale();
    return (
      <div>
        <Form ref="form" initialValue={initialValue} list={formList} cols={2} labelWidth={115} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={() => this.cancelHandle()}>{t('qm.dialog.close')}</Button>
          <Button type="primary" onClick={() => this.confirmHandle()}>
            {t('qm.dialog.confirm')}
          </Button>
        </div>
      </div>
    );
  },
});
