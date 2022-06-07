/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-06-07 15:59:37
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { get } from 'lodash-es';
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import { useSize, useLocale } from '../../hooks';
import { getParentNode } from '../../_utils/dom';
import { deepMapList } from '../../form/src/utils';
import { isValidComponentSize } from '../../_utils/validators';
import { SizeHeight } from '../../_utils/types';
import type { JSXNode, ComponentSize } from '../../_utils/types';

import Spin from '../../spin';
import Button from '../../button';

type ISize = ComponentSize | 'default';

const deepFind = (arr: any[], fn: (node: any) => boolean): any[] => {
  const result: any[] = [];
  arr.forEach((x) => {
    if (x.children) {
      result.push(...deepFind(x.children, fn));
    }
    if (fn(x)) {
      result.push(x);
    }
  });
  return result;
};

export default defineComponent({
  name: 'QmTreeHelper',
  componentName: 'QmTreeHelpers',
  inheritAttrs: false,
  emits: ['close'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    multiple: PropTypes.bool,
    defaultSelectedKeys: PropTypes.array.def([]),
    tree: PropTypes.shape({
      fetch: PropTypes.object.isRequired,
      asyncLoad: PropTypes.bool, // 按需加载
    }),
  },
  data() {
    Object.assign(this, { responseList: [] });
    return {
      result: null,
      loading: false,
      height: 300,
      treeData: [],
      filterText: '',
    };
  },
  computed: {
    disabled(): boolean {
      return !this.result;
    },
  },
  created() {
    this.getTreeData();
  },
  mounted() {
    addResizeListener(this.$refs[`tree-helper`], this.calcTableHeight);
  },
  beforeUnmount() {
    removeResizeListener(this.$refs[`tree-helper`], this.calcTableHeight);
  },
  methods: {
    async getTreeData() {
      if (!this.tree?.fetch) return;
      const { api: fetchApi, params, dataKey, valueKey = 'value', textKey = 'text' } = this.tree.fetch;
      try {
        const res = await fetchApi(params);
        if (res.code === 200) {
          const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
          const results = deepMapList(dataList, valueKey, textKey);
          this.treeData = results;
          this.responseList = dataList;
        }
      } catch (err) {
        // ...
      }
    },
    confirmHandle(): void {
      this.cancelHandle(this.result);
    },
    cancelHandle(data): void {
      this.$emit('close', data);
    },
    calcTableHeight(): void {
      const dialogOffsetTop = getParentNode(this.$refs[`tree-helper`], 'el-dialog')?.offsetTop || 0;
      const containerHeight = window.innerHeight - dialogOffsetTop * 2 - (SizeHeight[this.$size as ISize] + 20) * 2;
      const tableHeight = containerHeight - this.$refs[`filter`].$el.offsetHeight - 10;
      if (tableHeight === this.height) return;
      this.height = tableHeight;
    },
  },
  render(): JSXNode {
    const { loading, disabled, height, multiple } = this;
    const { t } = useLocale();
    const { $size } = useSize(this.$props);
    this.$size = $size || 'default';
    return (
      <div ref="tree-helper" style={{ height: '100%' }}>
        <el-input
          ref="filter"
          v-model={this.filterText}
          placeholder={t('qm.form.treePlaceholder')}
          onInput={(val: string): void => {
            this.$refs[`tree`].filter(val);
          }}
        />
        <div style="height: 5px"></div>
        <Spin spinning={loading}>
          <el-tree
            ref="tree"
            data={this.treeData}
            nodeKey={'value'}
            props={{ children: 'children', label: 'text' }}
            style={{ overflowY: 'auto', height: `${height}px` }}
            checkStrictly={true}
            defaultExpandAll={true}
            expandOnClickNode={false}
            showCheckbox={multiple}
            checkOnClickNode={multiple}
            filterNodeMethod={(val, data): boolean => {
              if (!val) return true;
              return data.text.indexOf(val) !== -1;
            }}
            onNodeClick={(item): void => {
              if (multiple || !this.tree?.fetch || item.disabled) return;
              const { valueKey = 'value' } = this.tree.fetch;
              const rows = deepFind(this.responseList, (node) => [item.value].includes(get(node, valueKey)));
              this.result = rows[0];
            }}
            onCheck={(_, item): void => {
              if (!multiple || !this.tree?.fetch) return;
              const { valueKey = 'value' } = this.tree.fetch;
              const rows = deepFind(this.responseList, (node) => item.checkedKeys.includes(get(node, valueKey)));
              this.result = rows;
            }}
          />
        </Spin>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            height: `${SizeHeight[this.$size] + 20}px`,
            padding: '10px 15px',
            borderTop: '1px solid #d9d9d9',
            textAlign: 'right',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        >
          <Button onClick={() => this.cancelHandle()}>{t('qm.dialog.close')}</Button>
          <Button type="primary" onClick={() => this.confirmHandle()} disabled={disabled}>
            {t('qm.dialog.confirm')}
          </Button>
        </div>
      </div>
    );
  },
});
