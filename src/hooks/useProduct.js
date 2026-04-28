import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productRequest } from '@/api/product';
import { handleErrorApi } from '@/lib/errors/handleError';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get products list with filters
export const useProducts = (params) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, params],
    queryFn: async () => {
      const data = await productRequest.getProducts(params);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single product detail
export const useProductDetail = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
    queryFn: async () => {
      const data = await productRequest.getProductDetail(id);
      return data;
    },
    enabled: !!id,
  });
};

// Get categories
export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: async () => {
      const data = await productRequest.getCategories();
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get active banners (public, for homepage)
export const useActiveBanners = (position) => {
  return useQuery({
    queryKey: position
      ? [...QUERY_KEYS.ACTIVE_BANNERS, position]
      : QUERY_KEYS.ACTIVE_BANNERS,
    queryFn: () => productRequest.getActiveBanners(position),
    staleTime: 5 * 60 * 1000,
  });
};

// Get frames with filters
export const useFrames = (params) => {
  return useQuery({
    queryKey: ['frames', params],
    queryFn: async () => {
      const data = await productRequest.getFrames(params);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get lenses with filters
export const useLenses = (params) => {
  return useQuery({
    queryKey: ['lenses', params],
    queryFn: async () => {
      const data = await productRequest.getLenses(params);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Create product (Admin/Manager)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await productRequest.createProduct(data);
      return res;
    },
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Update product (Admin/Manager)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await productRequest.updateProduct(id, data);
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT_DETAIL(variables.id),
      });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Delete product (Admin/Manager)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await productRequest.deleteProduct(id);
      return res;
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};
