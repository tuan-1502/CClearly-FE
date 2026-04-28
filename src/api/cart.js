import http from '@/lib/http/client';
import { ENDPOINT } from '@/utils/endpoints';

export const cartRequest = {
  // Get current cart
  getCart: async () => {
    const res = await http.get(ENDPOINT.CART);
    return res.data;
  },

  // Add item to cart
  addToCart: async (data) => {
    const res = await http.post(ENDPOINT.ADD_TO_CART, data);
    return res.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const res = await http.patch(ENDPOINT.UPDATE_CART_ITEM(itemId), {
      quantity,
    });
    return res.data;
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    const res = await http.delete(ENDPOINT.REMOVE_CART_ITEM(itemId));
    return res.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const res = await http.delete(ENDPOINT.CLEAR_CART);
    return res.data;
  },
};
