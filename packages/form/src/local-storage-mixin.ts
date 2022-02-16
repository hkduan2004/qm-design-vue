/*
 * @Author: 焦质晔
 * @Date: 2021-03-02 11:10:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-06 18:44:11
 */
import { xor, isEqual } from 'lodash-es';
import { isUndefined } from '../../_utils/util';
import type { IFormItem } from './types';

export const LocalStorageMixin = {
  computed: {
    formUniqueKey() {
      return this.uniqueKey ? `form_${this.uniqueKey}` : '';
    },
  },
  created() {
    this.initLocalfields();
  },
  methods: {
    async getTableFieldsConfig(key: string): Promise<unknown[] | void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        // ...
      }
      return;
    },
    async saveTableColumnsConfig(key: string, value: IFormItem[]): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {
        // ...
      }
    },
    getLocalFields(): Array<IFormItem> | void {
      if (!this.formUniqueKey) return;
      // 本地存储
      const localFields: IFormItem[] = JSON.parse(localStorage.getItem(this.formUniqueKey) as string);
      // 服务端获取
      if (!localFields) {
        this.getTableFieldsConfig(this.formUniqueKey)
          .then((result) => {
            if (!result) {
              return this.setLocalFields(this.list);
            }
            localStorage.setItem(this.formUniqueKey, JSON.stringify(result));
            this.initLocalfields();
          })
          .catch(() => {});
      }
      if (!localFields) return;
      const diffs: unknown[] = xor(
        localFields.map((x) => x.fieldName),
        this.list.map((x) => x.fieldName)
      );
      if (diffs.length > 0) {
        return this.list.map((item) => {
          const { fieldName } = item;
          const target: IFormItem | undefined = localFields.find((x) => x.fieldName === fieldName);
          if (!target) {
            return item;
          }
          if (!isUndefined(target.hidden)) {
            item.hidden = target.hidden;
          }
          return item;
        });
      }
      return localFields.map((x) => {
        const target: IFormItem = this.list.find((k) => k.fieldName === x.fieldName);
        return { ...target, ...x };
      });
    },
    setLocalFields(list: IFormItem[]): void {
      if (!this.formUniqueKey) return;
      const result = list.map((x) => {
        const target: Partial<IFormItem> = {};
        if (!isUndefined(x.hidden)) {
          target.hidden = x.hidden;
        }
        return {
          fieldName: x.fieldName,
          ...target,
        };
      });
      const localFields: IFormItem[] = JSON.parse(localStorage.getItem(this.formUniqueKey) as string);
      if (isEqual(result, localFields)) return;
      // 本地存储
      localStorage.setItem(this.formUniqueKey, JSON.stringify(result));
      // 服务端存储
      this.saveTableColumnsConfig(this.formUniqueKey, result);
    },
    initLocalfields(): void {
      // 获取本地 list
      const localFields = this.getLocalFields();
      if (!localFields) return;
      this.$nextTick(() => this.$$form.fieldsChange(localFields));
    },
  },
};
