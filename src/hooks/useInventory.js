import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { inventoryRequest } from '@/api/inventory';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get inventory list
export const useInventory = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.INVENTORY, params],
    queryFn: () => inventoryRequest.getInventory(params),
    staleTime: 1 * 60 * 1000,
  });
};

// Import stock
export const useImportStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryRequest.importStock(data),
    onSuccess: () => {
      toast.success('Nhập kho thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY });
    },
    onError: (error) => handleErrorApi({ error }),
  });
};
