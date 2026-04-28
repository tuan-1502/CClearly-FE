import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const userRequest = {
  // Get user profile
  getProfile: async () => {
    const res = await http.get(ENDPOINT.USER_PROFILE);
    return res.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const res = await http.patch(ENDPOINT.USER_PROFILE, data);
    return res.data;
  },

  // Get order history
  getOrderHistory: async (params) => {
    const res = await http.get(ENDPOINT.USER_ORDERS, { query: params });
    return res.data;
  },

  // Get customers list (for sales staff)
  getCustomers: async () => {
    const res = await http.get(ENDPOINT.CUSTOMERS);
    return res.data;
  },

  // Request return/refund for an order
  requestReturn: async (orderId, data) => {
    const res = await http.post(ENDPOINT.REQUEST_RETURN(orderId), data);
    return res.data;
  },

  // ── Addresses ──

  getAddresses: async () => {
    const res = await http.get(ENDPOINT.ADDRESSES);
    return res.data;
  },

  createAddress: async (data) => {
    const res = await http.post(ENDPOINT.ADDRESSES, data);
    return res.data;
  },

  updateAddress: async (addressId, data) => {
    const res = await http.put(ENDPOINT.ADDRESS_DETAIL(addressId), data);
    return res.data;
  },

  deleteAddress: async (addressId) => {
    const res = await http.delete(ENDPOINT.ADDRESS_DETAIL(addressId));
    return res.data;
  },

  setDefaultAddress: async (addressId) => {
    const res = await http.patch(ENDPOINT.ADDRESS_DEFAULT(addressId));
    return res.data;
  },
};
