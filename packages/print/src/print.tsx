/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:12:22
 */
import { defineComponent, PropType, Component } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { useSize, useLocale } from '../../hooks';
import { sleep, noop, isVNode } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, ComponentSize, Nullable } from '../../_utils/types';

import config from './config';

import { PrinterIcon } from '../../icons';
import Button from '../../button';
import Preview from './preview';
import Dialog from '../../dialog';

export default defineComponent({
  name: 'QmPrint',
  componentName: 'QmPrint',
  inheritAttrs: false,
  emits: ['open', 'close', 'print', 'export'],
  props: {
    dataSource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    templateRender: {
      type: Object as PropType<Component>,
      default: null,
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    uniqueKey: PropTypes.string,
    defaultConfig: PropTypes.object,
    preview: PropTypes.bool.def(true),
    closeOnPrinted: PropTypes.bool,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
    click: PropTypes.func.def(noop),
  },
  data() {
    return {
      visible: !1,
      loading: !1,
    };
  },
  methods: {
    async clickHandle(): Promise<void> {
      this.loading = !0;
      try {
        const res = await this.click();
        this.loading = !1;
        if (typeof res === 'boolean' && !res) return;
        await this.DO_PRINT();
      } catch (err) {}
      this.loading = !1;
    },
    async DO_PRINT(): Promise<void> {
      await sleep(0);
      this.visible = !0;
      await sleep(this.preview ? 500 : 0);
      const { SHOW_PREVIEW, DIRECT_PRINT } = this.$refs.preview.$refs.container;
      this.preview ? SHOW_PREVIEW() : DIRECT_PRINT();
    },
    createRender(): Nullable<JSXNode> {
      const { $props } = this;
      const { t } = useLocale();
      const dialogProps = {
        visible: this.visible,
        title: t('qm.print.preview'),
        width: `${config.previewWidth}px`,
        loading: false,
        destroyOnClose: true,
        'onUpdate:visible': (val: boolean): void => {
          this.visible = val;
        },
        onOpen: (): void => this.$emit('open'),
        onClosed: (): void => this.$emit('close'),
      };
      const previewProps = {
        ref: 'preview',
        dataSource: $props.dataSource,
        templateRender: $props.templateRender,
        uniqueKey: $props.uniqueKey,
        defaultConfig: $props.defaultConfig,
        preview: $props.preview,
        closeOnPrinted: $props.closeOnPrinted,
        onClose: (): void => {
          this.visible = !1;
        },
      };
      return this.preview ? (
        <Dialog {...dialogProps}>
          <Preview {...previewProps} />
        </Dialog>
      ) : this.visible ? (
        <Preview {...previewProps} />
      ) : null;
    },
  },
  render(): JSXNode {
    const { loading, type = 'primary', round, circle, icon = <PrinterIcon />, disabled } = this;
    const { $size } = useSize(this.$props);
    const btnProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading,
      disabled,
      onClick: this.clickHandle,
    };
    const isDefaultSlot: boolean = this.$slots.default?.().every((x) => isVNode(x));
    return (
      <>
        {isDefaultSlot && <Button {...btnProps}>{this.$slots.default()}</Button>}
        {this.createRender()}
      </>
    );
  },
});
