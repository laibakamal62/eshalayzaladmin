"use client";
import { ShoppingCart, Package, Users, DollarSign } from "lucide-react";

const cards = [
  {
    title: "Total Products",
    value: "150",
    icon: <Package size={28} className="text-[#7C3AED]" />,
  },
  {
    title: "Total Orders",
    value: "82",
    icon: <ShoppingCart size={28} className="text-[#7C3AED]" />,
  },
  {
    title: "Total Users",
    value: "200",
    icon: <Users size={28} className="text-[#7C3AED]" />,
  },
  {
    title: "Revenue",
    value: "$18,500",
    icon: <DollarSign size={28} className="text-[#7C3AED]" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="ml-80 min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <h2 className="text-gray-600 text-md font-semibold mb-1">{card.title}</h2>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
