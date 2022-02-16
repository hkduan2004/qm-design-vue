/*
 * @Author: 焦质晔
 * @Date: 2020-03-23 12:51:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 12:48:23
 */
import dayjs from 'dayjs';
import { formatNumber } from '../utils';

const formatMixin = {
  methods: {
    dateFormat(val: string): string {
      const res = val ? dayjs(val).format('YYYY-MM-DD') : '';
      return !res.startsWith('1900-01-01') ? res : '';
    },
    datetimeFormat(val: string): string {
      const res = val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '';
      return !res.startsWith('1900-01-01') ? res : '';
    },
    dateShortTimeFormat(val: string): string {
      const res = val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '';
      return !res.startsWith('1900-01-01') ? res : '';
    },
    percentFormat(val: number): string {
      return Number(val * 100).toFixed(2) + '%';
    },
    financeFormat(val: number): string {
      return formatNumber(val.toString());
    },
    [`secret-nameFormat`](val: string): string {
      return val.replace(/^([\u4e00-\u9fa5]{1}).+$/, '$1**');
    },
    [`secret-phoneFormat`](val: string): string {
      return val.replace(/^(\d{3}).+(\d{4})$/, '$1****$2');
    },
    [`secret-IDnumber`](val: string): string {
      return val.replace(/^(\d{3}).+(\w{4})$/, '$1***********$2');
    },
    [`secret-bankNumber`](val: string): string {
      return val.replace(/^(\d{4}).+(\w{3})$/, '$1************$2');
    },
  },
};

export default formatMixin;
