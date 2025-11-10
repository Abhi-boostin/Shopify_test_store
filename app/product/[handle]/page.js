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
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <p className="text-sm">{error || 'Product not found'}</p>
          </div>
          <Link href="/" className="text-sm underline hover:no-underline mt-4 inline-block">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const variants = product.variants.edges.map(edge => edge.node);
  const images = product.images.edges.map(edge => edge.node);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-100 text-center py-2 text-sm">
        Welcome to our store
      </div>

      <header className="border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-medium">
              Test_Store
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link href="/" className="hover:opacity-70">Home</Link>
              <Link href="/" className="hover:opacity-70">Catalog</Link>
              <Link href="/" className="hover:opacity-70">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="hover:opacity-70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="hover:opacity-70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <Link href="/cart" className="hover:opacity-70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {images.length > 0 ? (
              <div className="sticky top-8">
                <div className="aspect-square relative bg-gray-100 mb-4">
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
                      <div key={idx} className="aspect-square relative bg-gray-100 cursor-pointer hover:opacity-75">
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
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-medium mb-4">{product.title}</h1>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-2xl font-medium">
                {variants[0].price.currencyCode} {parseFloat(variants[0].price.amount).toFixed(2)}
              </span>
            </div>

            <AddToCartButton 
              product={product}
              variants={variants}
              images={images}
            />

            {product.description && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div 
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
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
