'use client';

import { useState, useEffect } from 'react';
import { storefrontGraphQL } from '@/lib/shopify';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/cart/CartContext';

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
`;

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontGraphQL(PRODUCT_QUERY, { handle: params.handle });
        
        if (!data.product) {
          setError('Product not found');
          return;
        }

        setProduct(data.product);
        // Select first variant by default
        if (data.product.variants.edges.length > 0) {
          setSelectedVariant(data.product.variants.edges[0].node);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.handle]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        variantId: selectedVariant.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        image: product.images.edges[0]?.node.url,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading product</p>
            <p className="text-sm">{error || 'Product not found'}</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

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
              Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
          {/* Images */}
          <div>
            {product.images.edges.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.images.edges[0].node.url}
                    alt={product.images.edges[0].node.altText || product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {product.images.edges.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.edges.slice(1, 5).map((edge, idx) => (
                      <div key={idx} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={edge.node.url}
                          alt={edge.node.altText || `${product.title} ${idx + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            
            {selectedVariant && (
              <p className="text-2xl font-bold text-gray-900 mb-6">
                {selectedVariant.price.currencyCode}{' '}
                {parseFloat(selectedVariant.price.amount).toFixed(2)}
              </p>
            )}

            {/* Variant Selection */}
            {product.variants.edges.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant
                </label>
                <select
                  value={selectedVariant?.id || ''}
                  onChange={(e) => {
                    const variant = product.variants.edges.find(
                      edge => edge.node.id === e.target.value
                    )?.node;
                    setSelectedVariant(variant);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {product.variants.edges.map((edge) => (
                    <option key={edge.node.id} value={edge.node.id}>
                      {edge.node.title} - {edge.node.price.currencyCode} {parseFloat(edge.node.price.amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-6"
            >
              {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Description */}
            {product.description && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <div 
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
