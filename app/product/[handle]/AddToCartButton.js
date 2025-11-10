'use client';

import { useState } from 'react';
import { useCart } from '@/app/cart/CartContext';

export default function AddToCartButton({ product, variants, images }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        variantId: selectedVariant.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        image: images[0]?.url,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const isAvailable = selectedVariant?.availableForSale;

  return (
    <div className="space-y-6">
      {variants.length > 1 && (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Select Variant
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = variants.find(v => v.id === e.target.value);
              setSelectedVariant(variant);
              setAdded(false);
            }}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} - ${parseFloat(variant.price.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 text-lg"
      >
        {added ? (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Added to Cart!
          </>
        ) : isAvailable ? (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart
          </>
        ) : (
          'Out of Stock'
        )}
      </button>

      {isAvailable && !added && (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          In Stock & Ready to Ship
        </div>
      )}
    </div>
  );
}
