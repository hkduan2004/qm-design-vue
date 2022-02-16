/*
 * @Author: 焦质晔
 * @Date: 2020-03-29 14:18:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 16:03:58
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';

import { ReloadIcon } from '../../../icons';

export default defineComponent({
  name: 'Reload',
  inject: ['$$table'],
  methods: {
    clickHandle(): void {
      this.$$table.getTableData();
    },
  },
  render(): JSXNode {
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    return (
      <span class={`${prefixCls}-reload`} title={t('qm.table.refresh.text')} onClick={this.clickHandle}>
        <i class="svgicon icon">
          <ReloadIcon />
        </i>
      </span>
    );
  },
});
