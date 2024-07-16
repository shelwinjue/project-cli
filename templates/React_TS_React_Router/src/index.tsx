import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/zh_CN';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ConfigProvider
    theme={{
      token: { colorPrimary: '#24A36F' },
      components: {
        Breadcrumb: {
          lastItemColor: '#73777a',
          linkColor: '#181818',
        },
      },
    }}
    locale={locale}
  >
    <App />
  </ConfigProvider>,
);
