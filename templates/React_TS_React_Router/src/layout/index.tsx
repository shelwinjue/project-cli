import React from 'react';
import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';
import User from '@/components/user';
import * as styles from './index.module.scss';
function Layout() {
  return (
    <>
      <Flex align="center" className={styles.header} justify="space-between">
        <div className={styles.logo} />
        <div className={styles.text}>
          <User />
        </div>
      </Flex>
      <div
        style={{
          backgroundColor: '#fff',
          height: 'calc(100vh - 72px)',
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
