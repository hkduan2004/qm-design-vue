/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:17:27
 */
import { defineComponent } from 'vue';
import { noop } from './utils';
import type { JSXNode, AnyObject } from '../../_utils/types';

import Divider from '../../divider';

export default defineComponent({
  name: 'FormDivider',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { blockFieldNames, view, desc, expand } = this.$$form;
    const { type, label, fieldName, id, style = {}, options = {}, collapse } = this.option;
    const { showLimit, remarkItems = [], onCollapse = noop } = collapse || {};
    const result: AnyObject<unknown>[] = [];
    if (remarkItems.length) {
      const blockList: AnyObject<any>[] = blockFieldNames.find((arr) => arr[0].fieldName === fieldName) ?? [];
      const index: number = showLimit ?? blockList.length - 1;
      blockList.slice(index + 1).forEach((x) => {
        const item: AnyObject<unknown> = remarkItems.find((k) => k.fieldName === x.fieldName);
        if (!item) return;
        let label: string = item.isLabel ? `${x.label}：` : '';
        let textVal: string = view[x.fieldName] ?? '';
        let descVal: string = desc[x.fieldName] ?? '';
        if (textVal === '') return;
        result.push({ ...x, text: `${label}${textVal} ${descVal}` });
      });
    }
    const wrapProps = {
      collapse: expand[fieldName],
      label,
      extra: result.map((x) => x.text).join(' | '),
      id,
      style: { ...style },
      'onUpdate:collapse': (val: boolean): void => {
        expand[fieldName] = val;
      },
      onChange: (val: boolean): void => {
        onCollapse(val);
      },
    };
    return <Divider {...wrapProps} />;
  },
});
