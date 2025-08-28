"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Package,
  Tag,
  ShoppingCart,
} from "lucide-react";

const navItems = [
  { name: "Product", icon: Package, href: "/products" },
  { name: "Product Categories", icon: Tag, href: "/category" },
  { name: "Orders", icon: ShoppingCart, href: "/Orders" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-[#7C3AED] text-white flex items-center justify-between px-4 py-3 z-50">
        <h1 className="text-xl font-bold">Eshal & Ayyzal</h1>
        <button onClick={() => setIsOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-[#7C3AED] text-white rounded-r-[40px] shadow-md z-50 transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-6 lg:block">
          <h1 className="text-3xl font-bold tracking-wider">
            <span className="text-white">Eshal</span>
            <span className="text-white font-light">&</span>
            <span className="text-white">Ayyzal</span>
          </h1>
          {/* Close button only on mobile */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={28} />
          </button>
        </div>

        <nav className="px-2 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-[18px] font-semibold rounded-l-full transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#3398F4]"
                    : "hover:bg-white/10 text-white"
                }`}
                onClick={() => setIsOpen(false)} // close sidebar on click (mobile)
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay (for mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
