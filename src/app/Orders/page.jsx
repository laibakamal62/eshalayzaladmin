"use client";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
const baseURL = process.env.NEXT_PUBLIC_BASE_URL
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${baseURL}/api/admin`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-[#7C3AED] text-white p-6 fixed top-0 left-0 h-screen overflow-y-auto rounded-r-[40px] shadow-md z-50">
        <h2 className="text-3xl font-bold mb-6">Eshal & Ayyzal</h2>
        <ul className="space-y-2">
          <li>Dashboard</li>
          <li>Orders</li>
          <li>Products</li>
        </ul>
      </div>

      {/* Main content */}
      <div className="ml-80 p-6 bg-gray-50 min-h-screen overflow-auto w-full">
        <h1 className="text-2xl font-bold mb-6">All Orders</h1>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Customer</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Contact</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Products</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
         <tbody>
  {orders.map((order) => (
    <tr key={order._id}>
      <td className="border p-2">{order.formData?.fullName || "N/A"}</td>
      <td className="border p-2">{order.formData?.email || order.userEmail}</td>
      <td className="border p-2">{order.formData?.contactNumber || "N/A"}</td>
      <td className="border p-2">
        {order.formData
          ? `${order.formData.address}, ${order.formData.city}, ${order.formData.country}`
          : "N/A"}
      </td>
      <td className="border p-2">
        {(order.cartItems || []).map((item) => (
          <div key={item.id || item._id} className="mb-1">
            <span className="font-semibold">{item.title}</span> | 
            Qty: {item.quantity} | 
            Color: {item.color || "N/A"} | 
            Size: {item.size || "N/A"} | 
            ${item.price}
          </div>
        ))}
      </td>
      <td className="border p-2 font-bold">${order.total}</td>
      <td className="border p-2">{new Date(order.createdAt).toLocaleString()}</td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}
