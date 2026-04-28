import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { returnRequest } from '@/api/return';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get returns list
export const useReturns = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.RETURNS, params],
    queryFn: () => returnRequest.getReturns(params),
    staleTime: 1 * 60 * 1000,
  });
};

// Get single return detail
export const useReturnDetail = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.RETURN_DETAIL(id),
    queryFn: () => returnRequest.getReturnDetail(id),
    enabled: !!id,
  });
};

// Approve return
export const useApproveReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => returnRequest.approveReturn(id),
    onSuccess: () => {
      toast.success('Đã duyệt yêu cầu đổi trả!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RETURNS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// Reject return
export const useRejectReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => returnRequest.rejectReturn(id, { reason }),
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu đổi trả!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RETURNS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};

// Complete return
export const useCompleteReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => returnRequest.completeReturn(id),
    onSuccess: () => {
      toast.success('Đã hoàn tất yêu cầu đổi trả!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RETURNS });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};
