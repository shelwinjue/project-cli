import axios from 'axios';
// import { message } from 'antd';

const instance = axios.create({
  timeout: 30000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    if (window.localStorage.getItem('token'))
      config.headers[`Authorization`] = `Bearer ${window.localStorage.getItem('token')}`;
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (Math.abs(data.code) === 401) {
      // message.error('用户未登录');
      return Promise.reject({
        code: 401,
        msg: '用户未登录',
      });
    }
    return res;
  },
  (err) => {
    if (err.response) {
      const status = err.response.status;
      if (Math.abs(status) === 401) {
        // message.error('用户未登录');
        return Promise.reject({
          code: 401,
          msg: '用户未登录',
        });
      }
    }
    return Promise.reject(err);
  },
);

export default instance;
export { instance as axiosAPI };
