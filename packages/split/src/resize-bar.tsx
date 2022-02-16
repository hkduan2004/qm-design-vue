/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-05 14:32:17
 */
import { defineComponent, PropType } from 'vue';
import { getPosition } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'ResizeBar',
  inject: ['$$split'],
  emits: ['update:dragging', 'drag'],
  props: ['direction', 'dragging', 'minValues', 'onDrag'],
  methods: {
    dragStart(ev: MouseEvent): void {
      ev.preventDefault();
      this.$emit('update:dragging', true);
      document.addEventListener('mousemove', this.moving, { passive: true });
      document.addEventListener('mouseup', this.dragStop, { passive: true, once: true });
    },
    dragStop(): void {
      document.removeEventListener('mousemove', this.moving);
      this.$emit('update:dragging', false);
    },
    mouseOffset({ pageX, pageY }): number {
      const container: HTMLElement = this.$$split.$refs[`split`];
      const containerOffset = getPosition(container);
      const range = [this.minValues[0], (this.direction === 'vertical' ? container.offsetHeight : container.offsetWidth) - this.minValues[1]];
      let offset: number;
      if (this.direction === 'vertical') {
        offset = pageY - containerOffset.y;
      } else {
        offset = pageX - containerOffset.x;
      }
      offset = offset < range[0] ? range[0] : offset;
      offset = offset > range[1] ? range[1] : offset;
      return offset;
    },
    moving(ev: MouseEvent): void {
      this.$emit('drag', this.mouseOffset(ev));
    },
  },
  render(): JSXNode {
    const { direction } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('split');
    const cls = {
      [`${prefixCls}__resize-bar`]: true,
      vertical: direction === 'vertical',
      horizontal: direction === 'horizontal',
    };
    return <div class={cls} title={t('qm.split.resize')} onMousedown={this.dragStart} />;
  },
});
