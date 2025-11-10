import { storefrontGraphQL } from '@/lib/shopify';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
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

export default async function ProductPage({ params }) {
  // Await params in Next.js 15+
  const { handle } = await params;
  
  let product = null;
  let error = null;

  try {
    const data = await storefrontGraphQL(PRODUCT_QUERY, { handle });
    
    if (!data.productByHandle) {
      error = 'Product not found';
    } else {
      product = data.productByHandle;
    }
  } catch (err) {
    console.error('Failed to fetch product:', err);
    error = err.message;
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

  const variants = product.variants.edges.map(edge => edge.node);
  const images = product.images.edges.map(edge => edge.node);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Shopify Store
            </Link>
            <Link 
              href="/cart"
              className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
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
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={images[0].url}
                    alt={images[0].altText || product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(1, 5).map((image, idx) => (
                      <div key={idx} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={image.url}
                          alt={image.altText || `${product.title} ${idx + 2}`}
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
            
            <p className="text-2xl font-bold text-gray-900 mb-6">
              {variants[0].price.currencyCode} {parseFloat(variants[0].price.amount).toFixed(2)}
            </p>

            {/* Add to Cart Component */}
            <AddToCartButton 
              product={product}
              variants={variants}
              images={images}
            />

            {/* Description */}
            {product.description && (
              <div className="border-t pt-6 mt-6">
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
