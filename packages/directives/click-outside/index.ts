/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-01 13:53:24
 */
import { on } from '../../_utils/dom';
import isServer from '../../_utils/isServer';
import type { ComponentPublicInstance, DirectiveBinding, ObjectDirective } from 'vue';
import type { Nullable } from '../../_utils/types';

type DocumentHandler = <T extends MouseEvent>(mouseup: T, mousedown: T) => void;

type FlushList = Map<
  HTMLElement,
  {
    documentHandler: DocumentHandler;
    bindingFn: (...args: unknown[]) => unknown;
  }
>;

const nodeList: FlushList = new Map();

let startClick: MouseEvent;

if (!isServer) {
  on(document, 'mousedown', (e: MouseEvent) => (startClick = e));
  on(document, 'mouseup', (e: MouseEvent) => {
    for (const { documentHandler } of nodeList.values()) {
      documentHandler(e, startClick);
    }
  });
}

function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding): DocumentHandler {
  let excludes: HTMLElement[] = [];
  if (Array.isArray(binding.arg)) {
    excludes = binding.arg;
  } else {
    // due to current implementation on binding type is wrong the type casting is necessary here
    excludes.push(binding.arg as unknown as HTMLElement);
  }
  return function (mouseup, mousedown) {
    const popperRef = (binding.instance as ComponentPublicInstance<{ popperRef: Nullable<HTMLElement> }>).popperRef;
    const mouseUpTarget = mouseup.target as Node;
    const mouseDownTarget = mousedown?.target as Node;
    const isBound = !binding || !binding.instance;
    const isTargetExists = !mouseUpTarget || !mouseDownTarget;
    const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget);
    const isSelf = el === mouseUpTarget;

    const isTargetExcluded =
      (excludes.length && excludes.some((item) => item?.contains(mouseUpTarget))) ||
      (excludes.length && excludes.includes(mouseDownTarget as HTMLElement));

    const isContainedByPopper = popperRef && (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget));

    if (isBound || isTargetExists || isContainedByEl || isSelf || isTargetExcluded || isContainedByPopper) {
      return;
    }

    binding.value?.(mouseDownTarget, mouseUpTarget);
  };
}

const ClickOutside: ObjectDirective = {
  beforeMount(el: HTMLElement, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    });
  },
  updated(el: HTMLElement, binding) {
    nodeList.set(el, {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    });
  },
  unmounted(el: HTMLElement) {
    nodeList.delete(el);
  },
};

export default ClickOutside;
