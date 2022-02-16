/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:10:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:39:59
 */
import { inject } from 'vue';
import { useGlobalConfig } from '../../hooks';
import type { ComponentSize } from '../../_utils/types';
import { CONTEXT_KEY, LocaleContext } from '../../config-provider/types';

type IProps = {
  size?: ComponentSize;
  [key: string]: any;
};

export const useSize = (props: IProps): Record<'$size', ComponentSize | ''> => {
  const $DESIGN = useGlobalConfig();
  const $context = inject<LocaleContext>(CONTEXT_KEY);

  return {
    $size: props.size ?? $context?.size ?? $DESIGN.size ?? '',
  };
};
