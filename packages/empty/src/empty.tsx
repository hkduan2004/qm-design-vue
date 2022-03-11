/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-01 18:11:55
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { useSize, useLocale } from '../../hooks';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import type { ComponentSize, JSXNode } from '../../_utils/types';

import EmptyIcon from './empty-icon';

export default defineComponent({
  name: 'QmEmpty',
  componentName: 'QmEmpty',
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    description: PropTypes.string,
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  render(): JSXNode {
    const { description, containerStyle } = this.$props;
    const { $size } = useSize(this.$props);
    const { t } = useLocale();
    const prefixCls = getPrefixCls('empty');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--large`]: $size === 'large',
      [`${prefixCls}--default`]: $size === 'default',
      [`${prefixCls}--small`]: $size === 'small',
    };

    return (
      <div class={cls} style={containerStyle}>
        <em class="svgicon">
          <EmptyIcon />
        </em>
        <span class="description">{description || t('qm.table.config.emptyText')}</span>
      </div>
    );
  },
});
