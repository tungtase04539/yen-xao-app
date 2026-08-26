'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

const CART_STORAGE_KEY = 'yen-xao-cart';

export interface CartPriceUpdate {
  product_id: string;
  variant_id?: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  syncPrices: (updates: CartPriceUpdate[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product_id === newItem.product_id &&
              item.variant_id === newItem.variant_id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (productId: string, variantId?: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product_id === productId && item.variant_id === variantId)
          ),
        }));
      },

      updateQuantity: (productId: string, quantity: number, variantId?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId && item.variant_id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      syncPrices: (updates: CartPriceUpdate[]) => {
        set((state) => ({
          items: state.items.map((item) => {
            const update = updates.find(
              (u) =>
                u.product_id === item.product_id && u.variant_id === item.variant_id
            );
            return update ? { ...item, price: update.price } : item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: CART_STORAGE_KEY,
      // Only persist items, not isOpen state
      partialize: (state) => ({ items: state.items }),
      // Không tự hydrate lúc import: server luôn dựng giỏ rỗng, còn client đọc
      // localStorage ra số khác nên cây DOM hai bên lệch nhau và React vứt bỏ
      // kết quả hydrate (lỗi #418). Để rỗng ở lần render đầu cho khớp server,
      // rồi mới nạp giỏ thật trong effect — xem useCartHydration bên dưới.
      skipHydration: true,
    }
  )
);

// persist chỉ hydrate một lần lúc tải trang, nên nếu không nghe sự kiện storage
// thì tab mở trước sẽ ghi đè giỏ hàng mà tab khác vừa cập nhật.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY) {
      useCart.persist.rehydrate();
    }
  });
}

/**
 * Nạp giỏ hàng từ localStorage SAU khi hydrate xong.
 *
 * Gọi một lần ở component bọc toàn site. Trước khi effect chạy, mọi nơi đọc giỏ
 * đều thấy rỗng — trùng với HTML do server dựng — nên không còn lệch hydrate.
 */
export function useCartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
}
