'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart from localStorage:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(i => i.variantId === item.variantId);
      
      if (existingItem) {
        // Increment quantity if item already in cart
        return prevCart.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prevCart) => prevCart.filter(item => item.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + parseFloat(item.price.amount) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
