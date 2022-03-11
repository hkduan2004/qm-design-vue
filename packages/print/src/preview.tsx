/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 23:13:27
 */
import { defineComponent, PropType } from 'vue';
import localforage from 'localforage';
import { merge } from 'lodash-es';
import { getLodop } from './LodopFuncs';
import { getPrefixCls } from '../../_utils/prefix';
import { deepToRaw, isObject } from '../../_utils/util';
import { warn } from '../../_utils/error';
import { useLocale } from '../../hooks';
import { localeMixin } from '../../mixins';
import type { JSXNode } from '../../_utils/types';

import config from './config';

import { DownloadIcon, SettingIcon, PrinterIcon } from '../../icons';
import InputNumber from '../../form/src/InputNumber';
import Button from '../../button';
import PrintMixin from './core-methods';
import Container from './container';
import Setting from './setting';
import Dialog from '../../dialog';

type IDict = {
  text: string;
  value: string | number;
};

export default defineComponent({
  name: 'Preview',
  mixins: [localeMixin, PrintMixin],
  emits: ['close'],
  provide() {
    return {
      $$preview: this,
    };
  },
  props: ['size', 'dataSource', 'templateRender', 'preview', 'uniqueKey', 'defaultConfig', 'closeOnPrinted'],
  data() {
    return {
      form: {
        printerName: -1,
        printerType: this.defaultConfig?.printerType || 'laser',
        copies: this.defaultConfig?.copies || 1,
        scale: 1,
        setting: {
          distance: {
            left: config.defaultDistance,
            right: config.defaultDistance,
            top: config.defaultDistance,
            bottom: config.defaultDistance,
          },
          pageSize: '210*297',
          direction: this.defaultConfig?.direction || 'vertical',
          doubleSide: 0,
          doubleSideType: 'auto',
          fixedLogo: 0,
        },
      },
      printPage: undefined,
      currentPage: 1,
      totalPage: 0,
      visible: !1,
    };
  },
  computed: {
    printerTypeItems(): IDict[] {
      return [
        { text: this.$t('qm.print.laserPrinter'), value: 'laser' },
        { text: this.$t('qm.print.stylusPrinter'), value: 'stylus' },
      ];
    },
    printerItems(): IDict[] {
      const LODOP = getLodop();
      const result: IDict[] = [{ text: this.$t('qm.print.defaultPrinter'), value: -1 }];
      try {
        const iPrinterCount = LODOP.GET_PRINTER_COUNT();
        for (let i = 0; i < iPrinterCount; i++) {
          result.push({ text: LODOP.GET_PRINTER_NAME(i), value: i });
        }
      } catch (err) {
        warn('qm-print', `[ClientPrint]: 请安装 LODOP 打印插件`);
      }
      return result;
    },
    isWindowsPrinter(): boolean {
      const {
        printerItems,
        form: { printerName },
      } = this;
      // Windows 内置打印机
      const regExp: RegExp = /OneNote|Microsoft|Fax/;
      return !regExp.test(printerItems.find((x) => x.value === printerName).text);
    },
    pageSize(): number[] {
      return this.form.setting.pageSize.split('*').map((x) => Number(x));
    },
    printerKey(): string {
      return this.uniqueKey ? `print_${this.uniqueKey}` : '';
    },
  },
  async created() {
    if (!this.printerKey) return;
    try {
      let res: any = await localforage.getItem(this.printerKey);
      if (!res) {
        res = await this.getPrintConfig(this.printerKey);
        if (isObject(res)) {
          await localforage.setItem(this.printerKey, res);
        }
      }
      if (isObject(res) && Object.keys(res).length) {
        merge(this.form, {
          ...res,
          printerName: this.printerItems.find((x) => x.text === res.printerName)?.value ?? -1,
        });
      }
    } catch (err) {}
  },
  methods: {
    settingChange(val): void {
      this.form.setting = val;
    },
    printerTypeChange(val: string): void {
      this.form.setting.pageSize = val === 'stylus' ? '241*280' : '210*297';
    },
    pageChangeHandle(val: number): void {
      this.currentPage = val;
      this.$refs[`container`]?.createPreviewDom();
    },
    exportClickHandle(): void {
      this.doExport(this.$refs[`container`].createExportHtml());
    },
    async printClickHandle(): Promise<void> {
      this.doPrint(this.$refs[`container`].createPrintHtml(this.printPage));
      if (!this.printerKey) return;
      // 存储配置信息
      try {
        const printConfig = deepToRaw({
          ...this.form,
          printerName: this.printerItems.find((x) => x.value === this.form.printerName).text,
        });
        await localforage.setItem(this.printerKey, printConfig);
        await this.savePrintConfig(this.printerKey, printConfig);
      } catch (err) {}
    },
    async getPrintConfig(key: string): Promise<unknown[] | void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {}
    },
    async savePrintConfig(key: string, value): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {}
    },
    doClose(): void {
      this.$emit('close', !0);
    },
  },
  render(): JSXNode {
    const { size, form, preview, printerTypeItems, printerItems, currentPage, totalPage, visible, pageSize, dataSource, templateRender } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('print-preview');
    const dialogProps = {
      visible,
      title: t('qm.print.pageSetting'),
      width: '50%',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    const paginationProps = {
      small: size === 'small',
      currentPage,
      pageCount: totalPage,
      pagerCount: 5,
      background: true,
      layout: 'prev, pager, next',
      style: { paddingLeft: 0, paddingRight: 0 },
      onCurrentChange: this.pageChangeHandle,
    };
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--small`]: size === 'small',
      [`${prefixCls}--default`]: size === 'default',
      [`${prefixCls}--large`]: size === 'large',
    };
    return preview ? (
      <div class={cls}>
        <div class="outer">
          <div class="header">
            <span>
              {t('qm.print.printer')}：
              <el-select v-model={form.printerName} style={{ width: '120px' }}>
                {printerItems.map((x) => (
                  <el-option key={x.value} label={x.text} value={x.value} />
                ))}
              </el-select>
            </span>
            <span>
              {t('qm.print.type')}：
              <el-select v-model={form.printerType} style={{ width: '120px' }} onChange={this.printerTypeChange}>
                {printerTypeItems.map((x) => (
                  <el-option key={x.value} label={x.text} value={x.value} />
                ))}
              </el-select>
            </span>
            <span>
              {t('qm.print.copies')}：
              <InputNumber v-model={form.copies} controls={!1} min={1} precision={0} style={{ width: '50px' }} />
            </span>
            <span>
              {t('qm.print.printPage.0')}
              <InputNumber
                v-model={this.printPage}
                controls={!1}
                min={0}
                max={totalPage}
                precision={0}
                style={{ width: '50px', marginLeft: '4px', marginRight: '4px' }}
              />
              {t('qm.print.printPage.1')}
            </span>
            <span>
              <el-pagination {...paginationProps} />
            </span>
            <span>
              <Button type="text" icon={<SettingIcon />} onClick={() => (this.visible = !0)}>
                {t('qm.print.setting')}
              </Button>
            </span>
            <span>
              <Button type="text" icon={<DownloadIcon />} onClick={this.exportClickHandle}>
                {t('qm.print.export')}
              </Button>
            </span>
            <span>
              <Button icon={<PrinterIcon />} type="primary" onClick={this.printClickHandle}>
                {t('qm.print.print')}
              </Button>
            </span>
          </div>
          <div class="main">
            <Container ref="container" dataSource={dataSource} templateRender={templateRender} directPrint={!1} />
          </div>
          <div class="footer">
            <span>
              {t('qm.print.scale')}：
              <el-slider v-model={form.scale} step={0.1} min={0.5} max={1.5} show-tooltip={!1} />
              <em class="scale-text">{`${Math.floor(form.scale * 100)}%`}</em>
            </span>
            <span>
              {t('qm.print.paper')}：{pageSize[0]}mm * {pageSize[1]}mm
            </span>
            <span>
              {t('qm.print.pageNumber')}：{t('qm.print.pagination', { currentPage, totalPage })}
            </span>
          </div>
        </div>
        <Dialog {...dialogProps}>
          <Setting
            setting={form.setting}
            onChange={this.settingChange}
            onClose={(val: boolean): void => {
              this.visible = val;
            }}
          />
        </Dialog>
      </div>
    ) : (
      <Container ref="container" dataSource={dataSource} templateRender={templateRender} directPrint={!0} />
    );
  },
});
