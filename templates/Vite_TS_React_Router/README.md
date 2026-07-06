# 项目框架

1. React + React Router
2. 基础UI组件库：Antd
3. 状态库：jotai
4. typescript

## 本地开发

npm run dev

### 接口代理

在vite.config.ts中覆盖接口代理

## 代码说明

1. query/index.ts 请求拦截器，例如：统一的请求预处理和响应预处理
2. stores/app.ts 全局状态定义
3. styles/global.css 全局样式，例如：样式reset，iconfont定义，css变量定义等
4. types.global.ts 全局类型定义
5. index.html 页面文件，注意修改标题
