import "./globals.css";
import { CartProvider } from "./cart/CartContext";

export const metadata = {
  title: "Shopify Storefront Demo",
  description: "Next.js storefront wired to Shopify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
