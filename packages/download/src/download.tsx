/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-05 10:10:35
 */
import { defineComponent, PropType } from 'vue';
import axios from 'axios';
import PropTypes from '../../_utils/vue-types';
import { QmMessage } from '../../index';
import { useSize } from '../../hooks';
import { localeMixin } from '../../mixins';
import { sleep } from '../../_utils/util';
import { download } from '../../_utils/download';
import { isValidComponentSize } from '../../_utils/validators';
import type { JSXNode, ComponentSize } from '../../_utils/types';

import { DownloadIcon } from '../../icons';
import Button from '../../button';

const trueNoop = () => true;

export default defineComponent({
  name: 'QmDownload',
  componentName: 'QmDownload',
  inheritAttrs: false,
  mixins: [localeMixin],
  emits: ['success', 'error'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    actionUrl: PropTypes.string,
    fileName: PropTypes.string,
    actionUrlFetch: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
    }),
    headers: PropTypes.object.def({}),
    params: PropTypes.object.def({}),
    withCredentials: PropTypes.bool.def(false),
    beforeDownload: PropTypes.func.def(trueNoop),
    type: PropTypes.string,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async clickHandle(): Promise<void> {
      this.loading = true;
      try {
        let actionUrl: string = this.actionUrl;
        if (this.actionUrlFetch?.api) {
          const res = await this.actionUrlFetch.api(this.actionUrlFetch.params);
          if (res.code === 200) {
            actionUrl = res.data?.url || '';
          }
        }

        if (!actionUrl) return;
        if (!this.beforeDownload(actionUrl)) return;

        await this.downloadFile(actionUrl, this.params);
        await sleep(100);

        this.$emit('success');
        QmMessage.success(this.$t('qm.download.success'));
      } catch (err) {
        this.$emit('error', err);
        QmMessage.error(this.$t('qm.download.error'));
      }
      this.loading = false;
    },
    // 获取服务端文件 to blob
    async downLoadByUrl(url, params = {}): Promise<any> {
      return await axios({
        url,
        params,
        headers: this.headers,
        withCredentials: this.withCredentials,
        responseType: 'blob',
      });
    },
    // 执行下载动作
    async downloadFile(url, params): Promise<void> {
      const res = await this.downLoadByUrl(url, params);
      const _fileName = decodeURI(
        res.headers['content-disposition'] ? res.headers['content-disposition'].split(';')[1].split('=')[1] : url.slice(url.lastIndexOf('/') + 1)
      );
      const blob: Blob = new Blob([res.data], {
        type: res.headers['content-type'],
      });
      const fileName: string = this.fileName ? this.fileName : _fileName;
      download(blob, fileName);
    },
  },
  render(): JSXNode {
    const { loading, type = 'primary', round, circle, icon = <DownloadIcon />, disabled } = this;
    const { $size } = useSize(this.$props);
    const wrapProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading,
      disabled,
      onClick: this.clickHandle,
    };
    return <Button {...wrapProps}>{this.$slots.default?.()}</Button>;
  },
});
