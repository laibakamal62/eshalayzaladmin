import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Panel",
  description: "Admin dashboard for managing products, orders, etc.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex">
          <Sidebar /> {/* ✅ Sidebar on the left */}
          <main className="flex-1 bg-gray-50 min-h-screen p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
