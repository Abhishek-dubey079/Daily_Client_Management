import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    console.log('=== FRONTEND REGISTER ATTEMPT ===');
    console.log('Email:', email);
    console.log('Name:', name || 'Not provided');
    console.log('Password provided:', password ? 'Yes' : 'No');

    try {
      const requestData = { 
        email: email.trim(), 
        password, 
        name: name?.trim() || undefined 
      };
      console.log('=== FRONTEND REGISTER ===');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Request URL:', '/api/auth/register');
      console.log('Request data:', { email: requestData.email, name: requestData.name, password: '***' });

      const response = await api.post('/auth/register', requestData);
      
      console.log('Register response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      if (response.data.token && response.data.user) {
        console.log('Storing token and user data...');
        login(response.data.user, response.data.token);
        console.log('Token stored in localStorage:', !!localStorage.getItem('token'));
        console.log('User stored in localStorage:', !!localStorage.getItem('user'));
        console.log('=== REGISTER SUCCESS ===');
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('=== FRONTEND REGISTER ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response status text:', err.response?.statusText);
      console.error('Response data:', err.response?.data);
      
      // Handle different error types
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your input.';
        } else if (status === 500) {
          errorMessage = data?.message || 'Server error. Please try again later.';
        } else {
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
        {/* Register Form Section */}
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
              Register
            </h3>
          </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Enter your name"
            />
          </div>

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
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Login
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

export default Register;

