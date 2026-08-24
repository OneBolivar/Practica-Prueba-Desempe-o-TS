/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import {
  loginService,
  registerService,
  logoutService,
  getProfileService,
} from '../services/auth.service';

// Contexto de autenticación que proporciona información sobre el usuario y funciones para iniciar/cerrar sesión
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

// useEffect para inicializar la autenticación al montar el componente
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getProfileService();
        setUser(currentUser);
      } catch {
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  async function login(credentials: LoginCredentials) {
    const data = await loginService(credentials);
    localStorage.setItem('access_token', data.accessToken);
    setUser(data.user);
  }

  async function register(credentials: RegisterCredentials) {
    const data = await registerService(credentials);
    localStorage.setItem('access_token', data.accessToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await logoutService();
    } catch {
      // Limpiamos sesión aunque falle el backend
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}