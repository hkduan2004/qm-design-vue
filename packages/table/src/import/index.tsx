/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 14:01:39
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { SizeHeight } from '../../../_utils/types';
import type { JSXNode } from '../../../_utils/types';

import { ImportIcon } from '../../../icons';
import Dialog from '../../../dialog';
import ImportSettig from './setting';

export default defineComponent({
  name: 'TableImport',
  inject: ['$$table'],
  props: ['columns'],
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
      title: t('qm.table.import.settingTitle'),
      width: '600px',
      height: 'none',
      loading: false,
      useHeight: true,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: `${SizeHeight[tableSize] + 20}px` },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    return (
      <>
        <span class={`${prefixCls}-import`} title={t('qm.table.import.text')} onClick={this.clickHandle}>
          <i class="svgicon icon">
            <ImportIcon />
          </i>
        </span>
        <Dialog {...wrapProps}>
          <ImportSettig
            columns={this.columns}
            onClose={() => {
              this.visible = !1;
            }}
          />
        </Dialog>
      </>
    );
  },
});
