import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  isAdminAuthenticated: boolean;
  adminName: string;
  loginAsAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  switchRole: (newRole: UserRole) => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;
  showAdminPasswordModal: boolean;
  openAdminPasswordModal: (pendingRole?: UserRole) => void;
  closeAdminPasswordModal: () => void;
  pendingRoleSwitch: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASS_KEY = 'pressa_admin_pass';
const ADMIN_AUTH_KEY = 'pressa_admin_authenticated';
const CURRENT_ROLE_KEY = 'pressa_current_role';

const DEFAULT_ADMIN_PASSWORD = 'pressa2026';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem(CURRENT_ROLE_KEY) as UserRole) || 'admin';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState<boolean>(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<UserRole | null>(null);

  const adminName = "Pressa";

  useEffect(() => {
    // If starting as admin but not authenticated, trigger modal
    if (role === 'admin' && !isAdminAuthenticated) {
      setShowAdminPasswordModal(true);
    }
  }, [role, isAdminAuthenticated]);

  const getAdminPassword = (): string => {
    return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASSWORD;
  };

  const loginAsAdmin = (password: string): boolean => {
    const validPass = getAdminPassword();
    if (password === validPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setRole('admin');
      localStorage.setItem(CURRENT_ROLE_KEY, 'admin');
      setShowAdminPasswordModal(false);
      setPendingRoleSwitch(null);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setRole('employee');
    localStorage.setItem(CURRENT_ROLE_KEY, 'employee');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      if (isAdminAuthenticated) {
        setRole('admin');
        localStorage.setItem(CURRENT_ROLE_KEY, 'admin');
      } else {
        setPendingRoleSwitch('admin');
        setShowAdminPasswordModal(true);
      }
    } else {
      setRole(newRole);
      localStorage.setItem(CURRENT_ROLE_KEY, newRole);
    }
  };

  const openAdminPasswordModal = (targetRole: UserRole = 'admin') => {
    setPendingRoleSwitch(targetRole);
    setShowAdminPasswordModal(true);
  };

  const closeAdminPasswordModal = () => {
    setShowAdminPasswordModal(false);
    setPendingRoleSwitch(null);
  };

  const changeAdminPassword = (oldPass: string, newPass: string): boolean => {
    const current = getAdminPassword();
    if (oldPass === current && newPass.trim().length >= 4) {
      localStorage.setItem(ADMIN_PASS_KEY, newPass.trim());
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdminAuthenticated,
        adminName,
        loginAsAdmin,
        logoutAdmin,
        switchRole,
        changeAdminPassword,
        showAdminPasswordModal,
        openAdminPasswordModal,
        closeAdminPasswordModal,
        pendingRoleSwitch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
