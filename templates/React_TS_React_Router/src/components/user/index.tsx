import React, { useEffect } from 'react';
import { useAtom } from 'jotai';

import { userInfoAtom } from '@/atoms/userInfo';
import { getUserInfo } from '@/query/api';
import * as styles from './index.module.scss';

export default function User() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);

  useEffect(() => {
    getUserInfo({}).then((res) => {
      setUserInfo(res.data.data);
    });
  }, []);

  return (
    <div className={styles.wrap}>
      <h1>{userInfo?.name || '未登录'}</h1>
    </div>
  );
}
