import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const adminRequest = {
  // Dashboard stats
  getDashboard: async () => {
    const res = await http.get(ENDPOINT.ADMIN_DASHBOARD);
    return res.data;
  },

  // Revenue stats
  getRevenue: async (params) => {
    const res = await http.get(ENDPOINT.ADMIN_REVENUE, { query: params });
    return res.data;
  },

  // Users CRUD
  getUsers: async (params) => {
    const res = await http.get(ENDPOINT.ADMIN_USERS, { query: params });
    return res.data;
  },

  createUser: async (data) => {
    const res = await http.post(ENDPOINT.ADMIN_USERS, data);
    return res.data;
  },

  updateUser: async (userId, data) => {
    const res = await http.patch(ENDPOINT.ADMIN_USER_DETAIL(userId), data);
    return res.data;
  },

  deleteUser: async (userId) => {
    const res = await http.delete(ENDPOINT.ADMIN_USER_DETAIL(userId));
    return res.data;
  },

  // System settings
  getSettings: async () => {
    const res = await http.get(ENDPOINT.ADMIN_SETTINGS);
    return res.data;
  },

  updateSettings: async (settings) => {
    const res = await http.patch(ENDPOINT.ADMIN_SETTINGS, { settings });
    return res.data;
  },

  // Audit logs
  getLogs: async (params) => {
    const res = await http.get(ENDPOINT.ADMIN_LOGS, { query: params });
    return res.data;
  },

  // Banners CRUD
  getBanners: async () => {
    const res = await http.get(ENDPOINT.BANNERS);
    return res.data;
  },

  createBanner: async (data) => {
    const res = await http.post(ENDPOINT.BANNERS, data);
    return res.data;
  },

  updateBanner: async (id, data) => {
    const res = await http.patch(ENDPOINT.BANNER_DETAIL(id), data);
    return res.data;
  },

  deleteBanner: async (id) => {
    const res = await http.delete(ENDPOINT.BANNER_DETAIL(id));
    return res.data;
  },

  // Promotions CRUD
  getPromotions: async (params) => {
    const res = await http.get(ENDPOINT.PROMOTIONS, { query: params });
    return res.data;
  },

  createPromotion: async (data) => {
    const res = await http.post(ENDPOINT.PROMOTIONS, data);
    return res.data;
  },

  updatePromotion: async (id, data) => {
    const res = await http.patch(ENDPOINT.PROMOTION_DETAIL(id), data);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await http.delete(ENDPOINT.PROMOTION_DETAIL(id));
    return res.data;
  },

  togglePromotion: async (id) => {
    const res = await http.patch(ENDPOINT.PROMOTION_TOGGLE(id));
    return res.data;
  },
};
