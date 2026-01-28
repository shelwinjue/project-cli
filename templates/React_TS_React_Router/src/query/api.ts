import axiosAPI from '@/query/index';

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

/** 查询用户信息入参类型 */
type GetUserInfoRequest = {
  isGuestMode?: boolean;
};

/** 用户信息类型 */
export type IUserInfo = {
  name: string;
  email: string;
};

/**
 * 获取用户信息
 * @param requestData
 * @returns
 */
export function getUserInfo(requestData: GetUserInfoRequest): Promise<ResponseSuccess<IUserInfo>> {
  return axiosAPI.get('/api/getUserInfo', {
    params: requestData,
  });
}
