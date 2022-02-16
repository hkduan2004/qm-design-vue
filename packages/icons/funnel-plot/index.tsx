/*
 * @Author: 焦质晔
 * @Date: 2021-03-09 11:31:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 16:06:53
 */
import { defineComponent } from 'vue';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FunnelPlotIcon',
  render(): JSXNode {
    return (
      <svg viewBox="64 64 896 896" focusable="false" data-icon="funnel-plot" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 607.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V607.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V650h182.9v148zm9.6-226.6l-8.4 14.6H419.3l-8.4-14.6L334.4 438h355.2L613 571.4zM726.3 374H297.7l-85-148h598.6l-85 148z"></path>
      </svg>
    );
  },
});
