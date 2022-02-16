/*
 * @Author: 焦质晔
 * @Date: 2021-03-02 11:10:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:44:11
 */
import { get } from 'lodash-es';
import type { IFormItem } from './types';

export const AuthMixin = {
  created() {
    this.getFormAuth();
  },
  methods: {
    async getFormAuth() {
      if (!this.authConfig?.fetch) return;
      const { api, params, dataKey } = this.authConfig.fetch;
      try {
        const res = await api(params);
        if (res.code === 200) {
          // 返回不可见列的 dataIndex
          const fieldNames: string[] = Array.isArray(res.data) ? res.data : get(res.data, dataKey) ?? [];
          // true 为反向，默认为正向，正向的意思是设置的字段 fieldNames 不可见
          const reverse = !!get(res.data, 'reverse');
          const list = this.list.map((item: IFormItem) => {
            const { fieldName } = item;
            if (!reverse ? fieldNames.includes(fieldName) : !fieldNames.includes(fieldName)) {
              item.noAuth = !0;
            }
            return item;
          });
          this.$$form.fieldsChange(list);
        }
      } catch (err) {
        // ...
      }
    },
  },
};
