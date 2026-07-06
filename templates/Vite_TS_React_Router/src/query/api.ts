import axiosAPI from '@/query/index';
import { IUserInfo } from '@/types.global';

export type ResponseSuccess<T> = {
  data: {
    success: boolean;
    code: number;
    businessCode: number;
    data: T;
    msg: string;
  };
};

/**
 * 查询账号信息
 * @returns
 */
export function getUserInfo(): Promise<ResponseSuccess<IUserInfo>> {
  return axiosAPI.post('/api/datasecurity/user/get-user-info');
}
