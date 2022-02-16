/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:33:58
 */
import { defineComponent, PropType, Component } from 'vue';
import PropTypes from '../../_utils/vue-types';
import type { JSXNode } from '../../_utils/types';

import Preview from './preview';

export default defineComponent({
  name: 'QmPrintItem',
  componentName: 'QmPrintItem',
  props: {
    dataSource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    templateRender: {
      type: Object as PropType<Component>,
      default: null,
    },
    uniqueKey: PropTypes.string,
    defaultConfig: PropTypes.object,
    closeOnPrinted: PropTypes.bool.def(false),
    label: PropTypes.string,
    disabled: PropTypes.bool,
  },
  render(): JSXNode {
    const { $props } = this;
    const previewProps = {
      ref: 'preview',
      dataSource: $props.dataSource,
      templateRender: $props.templateRender,
      uniqueKey: $props.uniqueKey,
      defaultConfig: $props.defaultConfig,
      closeOnPrinted: $props.closeOnPrinted,
      preview: !0,
    };
    return <Preview {...previewProps} />;
  },
});
