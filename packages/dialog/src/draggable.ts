/*
 * @Author: 焦质晔
 * @Date: 2021-03-26 13:21:16
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-26 14:41:20
 */
import { ObjectDirective } from 'vue';
import { prevent, getPosition, setStyle } from '../../_utils/dom';

const Draggable: ObjectDirective = {
  mounted(el: HTMLElement, binding) {
    const $header = el.parentNode as HTMLElement;
    const $outer = $header.parentNode as HTMLElement;

    $header.onmousedown = (ev: MouseEvent): boolean => {
      prevent(ev);

      const outerWidth: number = $outer.offsetWidth;
      const outerHeight: number = $outer.offsetHeight;
      const winWdith: number = window.innerWidth;
      const winHeight: number = window.innerHeight;

      const disX: number = ev.clientX - getPosition($header).x;
      const disY: number = ev.clientY - getPosition($header).y;

      document.onmousemove = (ev: MouseEvent): void => {
        let l: number = ev.clientX - disX;
        let t: number = ev.clientY - disY;

        if (l < 0) {
          l = 0;
        }
        if (l > winWdith - outerWidth - 1) {
          l = winWdith - outerWidth - 1;
        }
        if (t < 0) {
          t = 0;
        }
        if (t > winHeight - outerHeight - 1) {
          t = winHeight - outerHeight - 1;
        }

        setStyle($outer, { marginLeft: `${l}px`, marginTop: `${t}px` });
      };

      document.onmouseup = function (): void {
        this.onmousemove = null;
        this.onmouseup = null;
      };

      return false;
    };
  },
  unmounted(el: HTMLElement) {
    const $header = el.parentNode as HTMLElement;
    $header.onmousedown = null;
  },
};

export default Draggable;
