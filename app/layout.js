import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart/CartContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Test Store - Premium Products",
  description: "Discover our curated collection of premium products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
