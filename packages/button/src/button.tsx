/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:02:25
 */
import { defineComponent, PropType, Component } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { useSize, useTheme, useLocale, useGlobalConfig } from '../../hooks';
import { sleep, isFunction } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, AnyFunction, ComponentSize } from '../../_utils/types';

const AWAIT_TIME: number = 100;

export default defineComponent({
  name: 'QmButton',
  componentName: 'QmButton',
  inheritAttrs: false,
  props: {
    // ajax 防止重复提交，对应的执行方法通过 click 参数传进来，异步方法
    click: {
      type: Function as PropType<AnyFunction<Promise<void>>>,
      default: null,
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    type: PropTypes.string,
    confirm: PropTypes.shape({
      title: PropTypes.string,
      onConfirm: PropTypes.func,
      onCancel: PropTypes.func,
    }),
    icon: {
      type: [String, Object, Function] as PropType<string | Component | AnyFunction<JSXNode>>,
    },
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
  },
  data() {
    return {
      ajaxing: false,
    };
  },
  computed: {
    isTextOrLink(): boolean {
      return this.type === 'text' || this.type === 'link';
    },
  },
  methods: {
    async clickHandler(): Promise<void> {
      this.ajaxing = true;
      try {
        await this.click();
        await sleep(AWAIT_TIME);
      } catch (err) {}
      this.ajaxing = false;
      // 重新获得焦点
      this.$nextTick(() => this.$refs['btnRef']?.$el.focus());
    },
  },
  render(): JSXNode {
    const { confirm, type, round, circle, icon, disabled, isTextOrLink, $slots, $attrs } = this;
    const { $size } = useSize(this.$props);
    const { $theme } = useTheme();
    const { global } = useGlobalConfig();
    const { t } = useLocale();

    const ajaxClick = isFunction(this.click) ? { onClick: this.clickHandler } : null;

    const wrapProps = {
      ref: 'btnRef',
      key: $theme,
      size: $size,
      type: !isTextOrLink ? type : '',
      text: type === 'text',
      link: type === 'link',
      round,
      circle,
      icon: isFunction(icon) ? <icon /> : icon,
      disabled,
      loading: this.ajaxing || this.loading || false,
      autoInsertSpace: !!global?.autoInsertSpaceInButton && !isTextOrLink,
      onKeydown: (ev: KeyboardEvent): void => {
        if (ev.keyCode !== 13) return;
        ev.preventDefault();
      },
      onKeyup: (ev: KeyboardEvent): void => {
        if (ev.keyCode !== 13) return;
        this.$emit('click');
        ajaxClick && this.clickHandler();
      },
    };

    if (!confirm) {
      return <el-button {...Object.assign({}, wrapProps, $attrs, ajaxClick)} v-slots={$slots.default ? $slots : null} />;
    }

    return (
      <el-popconfirm
        key={$theme}
        title={confirm.title || t('qm.button.confirmTitle')}
        onConfirm={(): void => {
          confirm.onConfirm?.();
          this.$emit('click');
          ajaxClick && this.clickHandler();
        }}
        onCancel={(): void => {
          confirm.onCancel?.();
        }}
        v-slots={{
          reference: (): JSXNode => (
            <el-button {...wrapProps} loading={this.ajaxing || this.loading || false} v-slots={$slots.default ? $slots : null} />
          ),
        }}
      />
    );
  },
});
