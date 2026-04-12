import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Enable cookies
});

// Access token stored in memory
let accessToken = localStorage.getItem('accessToken') || null;

// Request interceptor - add access token to headers
API.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired (401) and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/register'
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Update access token
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        accessToken = null;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export function to set access token (called after login)
export const setAccessToken = (token) => {
  accessToken = token;
  localStorage.setItem('accessToken', token);
};

// Export function to get access token
export const getAccessToken = () => {
  return accessToken;
};

// Export function to clear access token (called on logout)
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('accessToken');
};

export default API;