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
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const isAvailable = selectedVariant?.availableForSale;

  return (
    <>
      {variants.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = variants.find(v => v.id === e.target.value);
              setSelectedVariant(variant);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} - {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {added ? '✓ Added to Cart' : isAvailable ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </>
  );
}
