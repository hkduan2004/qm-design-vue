/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-11 23:14:41
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import { sleep } from '../../_utils/util';
import { mmToPx, pxToMm, insertBefore, isPageBreak } from './utils';
import { getPrefixCls } from '../../_utils/prefix';
import { warn } from '../../_utils/error';
import config from './config';
import type { JSXNode, Nullable } from '../../_utils/types';

import Spin from '../../spin';

type IDistance = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export default defineComponent({
  name: 'Container',
  props: ['dataSource', 'templateRender', 'directPrint'],
  inject: ['$$preview'],
  data() {
    return {
      loading: !0,
      elementHeights: [], // tr 高度数组
      elementHtmls: [], // tr 标签片段数组
      previewHtmls: [], // 预览显示的 html 数组，用于分页展示
    };
  },
  computed: {
    templateEl(): HTMLElement {
      return this.$el.querySelector('.origin-template').children[0];
    },
    previewEl(): HTMLElement {
      return this.$el.querySelector('.workspace');
    },
    pagePrintWidth(): number {
      const {
        pageSize,
        isWindowsPrinter,
        form: {
          setting: { direction },
        },
      } = this.$$preview;
      const paddingX: number = isWindowsPrinter ? config.defaultDistance * 10 + config.defaultDistance * 10 : 0;
      const pageWidth: number = direction === 'vertical' ? pageSize[0] : pageSize[1];
      return pageWidth - paddingX;
    },
    pagePrintHeight(): number {
      const {
        pageSize,
        isWindowsPrinter,
        form: {
          setting: { direction },
        },
      } = this.$$preview;
      const paddingY: number = isWindowsPrinter ? config.defaultDistance * 10 + config.defaultDistance * 10 : 0;
      const pageHeight: number = direction === 'vertical' ? pageSize[1] : pageSize[0];
      return pageHeight - paddingY;
    },
    workspaceWidth(): number {
      const { distance } = this.$$preview.form.setting;
      return mmToPx(this.pagePrintWidth - (distance.left - config.defaultDistance) * 10 - (distance.right - config.defaultDistance) * 10);
    },
    workspaceHeight(): number {
      const { distance } = this.$$preview.form.setting;
      return mmToPx(this.pagePrintHeight - (distance.top - config.defaultDistance) * 10 - (distance.bottom - config.defaultDistance) * 10);
    },
    scaleSize(): number {
      return this.$$preview.form.scale;
    },
    pageDistance(): IDistance {
      const {
        form: {
          setting: { distance },
        },
      } = this.$$preview;
      return {
        left: mmToPx(distance.left * 10),
        right: mmToPx(distance.right * 10),
        top: mmToPx(distance.top * 10),
        bottom: mmToPx(distance.bottom * 10),
      };
    },
    workspaceStyle(): CSSProperties {
      const {
        form: { printerType },
      } = this.$$preview;
      const offsetWidth: number = this.workspaceWidth + this.pageDistance.left + this.pageDistance.right;
      const defaultOffsetLeft: number = config.previewWidth - offsetWidth <= 0 ? 0 : (config.previewWidth - offsetWidth) / 2;
      const stepOffsetLeft: number = Math.abs(((1 - this.scaleSize) * offsetWidth) / 2);
      let offsetLeft: number = 0;
      if (this.scaleSize > 1) {
        offsetLeft = stepOffsetLeft > defaultOffsetLeft ? -1 * defaultOffsetLeft : -1 * stepOffsetLeft;
      }
      if (this.scaleSize < 1) {
        offsetLeft =
          offsetWidth - stepOffsetLeft * 2 > config.previewWidth
            ? 0
            : defaultOffsetLeft > 0
            ? stepOffsetLeft
            : (config.previewWidth - (offsetWidth - stepOffsetLeft * 2)) / 2;
      }
      return {
        width: `${this.workspaceWidth}px`,
        height: `${printerType === 'stylus' ? 'auto' : this.workspaceHeight + 'px'}`,
        paddingLeft: `${this.pageDistance.left}px`,
        paddingRight: `${this.pageDistance.right}px`,
        paddingTop: `${this.pageDistance.top}px`,
        paddingBottom: `${this.pageDistance.bottom}px`,
        transform: `translateX(${offsetLeft}px) scale(${this.scaleSize})`,
        opacity: this.loading ? 0 : 1,
      };
    },
    isManualPageBreak(): boolean {
      return this.elementHtmls.some((x) => isPageBreak(x));
    },
  },
  watch: {
    workspaceHeight(): void {
      this.createWorkspace();
    },
    [`$$preview.form.setting.fixedLogo`](): void {
      this.createWorkspace();
    },
  },
  mounted() {
    if (this.directPrint) {
      document.body.appendChild(this.$el);
    }
  },
  beforeUnmount() {
    if (this.directPrint && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
    createPageBreak(): string {
      return `<tr type="page-break" style="page-break-after: always;"></tr>`;
    },
    createLogo(): string {
      const { global } = this.$DESIGN;
      const leftLogoUrl: string = global['print']?.leftLogo ?? '';
      const rightLogoUrl: string = global['print']?.rightLogo ?? '';
      const __html__: string[] = [
        `<tr style="height: ${config.logoHeight}px;">`,
        `<td colspan="8" align="left" style="vertical-align: top;">`,
        leftLogoUrl ? `<img src="${leftLogoUrl}" border="0" height="46" />` : '',
        `</td>`,
        `<td colspan="16" align="right" style="vertical-align: top;">`,
        rightLogoUrl ? `<img src="${rightLogoUrl}" border="0" height="46" />` : '',
        `</td>`,
        `</tr>`,
      ];
      return __html__.join('');
    },
    createTdCols(): string {
      let __html__: string = '<tr style="height: 0;">';
      // 24 栅格列
      for (let i = 0; i < 24; i++) {
        __html__ += `<td width="${100 / 24}%" style="width: ${100 / 24}%; padding: 0;"></td>`;
      }
      __html__ += '</tr>';
      return __html__;
    },
    createTemplateCols(): void {
      let oNewTr: Nullable<HTMLTableRowElement> = document.createElement('tr');
      oNewTr.setAttribute('type', 'template-cols');
      oNewTr.style.height = '0';
      oNewTr.innerHTML = this.createTdCols()
        .replace(/<tr[^>]+>/, '')
        .replace(/<\/tr>/, '');
      insertBefore(oNewTr, this.templateEl);
      oNewTr = null;
    },
    createNodeStyle(): void {
      const allTableTrs: HTMLTableRowElement[] = this.templateEl.children;
      for (let i = 0; i < allTableTrs.length; i++) {
        let type: Nullable<string> = allTableTrs[i].getAttribute('type');
        if (type === 'template-cols') continue;
        let height: number = allTableTrs[i].clientHeight;
        allTableTrs[i].style.height = height + 'px';
        this.elementHeights.push(height);
        this.elementHtmls.push(allTableTrs[i].outerHTML);
      }
    },
    createWorkspace(): void {
      if (!this.elementHtmls.length) return;

      const {
        form: { setting, printerType },
      } = this.$$preview;

      // 直接打印
      if (this.directPrint) {
        return this.previewHtmls.push([this.createTdCols(), this.createLogo(), ...this.elementHtmls]);
      }

      // 页面高度
      let pageHeight: number = setting.fixedLogo ? this.workspaceHeight - config.logoHeight : this.workspaceHeight;

      // 临时数组
      let tmpArr: string[] = [];
      this.previewHtmls = [] as unknown[];

      // 针式打印机  连续打印
      if (printerType === 'stylus') {
        this.previewHtmls.push([this.createTdCols(), ...(setting.fixedLogo ? [this.createLogo()] : []), ...this.elementHtmls]);
      } else {
        let sum = 0;
        for (let i = 0, len = this.elementHeights.length; i < len; i++) {
          const item = this.elementHtmls[i];
          const h = this.elementHeights[i];

          if (!setting.fixedLogo && i === 0) {
            sum += config.logoHeight;
          }

          sum += h;

          // 计算
          if (sum <= pageHeight) {
            tmpArr.push(item);
          } else {
            this.previewHtmls.push([this.createTdCols(), ...(setting.fixedLogo ? [this.createLogo()] : []), ...tmpArr]);
            tmpArr = [];
            sum = 0;
            i -= 1;
          }

          // 最后一页
          if (i === len - 1 && tmpArr.length) {
            this.previewHtmls.push([this.createTdCols(), ...(setting.fixedLogo ? [this.createLogo()] : []), ...tmpArr]);
          }
        }
      }

      // 不固定 logo
      if (!setting.fixedLogo) {
        this.previewHtmls[0]?.splice(1, 0, this.createLogo());
      }

      // 分页符
      for (let i = 0, len = this.previewHtmls.length; i < len; i++) {
        if (i === len - 1) break;
        this.previewHtmls[i].push(this.createPageBreak());
      }

      // 处理分页
      this.$$preview.currentPage = 1;
      this.$$preview.totalPage = this.previewHtmls.length;

      // 预览
      this.createPreviewDom();
    },
    createPreviewDom(): void {
      const { currentPage } = this.$$preview;
      let __html__: string = `<table cellspacing="0" cellpadding="0" border="0" class="${this.templateEl.className}">`;
      __html__ += this.previewHtmls[currentPage - 1]?.join('') ?? '';
      __html__ += `</table>`;
      this.previewEl.innerHTML = __html__;
      // 滚动条返回顶部
      this.previewEl.parentNode.scrollTop = 0;
    },
    createPrintHtml(printPageNumber?: number): string {
      let __html__: string = `<table cellspacing="0" cellpadding="0" border="0" class="${this.templateEl.className}">`;
      if (typeof printPageNumber !== 'undefined') {
        let curData = [...this.previewHtmls[printPageNumber - 1]];
        __html__ += curData.join('');
      } else {
        for (let i = 0; i < this.previewHtmls.length; i++) {
          __html__ += this.previewHtmls[i].join('');
        }
      }
      __html__ += `</table>`;
      return __html__;
    },
    createExportHtml(): string {
      let exportHtmls: string[] = [];
      for (let i = 0; i < this.elementHtmls.length; i++) {
        exportHtmls[i] = this.elementHtmls[i]
          .replace(/[\r\n]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/(<td[^>]+>)\s+/, '$1')
          .replace(/\s+(<\/td>)/, '$1');
      }
      return '<table>' + this.createLogo() + this.createTdCols() + exportHtmls.join('') + '</table>';
    },
    // 加载完成打印模板组件，创建预览工作区
    async SHOW_PREVIEW(): Promise<void> {
      if (this.templateEl?.tagName !== 'TABLE') {
        return this.throwError();
      }
      if (this.previewEl.innerHTML) return;
      this.createTemplateCols();
      await sleep(0);
      this.createNodeStyle();
      this.createWorkspace();
      this.loading = !1;
    },
    async DIRECT_PRINT(): Promise<void> {
      if (this.templateEl?.tagName !== 'TABLE') {
        return this.throwError();
      }
      this.createTemplateCols();
      await sleep(0);
      this.createNodeStyle();
      this.createWorkspace();
      this.loading = !1;
      this.$$preview.doPrint(this.createPrintHtml());
      await sleep(0);
      this.$$preview.doClose();
    },
    throwError(): void {
      warn('qm-print', '[PrintTemplate] 打印模板组件的根元素必须是 `table` 节点');
    },
  },
  render(): JSXNode {
    const { directPrint, loading, templateRender: TemplateRender, dataSource, workspaceWidth, workspaceStyle } = this;
    const prefixCls = getPrefixCls('print-container');
    const cls = { [prefixCls]: true, 'no-visible': directPrint };
    return (
      <div class={cls}>
        <Spin spinning={loading} tip="Loading..." containerStyle={{ height: `100%` }}>
          <div class="preview">
            {/* 隐藏原始的打印模板内容 */}
            <div
              class="origin-template"
              style={{
                width: `${workspaceWidth}px`,
                marginLeft: `-${Math.floor(workspaceWidth / 2)}px`,
              }}
            >
              <TemplateRender dataSource={dataSource} />
            </div>
            {/* 预览工作区 */}
            <div class="workspace" style={workspaceStyle} />
          </div>
        </Spin>
      </div>
    );
  },
});
