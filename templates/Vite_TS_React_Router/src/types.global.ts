/** 账号类型 */
export enum ACCOUNT_TYPE {
  /** 普通用户 */
  NORMAL = 0,
  /** 超级管理员 */
  SUPER_ADMIN = 1,
  /** 高级管理员 */
  SENIOR_ADMIN = 2,
  /** 管理员 */
  ADMIN = 3,
}
/** 账号信息 */
export interface IUserInfo {
  accountType: ACCOUNT_TYPE;
  userId: string;
  userName: string;
  email: string;
  nickName: string;
  avatar: string;
  /** 所在组织名 */
  orgName?: string;
  /** 所在组织code */
  orgCode?: string;
  /** 所在组织id */
  orgId?: string;
  /** 账号状态 */
  status: number;
  /** 用于组织内部的用户名称 */
  realName?: string;
  /** 根组织id，只有当前登录用户的用户信息才包含 */
  rootOrgId?: string;
}
