import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGuestCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const itemKey = item.variantId || item.productId;
        const existing = items.find((i) => (i.variantId || i.productId) === itemKey);

        if (existing) {
          // Increment quantity
          set({
            items: items.map((i) =>
              (i.variantId || i.productId) === itemKey
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                cartItemId: crypto.randomUUID(),
                variantId: item.variantId,
                productId: item.productId,
                productName: item.productName || '',
                variantSku: item.variantSku || '',
                colorName: item.colorName || '',
                productType: item.productType || '',
                price: item.price || 0,
                quantity: item.quantity || 1,
                imageUrl: item.imageUrl || '',
                isPreorder: item.isPreorder || false,
              },
            ],
          });
        }
      },

      updateItem: (cartItemId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        });
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter((i) => i.cartItemId !== cartItemId),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartData: () => {
        const items = get().items;
        const totalAmount = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return {
          items,
          totalAmount,
          totalItems: items.length,
        };
      },
    }),
    {
      name: 'guest-cart',
    }
  )
);
