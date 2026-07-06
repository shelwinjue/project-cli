import { useEffect } from 'react';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { useAtom } from 'jotai';
import localeCN from 'antd/locale/zh_CN';
// import localeEN from 'antd/locale/en_US';

import { getUserInfo } from '@/query/api';
import { userInfoAtom } from '@/stores/app';
import AppRouter from './router';

function App() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  console.log('+++ userInfo loading', userInfo?.loading);
  useEffect(() => {
    const loginUrl = `${window.location.origin}/login?redirectUrl=${encodeURIComponent(`${window.location.href}}`)}`;
    if (localStorage.getItem('token')) {
      getUserInfo()
        .then((res) => {
          if (res?.data?.success) {
            setUserInfo({ loading: false, data: res.data.data, error: null });
          } else {
            return Promise.reject({
              code: 401,
            });
          }
        })
        .catch((err) => {
          if (err?.code === 401 || err?.response?.status === 500) {
            window.localStorage.removeItem('token');
            window.location.href = loginUrl;
          }

          setUserInfo({ loading: false, data: null, error: err as Error });
        });
    } else {
      // 自行处理登录逻辑，比如跳转到登录页
      // window.location.href = loginUrl;
    }
  }, []);

  return (
    <ConfigProvider
      locale={localeCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 8,
          colorPrimary: '#1677ff',
        },
      }}
    >
      <AntdApp>
        {/* 强登录逻辑 */}
        {/* {userInfo?.data?.userId && <AppRouter />} */}
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
