/*
 * @Author: 焦质晔
 * @Date: 2021-02-14 14:25:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-15 10:20:22
 */
import type { VNode, CSSProperties, Plugin } from 'vue';

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type JSXNode = VNode | JSX.Element;

export type AnyObject<T> = { [key: string]: T };

export type AnyFunction<T> = (...args: any[]) => T;

export type CustomHTMLElement<T> = HTMLElement & T;

export type SFCWithInstall<T> = T & Plugin;

export type ComponentSize = 'large' | 'default' | 'small';

export type TimeoutHandle = ReturnType<typeof setTimeout>;

export type IntervalHandle = ReturnType<typeof setInterval>;

export enum SizeHeight {
  large = 40,
  default = 32,
  small = 24,
}

export type StyleValue = string | CSSProperties | Array<StyleValue>;

export type Locale = 'zh-cn' | 'en';
