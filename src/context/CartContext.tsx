'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BundleProduct, CartItem, LicenseType } from '@/types';
import { ORDER_BUMP } from '@/data/bundles';
import { useRouter } from 'next/navigation';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: BundleProduct, license?: LicenseType) => void;
  buyNow: (product: BundleProduct, license?: LicenseType) => void;
  removeFromCart: (productId: string, license: LicenseType) => void;
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
  const [orderBumpAdded, setOrderBumpAdded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vaultzet_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedBump = localStorage.getItem('vaultzet_bump');
      if (savedBump) {
        setOrderBumpAdded(JSON.parse(savedBump));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('vaultzet_cart', JSON.stringify(items));
      localStorage.setItem('vaultzet_bump', JSON.stringify(orderBumpAdded));
    } catch {
      // ignore
    }
  }, [items, orderBumpAdded]);

  const addToCart = (product: BundleProduct, license: LicenseType = 'personal') => {
    const price = license === 'reseller' ? product.resellerPrice : product.personalPrice;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.license === license);
      if (existing) {
        return prev;
      }
      return [...prev, { product, license, price }];
    });
    setIsCartOpen(true);
  };

  const buyNow = (product: BundleProduct, license: LicenseType = 'personal') => {
    const price = license === 'reseller' ? product.resellerPrice : product.personalPrice;
    setItems((prev) => {
      const filtered = prev.filter((i) => !(i.product.id === product.id && i.license === license));
      return [...filtered, { product, license, price }];
    });
    router.push('/checkout');
  };

  const removeFromCart = (productId: string, license: LicenseType) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.license === license)));
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
        addToCart,
        buyNow,
        removeFromCart,
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
