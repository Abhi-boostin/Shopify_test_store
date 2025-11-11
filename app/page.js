import { storefrontGraphQL } from '@/lib/shopify';
import Link from 'next/link';
import Image from 'next/image';

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export default async function HomePage() {
  let products = [];
  let error = null;

  try {
    const data = await storefrontGraphQL(PRODUCTS_QUERY, { first: 12 });
    products = data.products.edges.map(edge => edge.node);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    error = err.message;
  }

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

      <main>
        <section className="border-b border-black py-32 text-center">
          <h1 className="text-7xl font-bold text-black mb-6">PREMIUM COLLECTION</h1>
          <p className="text-xl text-black mb-8">Curated products for modern living</p>
          <Link 
            href="/"
            className="inline-block border-2 border-black px-12 py-4 text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
          >
            SHOP NOW
          </Link>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          {error && (
            <div className="border-2 border-black p-6 mb-8">
              <p className="text-black font-medium">{error}</p>
            </div>
          )}

          {products.length === 0 && !error && (
            <div className="text-center py-20">
              <p className="text-black">No products available</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group"
              >
                <div className="aspect-square bg-gray-100 mb-4 overflow-hidden">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-medium text-black mb-2 uppercase">{product.title}</h3>
                <p className="text-sm text-black">
                  ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-sm text-black">© 2024 TEST STORE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
