/*
 * @Author: 焦质晔
 * @Date: 2021-11-14 11:45:58
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-14 11:54:36
 */
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import type { ObjectDirective, DirectiveBinding } from 'vue';

type ResizeEl = HTMLElement & {
  _handleResize: () => void;
};

const Resize: ObjectDirective = {
  beforeMount(el: ResizeEl, binding: DirectiveBinding) {
    el._handleResize = () => {
      el && binding.value?.(el);
    };
    addResizeListener(el, el._handleResize);
  },
  beforeUnmount(el: ResizeEl) {
    removeResizeListener(el, el._handleResize);
  },
};

export default Resize;
