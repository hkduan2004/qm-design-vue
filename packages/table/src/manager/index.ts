/*
 * @Author: 焦质晔
 * @Date: 2021-03-30 07:59:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:50:17
 */
import type { ComponentInternalInstance } from 'vue';
import type { Nullable } from '../../../_utils/types';

type Instance = {
  id: number;
  vm: ComponentInternalInstance;
};

let instances: Instance[] = [];

const TableManager = {
  getFocusInstance: function (): Nullable<Instance> {
    return instances[0] ?? null;
  },
  getInstance: function (id: number): Nullable<Instance> {
    return instances.find((x) => x.id === id) ?? null;
  },
  focus: function (id: number): void {
    const target: Instance = this.getInstance(id);
    if (!target || instances.findIndex((x) => x === target) === 0) return;
    this.deregister(id);
    instances = [target, ...instances];
  },
  register: function (id: number, instance: ComponentInternalInstance): void {
    if (id && instance) {
      if (this.getInstance(id) !== null) {
        this.deregister(id);
      }
      instances = [{ id, vm: instance }, ...instances];
    }
  },
  deregister: function (id: number): void {
    if (id) {
      instances = instances.filter((x) => x.id !== id);
    }
  },
};

export default TableManager;
