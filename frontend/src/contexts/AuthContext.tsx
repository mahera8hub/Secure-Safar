import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

// Types
interface User {
  id: number;
  email: string;
  username: string;
  role: 'tourist' | 'police' | 'tourism_authority';
  full_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: 'tourist' | 'police' | 'tourism_authority';
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'http://localhost:8000';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('securesafar_token');
    const savedUser = localStorage.getItem('securesafar_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      console.log('API Base URL:', API_BASE_URL);
      
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Sending login request...');
      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      
      const { access_token, token_type } = response.data;
      
      if (!access_token) {
        console.error('No access token received');
        return false;
      }

      // Get user profile
      console.log('Getting user profile...');
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      const userResponse = await api.get('/users/me', {
        timeout: 10000,
      });
      
      console.log('User response status:', userResponse.status);
      console.log('User data:', userResponse.data);
      const userData = userResponse.data;

      // Save to state and localStorage
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('securesafar_token', access_token);
      localStorage.setItem('securesafar_user', JSON.stringify(userData));

      console.log('Login completed successfully');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
        console.error('Network error or server not responding');
      } else {
        console.error('Error setting up request:', error.message);
      }
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', userData.email);
      console.log('Registration payload:', { ...userData, password: '[HIDDEN]' });
      
      const response = await api.post('/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', response.data);
      
      // Auto-login after registration
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful, attempting auto-login...');
        return await login(userData.email, userData.password);
      }
      
      console.log('Registration failed - unexpected status:', response.status);
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Registration error status:', error.response.status);
        console.error('Registration error data:', error.response.data);
        console.error('Registration error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received for registration:', error.request);
        console.error('Network error or server not responding');
      } else {
        console.error('Error setting up registration request:', error.message);
      }
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('securesafar_token');
    localStorage.removeItem('securesafar_user');
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the API instance for use in other components
export { api };