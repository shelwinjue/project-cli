module.exports = {
  // 定义ESLint的解析器
  parser: '@typescript-eslint/parser',
  // 定义文件继承的子规范
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:react/recommended'],
  // 定义了该eslint文件所依赖的插件
  plugins: ['@typescript-eslint', 'react-hooks', 'eslint-plugin-react'],
  env: {
    // 指定代码的运行环境
    browser: true,
    node: true,
  },
  settings: {
    // 自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  parserOptions: {
    // 指定ESLint可以解析JSX语法
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // 自定义规则
    'prettier/prettier': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'error',
    'no-var': 'error',
  },
};
