/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 16:06:46
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { SizeHeight } from '../../../_utils/types';
import type { JSXNode } from '../../../_utils/types';

import { MonitorIcon } from '../../../icons';
import FastSearchSetting from './setting';
import Dialog from '../../../dialog';

export default defineComponent({
  name: 'FastSearch',
  inject: ['$$table'],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    clickHandle(): void {
      this.visible = true;
    },
    closeHandle(): void {
      this.visible = false;
    },
  },
  render(): JSXNode {
    const { visible } = this;
    const { tableSize } = this.$$table;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.fastSearch.settingTitle'),
      width: '700px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: `${SizeHeight[tableSize] + 20}px` },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    return (
      <>
        <span class={`${prefixCls}-super-search`} title={t('qm.table.fastSearch.text')} onClick={this.clickHandle}>
          <i class="svgicon icon">
            <MonitorIcon />
          </i>
        </span>
        <Dialog {...wrapProps}>
          <FastSearchSetting onClose={this.closeHandle} />
        </Dialog>
      </>
    );
  },
});
