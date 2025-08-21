"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  FileText,
  ShoppingCart,
  Undo2,
  Users,
  UserCheck,
  UserCog,
  CreditCard,
  Gift,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Product", icon: Package, href: "/products" },
  { name: "Product Categories", icon: Tag, href: "/category" },
  { name: "KYC", icon: FileText, href: "/kyc" },
  { name: "Orders", icon: ShoppingCart, href: "/Orders" },
  { name: "Returns", icon: Undo2, href: "/returns" },
  { name: "Sellers Management", icon: UserCheck, href: "/sellers" },
  { name: "Buyers Management", icon: Users, href: "/buyers" },
  { name: "Freelancers Management", icon: UserCog, href: "/freelancers" },
  { name: "Credits Requests", icon: CreditCard, href: "/credits" },
  { name: "Hibuy Products", icon: Package, href: "/hibuy-products" },
  { name: "Promotions", icon: Gift, href: "/promotions" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-80 bg-[#7C3AED] text-white rounded-r-[40px] shadow-md fixed top-0 left-0 z-50 overflow-y-auto">
     <div className="text-left px-4 py-6">
  <h1 className="text-3xl font-bold text-white tracking-wider">
    <span className="text-white">Eshal</span>
    <span className="text-white font-light">&</span>
    <span className="text-white">Ayyzal</span>
  </h1>
</div>



      <nav className="px-2 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-[20px] font-semibold rounded-l-full transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#3398F4]"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
