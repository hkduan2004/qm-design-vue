/*
 * @Author: 焦质晔
 * @Date: 2021-10-25 11:17:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-25 13:07:29
 */
type Mod = string | { [key: string]: any };
type Mods = Mod | Mod[];

const gen = (name: string, mods?: Mods): string => {
  if (!mods) return '';

  if (typeof mods === 'string') {
    return ` ${name}--${mods}`;
  }

  if (Array.isArray(mods)) {
    return mods.reduce<string>((a, b) => a + gen(name, b), '');
  }

  return Object.keys(mods).reduce((a, b) => a + (mods[b] ? gen(name, b) : ''), '');
};

/**
 * bem helper
 * b() // 'button'
 * b('text') // 'button__text'
 * b({ disabled }) // 'button button--disabled'
 * b('text', { disabled }) // 'button__text button__text--disabled'
 * b(['disabled', 'primary']) // 'button button--disabled button--primary'
 */

export const createBEM = (name: string) => {
  return (el?: Mods, mods?: Mods) => {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }
    el = el ? `${name}__${el}` : name;
    return `${el}${gen(el, mods)}`;
  };
};

export type BEM = ReturnType<typeof createBEM>;
