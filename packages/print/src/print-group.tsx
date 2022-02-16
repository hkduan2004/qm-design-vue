/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:20:49
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { sleep } from '../../_utils/util';
import { useSize, useLocale } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { getValidSlot } from '../../_utils/instance-children';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, ComponentSize } from '../../_utils/types';

import config from './config';
import PrintItem from './print-item';
import Dialog from '../../dialog';
import Tabs from '../../tabs';
import TabPane from '../../tab-pane';

const PRINT_ITEM_NAME = 'QmPrintItem';

export default defineComponent({
  name: 'QmPrintGroup',
  componentName: 'QmPrintGroup',
  emits: ['open', 'close'],
  props: {
    uniqueKey: PropTypes.string,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
  },
  data() {
    return {
      visible: !1,
      tabName: '0',
    };
  },
  methods: {
    async DO_PRINT(): Promise<void> {
      this.visible = !0;
      await sleep(500);
      this.tabChangeHandle(this.tabName);
    },
    tabChangeHandle(key: string): void {
      this.$refs[`print-item-${key}`].$refs[`preview`].$refs[`container`].SHOW_PREVIEW();
    },
  },
  render(): JSXNode {
    const { visible, uniqueKey } = this;
    const { $size } = useSize(this.$props);
    const { t } = useLocale();
    const prefixCls = getPrefixCls('print-preview');
    const dialogProps = {
      visible,
      title: t('qm.print.preview'),
      width: `${config.previewWidth}px`,
      showFullScreen: false,
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
      open: (): void => this.$emit('open'),
      closed: (): void => this.$emit('close'),
    };
    const $slots = getValidSlot(this.$slots.default?.(), PRINT_ITEM_NAME);
    return (
      <Dialog {...dialogProps}>
        <div style="margin: -10px">
          <Tabs v-model={this.tabName} tabCustomClass={`${prefixCls}__tab`} size={$size} lazyLoad={false} onChange={this.tabChangeHandle}>
            {$slots.map(({ props }, i): JSXNode => {
              let tabPaneProps = {
                label: props?.label,
                name: i.toString(),
              };
              return (
                <TabPane key={i} {...tabPaneProps}>
                  <PrintItem
                    ref={`print-item-${i}`}
                    uniqueKey={`${uniqueKey}_tab_${i}`}
                    dataSource={props?.dataSource}
                    templateRender={props?.templateRender}
                    style={{ margin: 0 }}
                  />
                </TabPane>
              );
            })}
          </Tabs>
        </div>
      </Dialog>
    );
  },
});
