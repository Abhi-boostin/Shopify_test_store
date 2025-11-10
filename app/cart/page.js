'use client';

import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const lines = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/validate-and-create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lines }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium">Cart {cart.length > 0 && `(${cart.length})`}</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:opacity-70"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="w-24 h-24 relative bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-xs text-gray-600 mb-2">{item.variantTitle}</p>
                    )}
                    <p className="text-sm font-medium mb-3">
                      {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-sm underline hover:no-underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    {item.price.currencyCode} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Estimated total</span>
                <span>{cart[0]?.price.currencyCode || 'USD'} {cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-600">
                Taxes and shipping calculated at checkout
              </p>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-black text-white py-4 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Check out'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
