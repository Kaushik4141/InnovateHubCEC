import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
   
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      
      console.error('Network Error:', error.request);
    } else {
    
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;