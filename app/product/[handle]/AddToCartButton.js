'use client';

import { useState } from 'react';
import { useCart } from '@/app/cart/CartContext';

export default function AddToCartButton({ product, variants, images }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (selectedVariant) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          variantId: selectedVariant.id,
          title: product.title,
          variantTitle: selectedVariant.title,
          price: selectedVariant.price,
          image: images[0]?.url,
        });
      }
    }
  };

  const isAvailable = selectedVariant?.availableForSale;

  return (
    <div className="space-y-6">
      {variants.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-black mb-3 uppercase">
            Variant
          </label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const variant = variants.find(v => v.id === e.target.value);
              setSelectedVariant(variant);
            }}
            className="w-full border-2 border-black px-4 py-3 text-black font-medium focus:outline-none"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} - ${parseFloat(variant.price.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex items-center border-2 border-black">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-6 py-3 text-black font-bold hover:bg-black hover:text-white transition-colors"
          >
            −
          </button>
          <span className="px-8 py-3 border-x-2 border-black font-bold text-black">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-6 py-3 text-black font-bold hover:bg-black hover:text-white transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="flex-1 bg-black text-white px-8 py-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-bold text-sm uppercase"
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
