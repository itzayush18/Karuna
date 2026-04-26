import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  fullName?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string, organizationId?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const response = await apiClient.get('/auth/me');
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load user', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = response.data.data;
      
      if (accessToken) {
        await AsyncStorage.setItem('auth_token', accessToken);
        await loadUser();
      } else {
         throw new Error('No token returned');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, fullName: string, password: string, organizationId?: string) => {
    try {
      const response = await apiClient.post('/auth/register', { email, fullName, password, organizationId });
      const { accessToken } = response.data.data;
      
      if (accessToken) {
        await AsyncStorage.setItem('auth_token', accessToken);
        await loadUser();
      } else {
         throw new Error('No token returned');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
