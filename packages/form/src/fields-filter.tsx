/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 14:53:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-16 10:20:31
 */
import { defineComponent, PropType } from 'vue';
import classNames from 'classnames';
import Draggable from 'vuedraggable';
import { LocalStorageMixin } from './local-storage-mixin';
import { isValidComponentSize } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import { useLocale } from '../../hooks';
import type { IFormItem } from './types';
import type { JSXNode } from '../../_utils/types';

import { OperationIcon, HolderIcon } from '../../icons';
import Button from '../../button';

export default defineComponent({
  name: 'FieldsFilter',
  inject: ['$$form'],
  mixins: [LocalStorageMixin],
  props: {
    size: {
      type: String,
      validator: isValidComponentSize,
    },
    list: {
      type: Array,
    },
    uniqueKey: {
      type: String,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  watch: {
    list(next: IFormItem[]): void {
      this.setLocalFields(next);
    },
  },
  methods: {
    changeHandle(list: IFormItem[]): void {
      const resultList: IFormItem[] = [...list];
      this.list.forEach((item: IFormItem, index: number) => {
        if (item.noAuth) {
          resultList.splice(index, 0, item);
        }
      });
      this.$$form.fieldsChange(resultList);
    },
    renderFieldsFilter(): JSXNode {
      const formItems = this.list.filter((x: IFormItem) => !x.noAuth);

      const wrapProps = {
        modelValue: formItems,
        itemKey: 'fieldName',
        animation: 200,
        handle: '.handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val: IFormItem[]): void => {
          this.changeHandle(val);
          // 自动展开
          this.$$form.collapse = true;
        },
      };

      const { t } = useLocale();

      return (
        <div class="fields-filter--wrap" style={{ maxHeight: `calc(100vh - 10px)` }}>
          <Draggable
            {...wrapProps}
            v-slots={{
              item: ({ element: item }): JSXNode => {
                const isDisabled: boolean = item.rules?.findIndex((x) => x.required) > -1;
                const checkboxProps = {
                  modelValue: !item.hidden,
                  disabled: isDisabled,
                  'onUpdate:modelValue': (val: boolean): void => {
                    item.hidden = !val;
                  },
                  onChange: (): void => {
                    this.changeHandle(formItems);
                  },
                };
                const label: string = this.$$form.getFormItemLabel(item);
                return (
                  <li class="filter-item">
                    <el-checkbox {...checkboxProps} />
                    <i class="svgicon handle" title={t('qm.form.draggable')}>
                      <HolderIcon />
                    </i>
                    <span class="title" title={label}>
                      {label}
                    </span>
                  </li>
                );
              },
            }}
          />
        </div>
      );
    },
  },
  render(): JSXNode {
    const { size } = this;
    const prefixCls = getPrefixCls('fields-filter');

    const popperCls = {
      [`${prefixCls}__popper`]: true,
      [`${prefixCls}__popper--medium`]: size === 'medium',
      [`${prefixCls}__popper--small`]: size === 'small',
      [`${prefixCls}__popper--mini`]: size === 'mini',
    };

    return (
      <el-popover
        popper-class={classNames(popperCls)}
        // v-model={[this.visible, 'visible']}
        width={'auto'}
        trigger="click"
        placement="bottom-end"
        fallback-placements={['bottom-end', 'left']}
        offset={5}
        transition="el-zoom-in-top"
        popper-options={{ gpuAcceleration: false }}
        teleported={true}
        stop-popper-mouse-event={false}
        gpu-acceleration={false}
        onBeforeEnter={() => {
          this.visible = true;
        }}
        onAfterLeave={() => {
          this.visible = false;
        }}
        v-slots={{
          reference: (): JSXNode => (
            <Button type="text">
              <i class="svgicon">
                <OperationIcon />
              </i>
            </Button>
          ),
        }}
      >
        {this.visible && this.renderFieldsFilter()}
      </el-popover>
    );
  },
});
