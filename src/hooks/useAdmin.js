import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminRequest } from '@/api/admin';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// ─── Dashboard ───────────────────────────────────────────────
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD,
    queryFn: () => adminRequest.getDashboard(),
    staleTime: 5000,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
};

// ─── Revenue ─────────────────────────────────────────────────
export const useAdminRevenue = (params = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_REVENUE, params],
    queryFn: () => adminRequest.getRevenue(params),
    staleTime: 2 * 60 * 1000,
  });
};

// ─── Users ───────────────────────────────────────────────────
export const useAdminUsers = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_USERS, params],
    queryFn: () => adminRequest.getUsers(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminRequest.createUser(data),
    onSuccess: () => {
      toast.success('Tạo tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) => adminRequest.updateUser(userId, data),
    onSuccess: () => {
      toast.success('Cập nhật tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => adminRequest.deleteUser(userId),
    onSuccess: () => {
      toast.success('Xóa tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// ─── Settings ────────────────────────────────────────────────
export const useAdminSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_SETTINGS,
    queryFn: () => adminRequest.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) => adminRequest.updateSettings(settings),
    onSuccess: () => {
      toast.success('Cập nhật cài đặt thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SETTINGS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// ─── Audit Logs ──────────────────────────────────────────────
export const useAdminLogs = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_LOGS, params],
    queryFn: () => adminRequest.getLogs(params),
    staleTime: 30 * 1000,
  });
};

// ─── Banners ─────────────────────────────────────────────────
export const useBanners = () => {
  return useQuery({
    queryKey: QUERY_KEYS.BANNERS,
    queryFn: () => adminRequest.getBanners(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminRequest.createBanner(data),
    onSuccess: () => {
      toast.success('Tạo banner thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANNERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminRequest.updateBanner(id, data),
    onSuccess: () => {
      toast.success('Cập nhật banner thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANNERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminRequest.deleteBanner(id),
    onSuccess: () => {
      toast.success('Xóa banner thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANNERS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// ─── Promotions ──────────────────────────────────────────────
export const usePromotions = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROMOTIONS, params],
    queryFn: () => adminRequest.getPromotions(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminRequest.createPromotion(data),
    onSuccess: () => {
      toast.success('Tạo mã giảm giá thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminRequest.updatePromotion(id, data),
    onSuccess: () => {
      toast.success('Cập nhật mã giảm giá thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminRequest.deletePromotion(id),
    onSuccess: () => {
      toast.success('Xóa mã giảm giá thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useTogglePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminRequest.togglePromotion(id),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái mã giảm giá thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROMOTIONS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};
