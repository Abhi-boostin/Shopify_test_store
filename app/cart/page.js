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
      // Prepare line items for checkout
      const lines = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lines }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Shopify checkout
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Shopify Store
            </Link>
            <Link 
              href="/cart"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Cart ({cart.length})
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Checkout Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {cart.map((item) => (
                <div key={item.variantId} className="p-6 flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 relative bg-gray-100 rounded flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-sm text-gray-600">{item.variantTitle}</p>
                    )}
                    <p className="text-gray-900 font-medium mt-1">
                      {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[6rem]">
                    <p className="font-semibold text-gray-900">
                      {item.price.currencyCode}{' '}
                      {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {cart[0]?.price.currencyCode || 'USD'} {cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating checkout...' : 'Proceed to Checkout'}
              </button>

              <Link
                href="/"
                className="block text-center text-blue-600 hover:underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
