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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="border-2 border-black p-6">
            <p className="text-black font-medium">{error || 'Product not found'}</p>
          </div>
          <Link href="/" className="inline-block mt-4 text-sm font-medium text-black hover:opacity-60">
            ← BACK
          </Link>
        </div>
      </div>
    );
  }

  const variants = product.variants.edges.map(edge => edge.node);
  const images = product.images.edges.map(edge => edge.node);

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

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/" className="inline-block text-sm font-medium text-black hover:opacity-60 mb-8">
          ← BACK
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            {images.length > 0 ? (
              <div>
                <div className="aspect-square bg-gray-100 mb-4">
                  <Image
                    src={images[0].url}
                    alt={images[0].altText || product.title}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.slice(1, 5).map((image, idx) => (
                      <div key={idx} className="aspect-square bg-gray-100">
                        <Image
                          src={image.url}
                          alt={image.altText || `${product.title} ${idx + 2}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold text-black mb-6 uppercase">{product.title}</h1>
            
            <p className="text-3xl font-bold text-black mb-8">
              ${parseFloat(variants[0].price.amount).toFixed(2)}
            </p>

            <AddToCartButton 
              product={product}
              variants={variants}
              images={images}
            />

            {product.description && (
              <div className="mt-12 pt-8 border-t border-black">
                <h2 className="text-sm font-bold text-black mb-4 uppercase">Details</h2>
                <div 
                  className="text-sm text-black leading-relaxed"
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
