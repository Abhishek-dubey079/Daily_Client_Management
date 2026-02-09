import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('=== FRONTEND LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');

    try {
      const requestData = { email: email.trim(), password };
      console.log('=== FRONTEND LOGIN ===');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Request URL:', '/api/auth/login');
      console.log('Request data:', { email: requestData.email, password: '***' });

      const response = await api.post('/auth/login', requestData);
      
      console.log('Login response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      // Validate response structure
      console.log('--- Response Validation ---');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Has success flag:', 'success' in response.data);
      console.log('Success value:', response.data.success);
      console.log('Has token:', !!response.data.token);
      console.log('Has user:', !!response.data.user);
      
      if (response.status === 200 && response.data.success === true) {
        if (response.data.token && response.data.user) {
          console.log('✅ Valid response received');
          console.log('Storing token and user data...');
          login(response.data.user, response.data.token);
          console.log('Token stored in localStorage:', !!localStorage.getItem('token'));
          console.log('User stored in localStorage:', !!localStorage.getItem('user'));
          console.log('=== LOGIN SUCCESS ===');
          navigate('/dashboard');
        } else {
          console.error('❌ Response missing token or user data');
          throw new Error('Invalid response from server: missing token or user data');
        }
      } else {
        console.error('❌ Response indicates failure');
        console.error('Success flag:', response.data.success);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('=== FRONTEND LOGIN ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response status text:', err.response?.statusText);
      console.error('Response data:', err.response?.data);
      console.error('Request config:', {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL
      });
      
      // Handle different error types - Display backend error messages directly
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error - use backend message directly
        const status = err.response.status;
        const data = err.response.data;
        
        // Only show "Server error" for true 500 errors
        if (status === 500) {
          errorMessage = data?.message || 'Server error. Please try again later.';
        } else {
          // For 400, 401, etc. - show backend message directly
          errorMessage = data?.message || `Error ${status}. Please try again.`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection and ensure the server is running.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Login Form Section */}
        <div className="w-full bg-white rounded-lg shadow-xl p-8 border-2 border-yellow-200">
          <div className="text-center mb-6">
            {/* Lord Rama Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/images/ram-ji.jpg.jpg" 
                alt="Shri Ram Ji" 
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Chachu Client Management
            </h2>
            <p className="text-center text-sm text-gray-600 mb-4 italic">
              राम जी की कृपा से
            </p>
            <h3 className="text-xl font-semibold text-gray-600">
              Login
            </h3>
          </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Register
            </Link>
          </p>
        </div>

        {/* Mobile View - Lord Rama Image */}
        <div className="md:hidden flex flex-col items-center justify-center mt-6">
          <div className="relative bg-white rounded-lg shadow-2xl p-4 border-4 border-yellow-400">
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              🕉️
            </div>
            <img 
              src="/images/ram-ji.jpg.jpg" 
              alt="Shri Ram Ji" 
              className="w-full max-w-xs h-auto rounded-lg shadow-lg object-cover"
            />
            <div className="mt-3 text-center">
              <p className="text-xl font-bold text-yellow-700">श्री राम</p>
              <p className="text-xs text-gray-600 mt-1">Shri Ram Ji</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

