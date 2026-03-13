import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { figmaTokens } from './theme/tokens';
import 'antd/dist/reset.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 全局主题配置：这里集中管理 Figma 颜色和字体 token */}
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: figmaTokens.colorPrimary,
          colorTextBase: figmaTokens.colorTextBase,
          colorTextSecondary: figmaTokens.colorTextSecondary,
          colorBorder: figmaTokens.colorBorder,
          colorBgLayout: figmaTokens.colorBgLayout,
          colorBgContainer: figmaTokens.colorBgContainer,
          colorSuccess: figmaTokens.colorSuccess,
          colorError: figmaTokens.colorError,
          borderRadius: figmaTokens.borderRadius,
          fontSize: figmaTokens.fontSize,
          controlHeight: figmaTokens.controlHeight,
          fontFamily: figmaTokens.fontFamily,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
