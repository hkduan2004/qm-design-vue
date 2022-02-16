/*
 * @Author: 焦质晔
 * @Date: 2021-03-09 11:31:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 17:21:33
 */
import { defineComponent } from 'vue';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'StepForwardIcon',
  render(): JSXNode {
    return (
      <svg viewBox="0 0 1024 1024" focusable="false" data-icon="step-forward" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M676.4 528.95L293.2 829.97c-14.25 11.2-35.2 1.1-35.2-16.95V210.97c0-18.05 20.95-28.14 35.2-16.94l383.2 301.02a21.53 21.53 0 010 33.9M694 864h64a8 8 0 008-8V168a8 8 0 00-8-8h-64a8 8 0 00-8 8v688a8 8 0 008 8"></path>
      </svg>
    );
  },
});
