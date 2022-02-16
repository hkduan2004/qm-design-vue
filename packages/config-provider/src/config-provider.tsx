/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-13 09:19:05
 */
import { defineComponent, PropType, getCurrentInstance, provide, reactive, watch, ComponentInternalInstance } from 'vue';
import { setLocale } from '../../locale';
import { setConfig } from '../../_utils/config';
import { useGlobalConfig } from '../../hooks';
import { isValidComponentSize } from '../../_utils/validators';
import { CONTEXT_KEY, LocaleContext } from '../types';
import type { ComponentSize, Locale, JSXNode } from '../../_utils/types';

// QmDesign
import zhCN_qm from '../../locale/lang/zh-cn';
import en_qm from '../../locale/lang/en';

// ElementPlus
import zhCN_el from 'element-plus/lib/locale/lang/zh-cn';
import en_el from 'element-plus/lib/locale/lang/en';

const messages = {
  [en_qm.name]: {
    qm: en_qm,
    el: en_el,
  },
  [zhCN_qm.name]: {
    qm: zhCN_qm,
    el: zhCN_el,
  },
};

export default defineComponent({
  name: 'QmConfigProvider',
  componentName: 'QmConfigProvider',
  inheritAttrs: false,
  props: {
    locale: {
      type: String as PropType<Locale>,
      default: 'zh-cn',
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    theme: {
      type: String,
    },
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance() as ComponentInternalInstance;

    const { global } = useGlobalConfig();

    const getGlobalConfig = () => instance.appContext.config.globalProperties;

    const $context = reactive({
      locale: props.locale,
      size: props.size,
      theme: props.theme,
    }) as LocaleContext;

    watch(
      () => props.locale,
      (next: Locale) => {
        const { $ELEMENT, $DESIGN } = getGlobalConfig();
        $ELEMENT && ($ELEMENT.locale = next);
        $DESIGN && ($DESIGN.locale = next);
        $context.locale = next;
        setLocale(messages[next][`qm`]);
        setConfig($DESIGN);
      },
      { immediate: true }
    );

    watch(
      () => props.size,
      (next: ComponentSize) => {
        if (typeof next === 'undefined') return;
        const { $ELEMENT, $DESIGN } = getGlobalConfig();
        $ELEMENT && ($ELEMENT.size = next);
        $DESIGN && ($DESIGN.size = next);
        $context.size = next;
        setConfig($DESIGN);
      },
      { immediate: true }
    );

    watch(
      () => props.theme,
      (next: string) => {
        $context.theme = next;
      },
      { immediate: true }
    );

    provide(CONTEXT_KEY, $context);

    // 不改变 button 参数的引用，防止重复渲染子组件
    const buttonProps = {
      autoInsertSpace: !!global?.autoInsertSpaceInButton,
    };

    return (): JSXNode => {
      return (
        <el-config-provider size={props.size} locale={messages[props.locale][`el`]} button={buttonProps}>
          {slots.default?.()}
        </el-config-provider>
      );
    };
  },
});
