import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const useSessionStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setSession: ({ accessToken, refreshToken }) => {
        try {
          const user = decodeJWT(accessToken);
          set({ accessToken, refreshToken, user });
        } catch {
          set({ accessToken: null, refreshToken: null, user: null });
        }
      },

      updateSession: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken });
      },

      clearSession: () => {
        set({ accessToken: null, refreshToken: null, user: null });
      },

      // Helper to check user role
      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },
    }),
    {
      name: 'session-storage',
    }
  )
);

// User roles - must match backend role names (uppercase)
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SALES: 'SALES_STAFF',
  OPERATIONS: 'OPERATION_STAFF',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: ['view_products', 'create_order', 'manage_profile'],
  [ROLES.SALES]: ['view_orders', 'process_orders', 'handle_complaints'],
  [ROLES.OPERATIONS]: ['view_orders', 'update_order_status', 'manage_shipping'],
  [ROLES.MANAGER]: [
    'manage_products',
    'manage_pricing',
    'manage_users',
    'view_revenue',
  ],
  [ROLES.ADMIN]: ['manage_system', 'manage_users', 'view_all'],
};
