/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:10:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:40:31
 */
import { inject } from 'vue';
import { t } from '../../locale';
import type { Locale } from '../../_utils/types';
import { CONTEXT_KEY, LocaleContext } from '../../config-provider/types';

type IUseLocale = {
  $locale: Locale;
  t: (...args: any[]) => string;
};

export const useLocale = (): IUseLocale => {
  const $context = inject<LocaleContext>(CONTEXT_KEY);
  return {
    $locale: $context?.locale || 'zh-cn',
    t,
  };
};
