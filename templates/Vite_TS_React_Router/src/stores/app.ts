import { atom } from 'jotai';

import type { IUserInfo } from '@/types.global';

export const countAtom = atom(0);

export interface UserInfoState {
  loading: boolean;
  data: IUserInfo | null;
  error: Error | null;
}

export const userInfoAtom = atom<UserInfoState>({
  loading: true,
  data: null,
  error: null,
});
