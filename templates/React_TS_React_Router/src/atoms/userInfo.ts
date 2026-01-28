import { atom } from 'jotai';
import { IUserInfo } from '@/query/api';
// 1. 基础原子：初始值为 null，可直接读写
export const userInfoAtom = atom<IUserInfo>();
