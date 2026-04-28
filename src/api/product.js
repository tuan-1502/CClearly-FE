import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const productRequest = {
  // Get all products with filters and pagination
  getProducts: async (params) => {
    const res = await http.get(ENDPOINT.PRODUCTS, { query: params });
    return res.data;
  },

  // Get single product detail
  getProductDetail: async (id) => {
    const res = await http.get(ENDPOINT.PRODUCT_DETAIL(id));
    return res.data;
  },

  // Get all categories
  getCategories: async () => {
    const res = await http.get(ENDPOINT.CATEGORIES);
    return res.data;
  },

  // Get frames with filters
  getFrames: async (params) => {
    const res = await http.get(ENDPOINT.FRAMES, { query: params });
    return res.data;
  },

  // Get lenses with filters
  getLenses: async (params) => {
    const res = await http.get(ENDPOINT.LENSES, { query: params });
    return res.data;
  },

  // Create product (Admin/Manager only)
  createProduct: async (data) => {
    const res = await http.post(ENDPOINT.PRODUCTS, data);
    return res.data;
  },

  // Update product (Admin/Manager only)
  updateProduct: async (id, data) => {
    const res = await http.patch(ENDPOINT.PRODUCT_DETAIL(id), data);
    return res.data;
  },

  // Delete product (Admin/Manager only)
  deleteProduct: async (id) => {
    const res = await http.delete(ENDPOINT.PRODUCT_DETAIL(id));
    return res.data;
  },

  // Get active banners (public)
  getActiveBanners: async (position) => {
    const params = position ? { position } : {};
    const res = await http.get(ENDPOINT.BANNERS_ACTIVE, { query: params });
    return res.data;
  },

  // Get shipping config (public)
  getShippingConfig: async () => {
    const res = await http.get(ENDPOINT.SHIPPING_CONFIG);
    return res.data;
  },

  // Validate voucher code (public)
  validateVoucher: async (code, orderTotal) => {
    const res = await http.post(ENDPOINT.VALIDATE_VOUCHER, {
      code,
      orderTotal,
    });
    return res.data;
  },
};
