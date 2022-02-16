/*
 * @Author: 焦质晔
 * @Date: 2020-03-20 10:18:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 16:15:35
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';

import { FullscreenIcon, FullscreenExitIcon } from '../../../icons';

export default defineComponent({
  name: 'FullScreen',
  inject: ['$$table'],
  data() {
    return {
      isFull: false,
    };
  },
  methods: {
    clickHandle(): void {
      this.$$table.isFullScreen = this.isFull = !this.isFull;
    },
    keyboardHandle(ev: KeyboardEvent): void {
      if (!this.isFull) return;
      // Esc 取消
      if (ev.keyCode === 27) {
        this.$$table.isFullScreen = this.isFull = false;
      }
    },
  },
  mounted() {
    this.event = addEventListener(document, 'keydown', this.keyboardHandle);
  },
  beforeUnmount() {
    this.event?.remove();
  },
  render(): JSXNode {
    const { isFull } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <span
        class={`${prefixCls}-full-screen`}
        title={!isFull ? t('qm.table.screen.full') : t('qm.table.screen.cancelFull')}
        onClick={this.clickHandle}
      >
        <i class="svgicon icon">{!isFull ? <FullscreenIcon /> : <FullscreenExitIcon />}</i>
      </span>
    );
  },
});
