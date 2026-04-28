import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  points?: number;
  workloadScore?: number;
  fatigueScore?: number;
  performanceScore?: number;
  maxWeeklyHours?: number;
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const response = await apiClient.post('/auth/firebase/login', { idToken });
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const response = await apiClient.post('/auth/firebase/register', { idToken, fullName, organizationId });
      const { accessToken } = response.data.data;

      if (accessToken) {
        await AsyncStorage.setItem('auth_token', accessToken);
        await loadUser();
      } else {
        throw new Error('No token returned');
      }
    } catch (error) {
      // If backend registration fails, we might want to clean up the Firebase user, 
      // but for now we'll just throw the error
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase sign out error', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
