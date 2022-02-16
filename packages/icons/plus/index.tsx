/*
 * @Author: 焦质晔
 * @Date: 2021-03-09 11:31:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 18:04:22
 */
import { defineComponent } from 'vue';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'PlusIcon',
  render(): JSXNode {
    return (
      <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <defs>
          <style></style>
        </defs>
        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
      </svg>
    );
  },
});
