/*
 * @Author: 焦质晔
 * @Date: 2021-10-16 19:42:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-16 20:01:46
 */
import { ComponentSize, Locale } from '../_utils/types';

export type LocaleContext = {
  locale: Locale;
  size: ComponentSize;
  theme: string;
};

export const CONTEXT_KEY = 'context';
