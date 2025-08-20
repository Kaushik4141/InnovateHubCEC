import axios from 'axios';
const apiBase = import.meta.env.VITE_API_URL;


let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/login') &&
      !originalRequest.url.includes('/register') &&
      !originalRequest.url.includes('/auth/google') &&
      !originalRequest.url.includes('/auth/complete-onboarding') &&
      !originalRequest.url.includes('/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Just retry the original request
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post(
          `${apiBase}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return axios(originalRequest);
      } catch (refreshError) {
        const errorResponse = (refreshError as any).response;
        if (errorResponse?.status === 401) {
          processQueue(refreshError, null);
          window.location.href = `/login`;
        } else if (errorResponse?.status >= 500 || !errorResponse) {
          console.warn('Server error during token refresh, retrying later');
          processQueue(refreshError, null);
        } else {
          processQueue(refreshError, null);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
export default axios;
