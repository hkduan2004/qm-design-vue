/*
 * @Author: 焦质晔
 * @Date: 2021-03-13 10:08:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 10:56:47
 */
import axios from '../fetch';

export const getTableData = (params) => axios.post(`/api/design/getTableData`, params);

export const getTableKeys = (params) => axios.get(`/api/design/getTableKeys`, { params });

export const getSummationData = (params) => axios.get(`/api/design/getSummationData`, { params });

export const getTableAuth = (params) => axios.get(`/api/design/getTableAuth`, { params });

export const getSelectData = (params) => axios.get(`/api/design/getSelectData`, { params });

export const getTreeData = (params) => axios.get(`/api/design/getTreeData`, { params });

export const getRegionData = (params) => axios.get(`/api/design/getRegionData`, { params });
