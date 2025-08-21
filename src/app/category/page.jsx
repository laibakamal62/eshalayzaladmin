'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/get-categories');
      const data = await res.json();
      setCategories(data?.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!name || (!image && !isEditing)) {
      alert('Please fill all fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (image) formData.append('image', image);

    try {
      let res;
      if (isEditing) {
        res = await axios.put(`/api/edit-category?id=${selectedCategoryId}`, formData);
      } else {
        res = await axios.post('/api/add-category', formData);
      }

      if (res.data.success) {
        setShowModal(false);
        setName('');
        setImage(null);
        setIsEditing(false);
        setSelectedCategoryId(null);
        fetchCategories();
      } else {
        alert('Failed to save category');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving category');
    }
  };

  const handleEditClick = (cat) => {
    setIsEditing(true);
    setSelectedCategoryId(cat._id);
    setName(cat.name);
    setImage(null);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await axios.delete(`/api/delete-category?id=${id}`);
      if (res.data.success) {
        fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setName('');
            setImage(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="ml-64 p-4">
        <h2 className="text-xl font-bold mb-4">Product Categories</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-t">
                <td className="p-2">
                  <img
                    src={`/${cat.image}`}
                    alt={cat.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="p-2">{cat.name}</td>
                <td className="p-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEditClick(cat)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteClick(cat._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
            <input
              type="text"
              placeholder="Category Name"
              className="w-full border p-2 mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="file"
              className="w-full mb-4"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAddCategory}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
