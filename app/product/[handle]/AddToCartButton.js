'use client';

import { useState } from 'react';
import { useCart } from '@/app/cart/CartContext';

export default function AddToCartButton({ product, variants, images }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        variantId: selectedVariant.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        image: images[0]?.url,
      });
    }
  };

  const isAvailable = selectedVariant?.availableForSale;

  return (
    <div className="space-y-6">
      {variants.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Variant
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = variants.find(v => v.id === e.target.value);
              setSelectedVariant(variant);
            }}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} - ${parseFloat(variant.price.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex items-center border border-gray-300">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 hover:bg-gray-50 text-lg"
          >
            −
          </button>
          <span className="px-6 py-3 border-x border-gray-300 min-w-[4rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-3 hover:bg-gray-50 text-lg"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="flex-1 bg-black text-white px-8 py-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {isAvailable ? 'Add to cart' : 'Out of Stock'}
        </button>
      </div>

      <button className="w-full bg-white border border-black px-8 py-3 hover:bg-gray-50 transition-colors">
        Buy it now
      </button>

      {product.description && (
        <div className="text-sm text-gray-600">
          {product.description.substring(0, 100)}...
        </div>
      )}
    </div>
  );
}
