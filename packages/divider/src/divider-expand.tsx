/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 17:13:56
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:10:10
 */
import { defineComponent } from 'vue';
import { useLocale } from '../../hooks';
import type { JSXNode } from '../../_utils/types';

import { UpIcon, DownIcon } from '../../icons';
import Button from '../../button';

export default defineComponent({
  name: 'DividerExpand',
  inject: ['$$divider'],
  props: {
    expand: {
      type: Boolean,
    },
  },
  methods: {
    clickHandle(): void {
      this.$$divider.doToggle(!this.expand);
    },
  },
  render(): JSXNode {
    const { expand } = this;
    const { t } = useLocale();
    return (
      <Button type="text" onClick={this.clickHandle}>
        {expand ? t('qm.divider.collect') : t('qm.divider.spread')}
        <i class="svgicon">{expand ? <UpIcon /> : <DownIcon />}</i>
      </Button>
    );
  },
});
