"use client";
import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

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
    <div className="p-4 sm:ml-64 md:ml-80 min-h-screen bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 mt-4">All Orders</h1>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-purple-100 text-gray-700 text-left text-sm">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Address</th>
              <th className="p-4">Products</th>
              <th className="p-4">Total</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{order.formData?.fullName || "N/A"}</td>
                  <td className="p-4">{order.formData?.email || order.userEmail}</td>
                  <td className="p-4">{order.formData?.contactNumber || "N/A"}</td>
                  <td className="p-4">
                    {order.formData
                      ? `${order.formData.address}, ${order.formData.city}, ${order.formData.country}`
                      : "N/A"}
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 font-bold">${order.total}</td>
                  <td className="p-4">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold">Customer:</span> {order.formData?.fullName || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {order.formData?.email || order.userEmail}
                </div>
                <div>
                  <span className="font-semibold">Contact:</span> {order.formData?.contactNumber || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {order.formData
                    ? `${order.formData.address}, ${order.formData.city}, ${order.formData.country}`
                    : "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Products:</span>
                  {(order.cartItems || []).map((item) => (
                    <div key={item.id || item._id} className="mt-1 text-sm">
                      <span className="font-semibold">{item.title}</span> | 
                      Qty: {item.quantity} | 
                      Color: {item.color || "N/A"} | 
                      Size: {item.size || "N/A"} | 
                      ${item.price}
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-semibold">Total:</span> ${order.total}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}