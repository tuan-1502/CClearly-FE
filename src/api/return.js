import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const returnRequest = {
  // Get all returns/refunds (with optional status filter)
  getReturns: async (params) => {
    const res = await http.get(ENDPOINT.RETURNS, { query: params });
    return res.data;
  },

  // Get single return detail
  getReturnDetail: async (id) => {
    const res = await http.get(ENDPOINT.RETURN_DETAIL(id));
    return res.data;
  },

  // Approve a return
  approveReturn: async (id) => {
    const res = await http.put(ENDPOINT.RETURN_APPROVE(id));
    return res.data;
  },

  // Reject a return
  rejectReturn: async (id, data) => {
    const res = await http.put(ENDPOINT.RETURN_REJECT(id), data);
    return res.data;
  },

  // Complete a return
  completeReturn: async (id) => {
    const res = await http.put(ENDPOINT.RETURN_COMPLETE(id));
    return res.data;
  },
};
