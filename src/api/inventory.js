import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const inventoryRequest = {
  // Get inventory list (with optional search & warehouseId filters)
  getInventory: async (params) => {
    const res = await http.get(ENDPOINT.INVENTORY, { query: params });
    return res.data;
  },

  // Import stock into warehouse
  importStock: async (data) => {
    const res = await http.post(ENDPOINT.INVENTORY_IMPORT, data);
    return res.data;
  },
};
