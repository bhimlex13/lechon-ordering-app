import axios from 'axios';

// Added fallback to localhost:8080 to prevent undefined URL issues
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080', 
});

api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;