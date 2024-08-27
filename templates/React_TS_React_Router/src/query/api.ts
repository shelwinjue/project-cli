import axios from 'axios';
export const API = {
  /** 查询用户列表 */
  getUserList: '/api/getUserList',
};

/**
 * 接口请求成功时的响应类型
 */
type ResponseSuccess<T> = {
  data: {
    success: boolean;
    code: number;
    data: T;
    msg: string;
  };
};

/** 查询用户列表入参类型 */
type GetUserListRequest = {
  pageSize: number;
  pageIndex: number;
};

/** 查询用户列表返回的数据类型定义 */
export type GetUserListModel = {
  total: number;
  list: User[];
};
export type User = {
  name: string;
  age: number;
  gender: string;
};

/**
 * 获取用户列表
 * @param requestData
 * @returns
 */
export function getUserList(requestData: GetUserListRequest): Promise<ResponseSuccess<GetUserListModel>> {
  return axios.post(API.getUserList, requestData);
}
