import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import authService from '../services/authService';

const AUTH_STORAGE_KEY = 'pet-shop-auth';

const AuthContext = createContext(null);

// Đọc phiên đăng nhập đã lưu (localStorage = "Ghi nhớ", sessionStorage = chỉ phiên hiện tại)
const readStoredUser = () => {
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ||
      sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearStoredUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async ({ identifier, password, remember = false }) => {
    const loggedInUser = await authService.login(identifier, password);

    clearStoredUser();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (formData, autoLogin = false) => {
    const registeredUser = await authService.register(formData);

    if (autoLogin) {
      clearStoredUser();
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(registeredUser));
      setUser(registeredUser);
    }

    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedData };

      // Đồng bộ lại vào storage tương ứng
      if (localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } else if (sessionStorage.getItem(AUTH_STORAGE_KEY)) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }

      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
      isStaffOrAdmin: user?.role === 'admin' || user?.role === 'staff',
      login,
      register,
      logout,
      updateUser
    }),
    [user, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
};

export default AuthContext;
