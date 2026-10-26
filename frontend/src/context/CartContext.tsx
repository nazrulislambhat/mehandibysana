'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, DeliveryDetails } from '@/types';
import { evaluatePincode } from '@/lib/pincode';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryDetails: DeliveryDetails;
  setDeliveryDetails: React.Dispatch<React.SetStateAction<DeliveryDetails>>;
  subtotal: number;
  itemCount: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  shippingFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mbs_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedDelivery = localStorage.getItem('mbs_delivery');
      let parsedDelivery: DeliveryDetails = {};
      if (savedDelivery) {
        parsedDelivery = JSON.parse(savedDelivery);
      }

      const savedPin = localStorage.getItem('mbs_pincode');
      if (savedPin && savedPin.length === 6 && !parsedDelivery.pincode) {
        const pinRes = evaluatePincode(savedPin);
        if (pinRes.isServiceable) {
          parsedDelivery = {
            ...parsedDelivery,
            pincode: savedPin,
            city: pinRes.city,
            state: pinRes.state,
            shippingFee: pinRes.shippingFee,
          };
        }
      }
      setDeliveryDetails(parsedDelivery);
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('mbs_cart', JSON.stringify(cart));
      } catch (e) {
        console.warn('Failed to save cart', e);
      }
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('mbs_delivery', JSON.stringify(deliveryDetails));
      } catch (e) {
        console.warn('Failed to save delivery details', e);
      }
    }
  }, [deliveryDetails, mounted]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic pincode evaluation
  const activePinResult = deliveryDetails.pincode && deliveryDetails.pincode.length === 6
    ? evaluatePincode(deliveryDetails.pincode)
    : null;

  const freeShippingThreshold = activePinResult?.freeShippingAbove || 999;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const baseShipping = activePinResult ? activePinResult.shippingFee : (deliveryDetails.shippingFee ?? 80);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : baseShipping;
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        deliveryDetails,
        setDeliveryDetails,
        subtotal,
        itemCount,
        freeShippingThreshold,
        freeShippingProgress,
        shippingFee,
        total,
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
