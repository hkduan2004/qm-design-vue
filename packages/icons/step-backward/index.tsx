/*
 * @Author: 焦质晔
 * @Date: 2021-03-09 11:31:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 17:20:48
 */
import { defineComponent } from 'vue';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'StepBackwardIcon',
  render(): JSXNode {
    return (
      <svg viewBox="0 0 1024 1024" focusable="false" data-icon="step-backward" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M347.6 528.95l383.2 301.02c14.25 11.2 35.2 1.1 35.2-16.95V210.97c0-18.05-20.95-28.14-35.2-16.94L347.6 495.05a21.53 21.53 0 000 33.9M330 864h-64a8 8 0 01-8-8V168a8 8 0 018-8h64a8 8 0 018 8v688a8 8 0 01-8 8"></path>
      </svg>
    );
  },
});
