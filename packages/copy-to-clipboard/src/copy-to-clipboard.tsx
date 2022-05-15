/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-15 11:40:31
 */
import { defineComponent, cloneVNode } from 'vue';
import PropTypes from '../../_utils/vue-types';
import copy from 'copy-to-clipboard';
import { t } from '../../locale';
import { ensureOnlyChild } from '../../_utils/vnode';
import { QmMessage } from '../../index';

import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'QmCopyToClipboard',
  componentName: 'QmCopyToClipboard',
  props: {
    text: PropTypes.string.isRequired,
    showMessage: PropTypes.bool,
    options: PropTypes.shape({
      debug: PropTypes.bool,
      message: PropTypes.string,
      format: PropTypes.string,
    }),
  },
  emits: ['copy'],
  data() {
    return {};
  },
  methods: {
    clickHandle(ev: MouseEvent) {
      const { text, options, showMessage = true } = this.$props;
      const result = copy(text, options);
      this.$emit('copy', text, result);
      if (result && showMessage) {
        QmMessage.success(t('qm.clipboard.success'));
      }
      // =================================================
      const elem = this.$slots.default()[0];
      if (elem && elem.props && typeof elem.props.onClick === 'function') {
        elem.props.onClick(ev);
      }
    },
  },
  render(): JSXNode {
    const vSlots = this.$slots.default?.() || [];
    const vNode = ensureOnlyChild(vSlots);
    return cloneVNode(vNode, { onClick: this.clickHandle });
  },
});
