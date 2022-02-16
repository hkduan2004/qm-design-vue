/*
 * @Author: 焦质晔
 * @Date: 2021-05-17 08:59:58
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 18:45:06
 */
import axios from 'axios';
import qs from 'qs';
import { QmNotification } from '../../lib/index.esm';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://127.0.0.1:3000/',
  timeout: 1000 * 20,
  withCredentials: false, // 跨域请求时是否需要使用凭证
  paramsSerializer: (params) => {
    // 序列化 GET 请求参数 -> a: [1, 2] => a[0]=1&a[1]=2
    return qs.stringify(params, { arrayFormat: 'indices' });
  },
});

// 自定义扩展 header 请求头
const getConfigHeaders = () => {
  return {
    userAgent: 'pc', // 设备
  };
};

// 异常处理程序
const errorHandler = (error) => {
  return Promise.reject(error);
};

// 请求拦截
instance.interceptors.request.use((config) => {
  // 请求头信息，token 验证
  config.headers = {
    ...config.headers,
    ...getConfigHeaders(),
  };
  return config;
}, errorHandler);

// 响应拦截
instance.interceptors.response.use((response) => {
  let { data } = response;
  // 请求异常提示信息
  if (data.code !== 200) {
    data.msg &&
      QmNotification({
        title: '提示信息',
        message: data.msg,
        type: 'error',
        duration: 5 * 1000,
      });
  }
  return data;
}, errorHandler);

export default instance;
