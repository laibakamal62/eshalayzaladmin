"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    image: null,
    description: "",
    variations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = () => {
    setIsLoading(true);
    fetch("/api/get-products")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProducts(data.products || []);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addVariation = () => {
    setForm((prev) => ({
      ...prev,
      variations: [...prev.variations, { color: "#000000", price: "", imageFile: null }],
    }));
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...form.variations];
    newVariations[index][field] = value;
    setForm((prev) => ({ ...prev, variations: newVariations }));
  };

  const removeVariation = (index) => {
    const newVariations = [...form.variations];
    newVariations.splice(index, 1);
    setForm((prev) => ({ ...prev, variations: newVariations }));
  };

  const openAddModal = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      image: null,
      description: "",
      variations: [],
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setForm({
      ...product,
      brand: product.brand || "",
      image: null,
      description: product.description || "",
      variations: (product.variations || []).map((v) => ({
        color: v.color || "#000000",
        price: v.price || "",
        imageFile: null,
        image: v.image || "",
      })),
    });
    setEditProductId(product._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddOrEditProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    form.variations.forEach((variation, i) => {
      const varCopy = { color: variation.color, price: variation.price };
      formData.append(`variations[${i}]`, JSON.stringify(varCopy));
      if (variation.imageFile) {
        formData.append(`variationImage_${i}`, variation.imageFile);
      }
    });

    try {
      const url = isEditing ? `/api/edit-product?id=${editProductId}` : "/api/add-product";
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Product saved successfully");
        setShowModal(false);
        fetchProducts();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error, check console.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/delete-product?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return (
    <div className="p-4 sm:ml-64 md:ml-80 min-h-screen bg-gray-50 flex items-center justify-center">
      Loading...
    </div>
  );

  return (
    <div className="p-4 sm:ml-64 md:ml-80 min-h-screen bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0 mt-4">All Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-full shadow hover:bg-[#6A2FCC] transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="min-w-full">
          <thead className="bg-purple-100 text-gray-700 text-left text-sm">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Category</th>
              <th className="p-4">Variations</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img
                      src={`/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </td>
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4">{product.brand || "—"}</td>
                  <td className="p-4">${product.price}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4 max-w-xs">
                    {product.variations && product.variations.length > 0 ? (
                      product.variations.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          {v.image ? (
                            <img
                              src={`/uploads/products/${v.image}`}
                              alt="Variation"
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded" />
                          )}
                          <div>
                            <div className="text-xs text-gray-600">
                              Color:{" "}
                              <span
                                className="inline-block w-4 h-4 rounded border"
                                style={{ backgroundColor: v.color || "#000" }}
                              />
                            </div>
                            <div className="text-xs">${v.price}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">No variations</div>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Let's add some products to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex gap-4">
                <img
                  src={`/uploads/products/${product.image}`}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">Brand: {product.brand || "—"}</p>
                  <p className="text-sm text-gray-600">Price: ${product.price}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium">Variations:</p>
                {product.variations && product.variations.length > 0 ? (
                  product.variations.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      {v.image ? (
                        <img
                          src={`/uploads/products/${v.image}`}
                          alt="Variation"
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded" />
                      )}
                      <div>
                        <div className="text-xs text-gray-600">
                          Color:{" "}
                          <span
                            className="inline-block w-4 h-4 rounded border"
                            style={{ backgroundColor: v.color || "#000" }}
                          />
                        </div>
                        <div className="text-xs">${v.price}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No variations</p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => openEditModal(product)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            Let's add some products to get started!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddOrEditProduct}
            className="bg-white rounded-xl p-6 w-full max-w-lg sm:max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="name"
                onChange={handleInputChange}
                value={form.name}
                className="border p-2 rounded w-full"
                placeholder="Product Name"
                required
              />
              <input
                name="brand"
                onChange={handleInputChange}
                value={form.brand}
                className="border p-2 rounded w-full"
                placeholder="Brand"
              />
              <input
                name="price"
                type="number"
                onChange={handleInputChange}
                value={form.price}
                className="border p-2 rounded w-full"
                placeholder="Price"
                required
              />
              <input
                name="stock"
                type="number"
                onChange={handleInputChange}
                value={form.stock}
                className="border p-2 rounded w-full"
                placeholder="Stock"
                required
              />
              <select
                name="category"
                onChange={handleInputChange}
                value={form.category}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                onChange={handleInputChange}
                value={form.description}
                className="col-span-1 sm:col-span-2 border p-2 rounded w-full"
                placeholder="Product Description"
                rows="4"
              />
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="col-span-1 sm:col-span-2 border p-2 rounded w-full"
                {...(!isEditing && { required: true })}
              />
            </div>

            {/* Variations Section */}
            <div className="col-span-1 sm:col-span-2 border p-4 rounded mt-6">
              <h3 className="font-semibold mb-4">Variations</h3>
              {form.variations.map((variation, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center border p-3 rounded"
                >
                  <input
                    type="text"
                    placeholder="Color (e.g., red, #FF0000)"
                    value={variation.color || "#000000"}
                    onChange={(e) => handleVariationChange(i, "color", e.target.value)}
                    className="border p-1 rounded w-full sm:w-28"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={variation.price}
                    onChange={(e) => handleVariationChange(i, "price", e.target.value)}
                    className="border p-1 rounded w-full sm:w-28"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleVariationChange(i, "imageFile", file);
                    }}
                    className="w-full sm:w-32"
                  />
                  {variation.imageFile && (
                    <img
                      src={URL.createObjectURL(variation.imageFile)}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded mt-2 sm:mt-0"
                    />
                  )}
                  {!variation.imageFile && variation.image && (
                    <img
                      src={`/uploads/products/${variation.image}`}
                      alt="Existing"
                      className="w-12 h-12 object-cover rounded mt-2 sm:mt-0"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeVariation(i)}
                    className="text-red-600 font-bold mt-2 sm:mt-0 sm:ml-auto"
                    title="Remove variation"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariation}
                className="px-4 py-2 bg-purple-600 text-white rounded w-full sm:w-auto"
              >
                + Add Variation
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}