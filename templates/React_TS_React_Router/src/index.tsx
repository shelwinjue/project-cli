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
      token: {
        colorPrimary: '#1775FE',
        fontFamily:
          'AlibabaPuHuiTi-3-55-RegularL3, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        colorBorder: '#D9E0ED',
        borderRadius: 4,
        borderRadiusSM: 2,
        borderRadiusLG: 6,
      },
      components: {
        Breadcrumb: {
          lastItemColor: '#262626',
          linkColor: '#545B64',
          itemColor: '#545B64',
          linkHoverColor: '#1775FE',
          colorBgTextHover: 'transparent',
        },
        Button: {
          borderRadius: 4,
          colorBorder: '#D9E0ED',
          colorText: '#30353A',
        },
        Divider: {
          colorSplit: '#D9E0ED',
          verticalMarginInline: 10,
        },
        Form: {
          labelColor: '#545B64',
          verticalLabelPadding: '0 0 4px 0',
          itemMarginBottom: 16,
        },
        Segmented: {
          trackBg: '#F4F6FA',
          itemHoverBg: '#FFFFFF',
        },
        Tag: {
          borderRadius: 2,
          algorithm: true,
          defaultBg: '#F4F6FA',
          defaultColor: '#545B64',
        },
        Table: {
          borderColor: '#EDF2FC',
          headerColor: '#545B64',
          headerBg: '#F7F8FA',
          cellPaddingBlock: 8,
          headerBorderRadius: 0,
          rowHoverBg: '#EDF2FC',
        },
        Tabs: {
          itemColor: '#545B64',
        },
        Tree: {
          directoryNodeSelectedBg: '#FFFFFF00',
          directoryNodeSelectedColor: '#000000e0',
        },
      },
    }}
    locale={locale}
  >
    <App />
  </ConfigProvider>,
);
