import axios from 'axios';
import { useNavigate } from 'react-router-dom';

///REVIEW - Is it localhost:8080 or 5173?
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
});

// Add request interceptor
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token logic
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axiosInstance.post('/auth/refresh-token', { refreshToken });

        // Update tokens in localStorage
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);

        // Retry original request with new access token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
    } catch (refreshError) {
        console.error('Refresh token failed', refreshError);

        // Handle failed refresh request: clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect to login
        const navigate = useNavigate();
        navigate('/login');
        return Promise.reject(refreshError);
    }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
