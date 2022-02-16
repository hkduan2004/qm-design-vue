/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 16:07:53
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { useLocale } from '../../../hooks';
import type { JSXNode } from '../../../_utils/types';
import type { IColumn } from '../table/types';

import config from '../config';

import { FunnelPlotIcon } from '../../../icons';
import Dialog from '../../../dialog';
import HighSearchSetting from './setting';

export default defineComponent({
  name: 'HighSearch',
  props: ['columns'],
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
    closeHandle(val: boolean): void {
      this.visible = val;
    },
  },
  render(): JSXNode {
    const { visible } = this;
    const { t } = useLocale();
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.highSearch.settingTitle'),
      width: '1100px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    const columns: IColumn[] = this.columns.filter(
      (x) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(x.dataIndex)
    );
    return (
      <>
        <span class={`${prefixCls}-super-search`} title={t('qm.table.highSearch.text')} onClick={this.clickHandle}>
          <i class="svgicon icon">
            <FunnelPlotIcon />
          </i>
        </span>
        <Dialog {...wrapProps}>
          <HighSearchSetting columns={columns} onClose={this.closeHandle} />
        </Dialog>
      </>
    );
  },
});
