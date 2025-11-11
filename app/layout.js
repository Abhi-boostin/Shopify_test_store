import "./globals.css";
import { CartProvider } from "./cart/CartContext";

export const metadata = {
  title: "Test Store",
  description: "Premium products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
