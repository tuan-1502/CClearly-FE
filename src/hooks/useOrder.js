import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { orderRequest } from '@/api/order';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get orders list (for admin/staff)
export const useOrders = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, params],
    queryFn: async () => {
      const data = await orderRequest.getOrders(params);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get single order detail
export const useOrderDetail = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER_DETAIL(id),
    queryFn: async () => {
      const data = await orderRequest.getOrderDetail(id);
      return data;
    },
    enabled: !!id,
  });
};

// Get user's order history
export const useUserOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_ORDERS,
    queryFn: async () => {
      const data = await orderRequest.getUserOrders();
      return data;
    },
  });
};

// Create regular order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await orderRequest.createOrder(data);
      return res;
    },
    onSuccess: () => {
      toast.success('Tạo đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Create prescription order
export const useCreatePrescriptionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await orderRequest.createPrescriptionOrder(data);
      return res;
    },
    onSuccess: () => {
      toast.success('Tạo đơn kính thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await orderRequest.cancelOrder(id);
      return res;
    },
    onSuccess: () => {
      toast.success('Hủy đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Update order status (Admin/Staff)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, note }) => {
      const res = await orderRequest.updateOrderStatus(id, status, note);
      return res;
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Request return/refund
export const useRequestReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }) => {
      const res = await orderRequest.requestReturn(orderId, data);
      return res;
    },
    onSuccess: () => {
      toast.success('Yêu cầu đổi trả đã được gửi!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Get all orders for admin/staff (with server-side pagination)
export const useAdminOrders = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_ORDERS, params],
    queryFn: () => orderRequest.getAdminOrders(params),
    staleTime: 5000,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
};

// Save prescription for an order item
export const useSavePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }) => {
      const res = await orderRequest.savePrescription(orderId, data);
      return res;
    },
    onSuccess: () => {
      toast.success('Lưu đơn kính thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};
