import axios from 'axios';

// Use /api prefix to match Vite proxy configuration
// In development, Vite proxy forwards /api to http://localhost:5000
// In production on Vercel, /api routes are handled by serverless functions
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '/api');

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add token and log requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log all requests
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
  
  // Log request data (excluding sensitive info)
  if (config.data) {
    const safeData = { ...config.data };
    if (safeData.password) safeData.password = '***';
    console.log('[API Request Data]', safeData);
  }
  
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Response interceptor - Log responses and handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    const fullUrl = `${response.config.baseURL}${response.config.url}`;
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${fullUrl}`);
    return response;
  },
  (error) => {
    // Enhanced error logging
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
    
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${fullUrl}`);
      console.error('[API Error Details]', {
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.message || error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error(`[API Network Error] No response from server for ${fullUrl}`);
      console.error('[API Network Error Details]', {
        message: error.message,
        code: error.code,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method
        }
      });
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

