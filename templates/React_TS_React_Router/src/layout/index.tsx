import React from 'react';
import { Outlet } from 'react-router-dom';
import * as styles from './index.module.scss';
function Layout() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.logo} />
        <div className={styles.text}>demo</div>
      </div>
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
