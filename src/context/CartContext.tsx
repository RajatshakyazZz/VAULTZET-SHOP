'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BundleProduct, CartItem, LicenseType } from '@/types';
import { ORDER_BUMP } from '@/data/bundles';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';

interface CartContextType {
  items: CartItem[];
  buyNowItem: CartItem | null;
  addToCart: (product: BundleProduct, license?: LicenseType) => void;
  buyNow: (product: BundleProduct, license?: LicenseType) => void;
  removeFromCart: (productId: string, license: LicenseType) => void;
  clearBuyNowItem: () => void;
  clearCart: () => void;
  orderBumpAdded: boolean;
  setOrderBumpAdded: (added: boolean) => void;
  toggleOrderBump: () => void;
  cartCount: number;
  subtotal: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [orderBumpAdded, setOrderBumpAdded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const isHydrated = React.useRef(false);

  // Load from storage
  useEffect(() => {
    try {
      localStorage.removeItem('vaultzet_cart');

      const saved = localStorage.getItem('vaultzet_cart_v2');
      if (saved && saved !== '[]') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
      const savedBuyNow = sessionStorage.getItem('vaultzet_buynow_item');
      if (savedBuyNow && savedBuyNow !== 'null') {
        setBuyNowItem(JSON.parse(savedBuyNow));
      }
      const savedBump = localStorage.getItem('vaultzet_bump');
      if (savedBump === 'true') {
        setOrderBumpAdded(true);
      }
    } catch {
      // ignore
    }
    isHydrated.current = true;
  }, []);

  // Save cart to local storage after initial hydration
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem('vaultzet_cart_v2', JSON.stringify(items));
      localStorage.setItem('vaultzet_bump', JSON.stringify(orderBumpAdded));
    } catch {
      // ignore
    }
  }, [items, orderBumpAdded]);

  const addToCart = (product: BundleProduct, license: LicenseType = 'personal') => {
    const price = Number(license === 'reseller' ? product.resellerPrice : product.personalPrice);
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.license === license);
      if (existing) {
        return prev;
      }
      return [...prev, { product, license, price }];
    });
    track('add_to_cart', {
      currency: 'INR',
      value: price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price,
          quantity: 1,
          item_variant: license,
        },
      ],
    });
    setIsCartOpen(true);
  };

  const buyNow = (product: BundleProduct, license: LicenseType = 'personal') => {
    const price = Number(license === 'reseller' ? product.resellerPrice : product.personalPrice);
    const singleItem: CartItem = { product, license, price };
    setBuyNowItem(singleItem);
    try {
      sessionStorage.setItem('vaultzet_buynow_item', JSON.stringify(singleItem));
    } catch {
      // ignore
    }
    track('begin_checkout', {
      currency: 'INR',
      value: price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price,
          quantity: 1,
          item_variant: license,
        },
      ],
    });
    setIsCartOpen(false);
    router.push('/checkout?mode=buynow');
  };

  const clearBuyNowItem = () => {
    setBuyNowItem(null);
    try {
      sessionStorage.removeItem('vaultzet_buynow_item');
    } catch {
      // ignore
    }
  };

  const removeFromCart = (productId: string, license: LicenseType) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId && i.license === license);
      if (item) {
        track('remove_from_cart', {
          currency: 'INR',
          value: item.price,
          items: [
            {
              item_id: item.product.id,
              item_name: item.product.title,
              item_category: item.product.category,
              price: item.price,
              quantity: 1,
              item_variant: item.license,
            },
          ],
        });
      }
      return prev.filter((i) => !(i.product.id === productId && i.license === license));
    });
  };

  const clearCart = () => {
    setItems([]);
    setOrderBumpAdded(false);
  };

  const toggleOrderBump = () => {
    setOrderBumpAdded((prev) => !prev);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal + (orderBumpAdded ? ORDER_BUMP.discountPrice : 0);
  const cartCount = items.length + (orderBumpAdded ? 1 : 0);

  return (
    <CartContext.Provider
      value={{
        items,
        buyNowItem,
        addToCart,
        buyNow,
        removeFromCart,
        clearBuyNowItem,
        clearCart,
        orderBumpAdded,
        setOrderBumpAdded,
        toggleOrderBump,
        cartCount,
        subtotal,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
