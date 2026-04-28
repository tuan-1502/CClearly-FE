import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userRequest } from '@/api/user';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => userRequest.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

// Get customers list (for sales staff)
export const useCustomers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS,
    queryFn: () => userRequest.getCustomers(),
    staleTime: 2 * 60 * 1000,
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userRequest.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// ── Addresses ──

export const useAddresses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADDRESSES,
    queryFn: () => userRequest.getAddresses(),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userRequest.createAddress(data),
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, data }) =>
      userRequest.updateAddress(addressId, data),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId) => userRequest.deleteAddress(addressId),
    onSuccess: () => {
      toast.info('Đã xóa địa chỉ');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId) => userRequest.setDefaultAddress(addressId),
    onSuccess: () => {
      toast.success('Đã đặt làm mặc định');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};
