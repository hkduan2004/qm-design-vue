/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:10:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:39:59
 */
import { inject } from 'vue';
import { CONTEXT_KEY, LocaleContext } from '../../config-provider/types';

export const useTheme = (): Record<'$theme', string> => {
  const $context = inject<LocaleContext>(CONTEXT_KEY);

  return {
    $theme: $context?.theme || '',
  };
};
