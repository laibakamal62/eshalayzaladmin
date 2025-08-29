"use client";
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
    <div className="p-4 sm:ml-64 md:ml-80 min-h-screen bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0 mt-4">Categories</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setName('');
            setImage(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-full shadow hover:bg-[#6A2FCC] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="min-w-full">
          <thead className="bg-purple-100 text-gray-700 text-left text-sm">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                   <img
  src={cat.image} // use the Cloudinary URL directly
  alt={cat.name}
  className="h-12 w-12 object-cover rounded"
/>
                  </td>
                  <td className="p-4 font-semibold">{cat.name}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditClick(cat)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteClick(cat._id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  Let's add some categories to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex gap-4">
               <img
  src={cat.image} // Cloudinary URL directly
  alt={cat.name}
  className="h-16 w-16 object-cover rounded"
/>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditClick(cat)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteClick(cat._id)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            Let's add some categories to get started!
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
            <input
              type="text"
              placeholder="Category Name"
              className="w-full border p-2 rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="file"
              className="w-full mb-4"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#7C3AED] text-white rounded hover:bg-[#6A2FCC] transition-colors"
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