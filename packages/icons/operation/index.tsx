/*
 * @Author: 焦质晔
 * @Date: 2021-03-09 11:31:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 18:36:05
 */
import { defineComponent } from 'vue';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'OperationIcon',
  render(): JSXNode {
    return (
      <svg viewBox="64 64 896 896" focusable="false" data-icon="operation" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M389.44 768a96.064 96.064 0 0 1 181.12 0H896v64H570.56a96.064 96.064 0 0 1-181.12 0H128v-64h261.44zm192-288a96.064 96.064 0 0 1 181.12 0H896v64H762.56a96.064 96.064 0 0 1-181.12 0H128v-64h453.44zm-320-288a96.064 96.064 0 0 1 181.12 0H896v64H442.56a96.064 96.064 0 0 1-181.12 0H128v-64h133.44z"></path>
      </svg>
    );
  },
});
