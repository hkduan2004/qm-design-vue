/*
 * @Author: 焦质晔
 * @Date: 2021-11-14 11:45:02
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-11-14 11:45:02
 */
import { on, once } from '../../_utils/dom';
import type { ObjectDirective, DirectiveBinding } from 'vue';
import type { Nullable, IntervalHandle } from '../../_utils/types';

export default {
  beforeMount(el: Element, binding: DirectiveBinding<any>) {
    let interval: Nullable<IntervalHandle> = null;
    let startTime = 0;
    const handler = (): void => binding?.value();
    const clear = (): void => {
      if (Date.now() - startTime < 100) {
        handler();
      }
      interval && clearInterval(interval);
      interval = null;
    };

    on(el, 'mousedown', (e: MouseEvent): void => {
      if ((e as any).button !== 0) return;
      startTime = Date.now();
      once(document as any, 'mouseup', clear);
      interval && clearInterval(interval);
      interval = setInterval(handler, 100);
    });
  },
} as ObjectDirective;
