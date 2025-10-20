import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = 'https://www.ilovedaniyal.click/';

const $api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

$api.interceptors.request.use(config => {
  const accessToken = Cookies.get('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

$api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${BASE_URL}/accounts/api/token/refresh`, {
          refresh: refreshToken,
        });

        const { access } = data;

        Cookies.set('access_token', access, { expires: 1, secure: true });

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return $api.request(originalRequest);
      } catch (e) {
        console.error('Not authenticated', e);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
      }
    }

    throw error;
  },
);

export default $api;
