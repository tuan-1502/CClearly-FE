import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { cartRequest } from '@/api/cart';
import { useAuth } from '@/contexts/AuthContext';
import { handleErrorApi } from '@/lib/errors/handleError';
import { useGuestCartStore } from '@/stores/guestCartStore';
import { QUERY_KEYS } from '@/utils/endpoints';

// Get cart — works for both authenticated (server) and guest (localStorage)
export const useCart = (options = {}) => {
  const { isAuthenticated } = useAuth();
  const guestStore = useGuestCartStore();

  const serverQuery = useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: async () => {
      const data = await cartRequest.getCart();
      return data;
    },
    staleTime: 0,
    enabled: isAuthenticated,
    ...options,
  });

  // For guest users, return localStorage data in the same shape
  if (!isAuthenticated) {
    return {
      data: guestStore.getCartData(),
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => {},
    };
  }

  return serverQuery;
};

// Add to cart
// For guest: data should include { variantId, quantity, productName, price, imageUrl, colorName, productType, variantSku, isPreorder }
// For authenticated: data should include { variantId, quantity, lensVariantId? }
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const addGuestItem = useGuestCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (data) => {
      if (!isAuthenticated) {
        addGuestItem(data);
        return { success: true };
      }
      const res = await cartRequest.addToCart({
        variantId: data.variantId,
        productId: data.productId,
        quantity: data.quantity,
        lensVariantId: data.lensVariantId,
      });
      return res;
    },
    onSuccess: () => {
      toast.success('Thêm vào giỏ hàng thành công!');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      }
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const updateGuestItem = useGuestCartStore((s) => s.updateItem);

  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      if (!isAuthenticated) {
        updateGuestItem(itemId, quantity);
        return { success: true };
      }
      const res = await cartRequest.updateCartItem(itemId, quantity);
      return res;
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      }
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Remove from cart
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const removeGuestItem = useGuestCartStore((s) => s.removeItem);

  return useMutation({
    mutationFn: async (itemId) => {
      if (!isAuthenticated) {
        removeGuestItem(itemId);
        return { success: true };
      }
      const res = await cartRequest.removeCartItem(itemId);
      return res;
    },
    onSuccess: () => {
      toast.success('Đã xóa khỏi giỏ hàng!');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      }
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const clearGuestCart = useGuestCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        clearGuestCart();
        return { success: true };
      }
      const res = await cartRequest.clearCart();
      return res;
    },
    onSuccess: () => {
      toast.success('Đã xóa giỏ hàng!');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      }
    },
    onError: (error) => {
      handleErrorApi({ error });
    },
  });
};

// Hook to sync guest cart to server after login
export const useSyncGuestCart = () => {
  const queryClient = useQueryClient();
  const guestItems = useGuestCartStore((s) => s.items);
  const clearGuestCart = useGuestCartStore((s) => s.clearCart);

  const syncCart = useCallback(async () => {
    if (guestItems.length === 0) return;

    // Add each guest item to the server cart
    const promises = guestItems.map((item) =>
      cartRequest
        .addToCart({
          variantId: item.variantId,
          quantity: item.quantity,
        })
        .catch(() => {
          // Ignore individual failures (e.g. variant no longer available)
        })
    );

    await Promise.allSettled(promises);
    clearGuestCart();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
  }, [guestItems, clearGuestCart, queryClient]);

  return syncCart;
};
