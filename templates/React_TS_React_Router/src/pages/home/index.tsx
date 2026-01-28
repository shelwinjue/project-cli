import React from 'react';
import { userInfoAtom } from '@/atoms/userInfo';
import { useAtom } from 'jotai';
import * as styles from './index.module.scss';

export default function Home() {
  const [userInfo] = useAtom(userInfoAtom);
  console.log('+++ home userInfo', userInfo);
  return <div className={styles.cnt}>当前账号对应的邮箱：{userInfo?.email || '未登录'}</div>;
}
