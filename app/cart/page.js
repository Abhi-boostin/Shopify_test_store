'use client';

import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-black">
              TEST STORE
            </Link>
            
            <div className="flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-black hover:opacity-60">SHOP</Link>
              <Link href="/" className="text-sm font-medium text-black hover:opacity-60">ABOUT</Link>
              <Link href="/cart" className="text-black hover:opacity-60">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-black mb-12 uppercase">Cart</h1>

        {error && (
          <div className="border-2 border-black p-6 mb-8">
            <p className="text-black font-medium">{error}</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-black mb-8">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block border-2 border-black px-8 py-3 text-sm font-bold text-black hover:bg-black hover:text-white transition-colors uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="border-2 border-black divide-y-2 divide-black">
              {cart.map((item) => (
                <div key={item.variantId} className="p-6 flex gap-6">
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-black uppercase mb-1">{item.title}</h3>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-xs text-black mb-2">{item.variantTitle}</p>
                    )}
                    <p className="text-sm font-bold text-black mb-4">
                      ${parseFloat(item.price.amount).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-black">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-1 text-black hover:bg-black hover:text-white transition-colors"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-x-2 border-black text-sm font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-1 text-black hover:bg-black hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-xs font-medium text-black hover:opacity-60 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-black">
                    ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-2 border-black p-8">
              <div className="flex justify-between text-2xl font-bold text-black mb-8">
                <span>TOTAL</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-black text-white py-4 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors font-bold text-sm uppercase"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
