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
          description
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

      <main>
        <section className="relative h-[500px] bg-gradient-to-br from-teal-700 via-teal-600 to-orange-400 flex items-center justify-center text-white">
          <div className="text-center z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Browse our latest products</h1>
            <Link 
              href="/"
              className="inline-block border-2 border-white px-8 py-3 hover:bg-white hover:text-gray-900 transition-colors"
            >
              Shop all
            </Link>
          </div>
        </section>

        <section className="max-w-screen-2xl mx-auto px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium">Products</h2>
            <Link href="/" className="text-sm underline hover:no-underline">
              View all
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {products.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              <p>No products found.</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group"
              >
                <div className="relative aspect-square bg-gray-100 mb-3 overflow-hidden">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white text-xs px-2 py-1">
                    Sale
                  </div>
                </div>

                <h3 className="text-sm mb-1 group-hover:underline">{product.title}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {product.priceRange.minVariantPrice.currencyCode} {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Test_Store. Powered by Shopify.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
