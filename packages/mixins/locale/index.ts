/*
 * @Author: 焦质晔
 * @Date: 2021-10-16 22:39:03
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-19 15:05:23
 */
import { useLocale } from '../../hooks';

const localeMixin = {
  beforeCreate() {
    const { t } = useLocale();
    this.$t = t;
  },
};

export default localeMixin;
