/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 13:30:07
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import { SizeHeight } from '../../../_utils/types';
import config from '../config';
import type { IColumn } from '../table/types';
import type { JSXNode } from '../../../_utils/types';

import { CopyIcon } from '../../../icons';
import Dialog from '../../../dialog';
import ClipboardSetting from './setting';

export default defineComponent({
  name: 'TableClipboard',
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
    createColumns(columns: IColumn[]): IColumn[] {
      return columns.filter(
        (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
      );
    },
  },
  render(): JSXNode {
    const { visible } = this;
    const { tableSize } = this.$$table;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.clipboard.settingTitle'),
      width: '600px',
      height: 'auto',
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
        <span class={`${prefixCls}-clipboard`} title={t('qm.table.clipboard.text')} onClick={this.clickHandle}>
          <i class="svgicon icon">
            <CopyIcon />
          </i>
        </span>
        <Dialog {...wrapProps}>
          <ClipboardSetting
            columns={this.createColumns(this.columns)}
            onClose={() => {
              this.visible = !1;
            }}
          />
        </Dialog>
      </>
    );
  },
});
