/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:42:32
 */
import { CSSProperties, defineComponent, PropType } from 'vue';
import addEventListener from 'add-dom-event-listener';
import classnames from 'classnames';
import PropTypes from '../../_utils/vue-types';
import { isNumber, isUndefined } from '../../_utils/util';
import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import { useSize, useLocale, useGlobalConfig } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { stop } from '../../_utils/dom';
import type { AnyFunction, ComponentSize, JSXNode } from '../../_utils/types';

import { FullscreenIcon, FullscreenExitIcon } from '../../icons';
import Spin from '../../spin';

const trueNoop = (): boolean => !0;

enum DIR {
  right = 'rtl',
  left = 'ltr',
  top = 'ttb',
  bottom = 'btt',
}

export default defineComponent({
  name: 'QmDrawer',
  componentName: 'QmDrawer',
  inheritAttrs: false,
  provide() {
    return {
      $$drawer: this,
    };
  },
  props: {
    visible: PropTypes.bool.def(false),
    title: PropTypes.string,
    position: PropTypes.oneOf(['right', 'left', 'top', 'bottom']).def('right'),
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: '78%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: '60%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    level: PropTypes.number.def(1),
    loading: PropTypes.bool,
    showClose: PropTypes.bool.def(true),
    showHeader: PropTypes.bool.def(true),
    destroyOnClose: PropTypes.bool.def(false),
    showFullScreen: PropTypes.bool.def(true),
    closeOnClickModal: PropTypes.bool,
    closeOnPressEscape: PropTypes.bool.def(true),
    beforeClose: {
      type: Function as PropType<AnyFunction<any>>,
    },
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  emits: ['update:visible', 'open', 'opened', 'close', 'closed', 'afterVisibleChange', 'viewportChange'],
  data() {
    return {
      spinning: false,
      sloading: false,
      fullscreen: false,
    };
  },
  computed: {
    direction(): string {
      return DIR[this.position];
    },
    contentSize(): string {
      const size: number | string = ['right', 'left'].includes(this.position) ? this.width : this.height;
      return this.calcContentSize(!this.fullscreen ? size : '100%');
    },
  },
  deactivated() {
    this.close();
  },
  methods: {
    open(): void {
      if (isUndefined(this.loading) && (this.destroyOnClose || !this.panelOpened)) {
        this.spinning = true;
      }
      // 取消全屏
      this.fullscreen = false;
      this.$emit('open');
    },
    opened(): void {
      this.panelOpened = true; // 打开过一次
      this.addStopEvent();
      this.$emit('opened');
      this.$emit('afterVisibleChange', true);
      if (isUndefined(this.loading)) {
        setTimeout(() => (this.spinning = false), 300);
      }
    },
    close(): void {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    closed(): void {
      this.removeStopEvent();
      this.$emit('closed');
      this.$emit('afterVisibleChange', false);
    },
    addStopEvent(): void {
      this.stopEvent = addEventListener(document.body, 'mousedown', stop);
    },
    removeStopEvent(): void {
      this.stopEvent?.remove();
    },
    handleClick(): void {
      this.fullscreen = !this.fullscreen;
      this.$emit('viewportChange', this.fullscreen ? 'fullscreen' : 'default');
    },
    beforeCloseHandle(cb: AnyFunction<void>): void {
      const beforeClose = this.beforeClose ?? trueNoop;
      const before = beforeClose();
      if ((before as Promise<void>)?.then) {
        (before as Promise<void>)
          .then(() => {
            cb();
          })
          .catch(() => {});
      } else if (before !== false) {
        cb();
      }
    },
    calcContentSize(val: number | string): string {
      const size = (Number(val) > 0 ? `${val}px` : val) as string;
      if (size === '100%') {
        return size;
      }
      return `calc(${size} - ${(Number(this.level) - 1) * 60}px)`;
    },
    renderHeader(): JSXNode {
      const { title, fullscreen, showFullScreen } = this;
      const { t } = useLocale();
      return (
        <div class="drawer-title">
          <span class="title">{title}</span>
          {showFullScreen && (
            <span
              title={fullscreen ? t('qm.dialog.cancelFullScreen') : t('qm.dialog.fullScreen')}
              class="fullscreen svgicon"
              onClick={this.handleClick}
            >
              {!fullscreen ? <FullscreenIcon /> : <FullscreenExitIcon />}
            </span>
          )}
        </div>
      );
    },
    DO_CLOSE(): void {
      this.$refs[`drawer`].handleClose();
    },
    START_LOADING(): void {
      this.sloading = true;
    },
    STOP_LOADING(): void {
      this.sloading = false;
    },
  },
  render(): JSXNode {
    const { contentSize, direction, containerStyle, $props } = this;

    const { global } = useGlobalConfig();
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('drawer');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };

    const wrapProps = {
      customClass: classnames(cls),
      modelValue: $props.visible,
      direction,
      size: contentSize,
      withHeader: $props.showHeader,
      showClose: $props.showClose,
      openDelay: 5,
      beforeClose: this.beforeCloseHandle,
      closeOnClickModal: $props.closeOnClickModal ?? global?.closeOnClickModal ?? false,
      closeOnPressEscape: $props.closeOnPressEscape,
      destroyOnClose: $props.destroyOnClose,
      appendToBody: true,
      onOpen: this.open,
      onOpened: this.opened,
      onClose: this.close,
      onClosed: this.closed,
    };

    return (
      <el-drawer ref="drawer" {...wrapProps} v-slots={{ header: () => this.renderHeader() }}>
        <Spin spinning={this.loading || this.sloading || this.spinning} tip="Loading..." containerStyle={{ height: '100%' }}>
          <div class="drawer-container" style={containerStyle}>
            {this.$slots.default?.()}
          </div>
        </Spin>
      </el-drawer>
    );
  },
});
