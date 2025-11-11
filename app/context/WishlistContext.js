'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse wishlist:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item) => {
    setWishlist((prev) => {
      const exists = prev.find(i => i.variantId === item.variantId);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (variantId) => {
    setWishlist((prev) => prev.filter(item => item.variantId !== variantId));
  };

  const isInWishlist = (variantId) => {
    return wishlist.some(item => item.variantId === variantId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
