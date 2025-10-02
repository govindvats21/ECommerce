import React, { useState } from "react";

const categories = [
  "Fruits",
  "Vegetables",
  "Dairy & Bakery",
  "Snacks & Branded Foods",
  "Beverages",
  "Personal Care",
  "Household Essentials",
  "Baby Care",
  "Packaged Food",
  "Health & Wellness",
];

const InlineEditableField = ({ label, value, onChange, placeholder }) => (
  <div className="mb-3">
    <label className="block text-gray-600 mb-1 font-semibold">{label}</label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
);

const AddNewItemDashboard = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    category: "",
    images: [],
    previewImages: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );

    // Optional: Max 4 images
    if (files.length + newItem.images.length > 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewItem((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      previewImages: [...prev.previewImages, ...previews],
    }));
  };

  const handleRemoveImage = (index) => {
    setNewItem((prev) => {
      const newImages = [...prev.images];
      const newPreviews = [...prev.previewImages];
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        previewImages: newPreviews,
      };
    });
  };

  const validateForm = () => {
    if (!newItem.name.trim()) return "Item Name is required";
    if (!newItem.originalPrice || isNaN(newItem.originalPrice) || newItem.originalPrice <= 0)
      return "Valid Original Price is required";
    if (!newItem.category) return "Please select a category";
    return "";
  };

  const handleAddItem = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setItems((prev) => [...prev, newItem]);
      setNewItem({
        name: "",
        description: "",
        originalPrice: "",
        discountPrice: "",
        category: "",
        images: [],
        previewImages: [],
      });
      setLoading(false);
      alert("Item added successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-green-700">Seller Dashboard</h1>

      <div className="max-w-xl bg-white p-6 rounded-xl shadow-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Add New Grocery Item</h2>

        {/* Image Upload */}
        <div
          className="border-2 border-dashed border-green-400 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer mb-6"
          onClick={() => document.getElementById("imageInput").click()}
        >
          {newItem.previewImages.length ? (
            <div className="flex gap-2 overflow-x-auto max-w-full">
              {newItem.previewImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`preview-${idx}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-500 font-semibold">
              Click to upload images (max 4)
            </p>
          )}
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageSelect}
            multiple
            className="hidden"
          />
        </div>

        {/* Editable Fields */}
        <InlineEditableField
          label="Item Name"
          value={newItem.name}
          placeholder="Enter item name"
          onChange={(val) => setNewItem({ ...newItem, name: val })}
        />

        <InlineEditableField
          label="Description"
          value={newItem.description}
          placeholder="Enter description"
          onChange={(val) => setNewItem({ ...newItem, description: val })}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <InlineEditableField
            label="Original Price"
            value={newItem.originalPrice}
            placeholder="₹0"
            onChange={(val) => setNewItem({ ...newItem, originalPrice: val })}
          />
          <InlineEditableField
            label="Discount Price"
            value={newItem.discountPrice}
            placeholder="₹0"
            onChange={(val) => setNewItem({ ...newItem, discountPrice: val })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 font-semibold mb-1">Category</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleAddItem}
          className={`w-full bg-green-600 text-white font-semibold py-3 rounded transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
          }`}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </div>

      {/* Added Items List */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6">Added Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              {item.previewImages.length ? (
                <img
                  src={item.previewImages[0]}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <h4 className="font-bold text-lg text-center">{item.name}</h4>
              <p className="text-sm text-gray-600 text-center">{item.description}</p>
              <p className="mt-2 font-semibold text-green-700">
                ₹{item.discountPrice || item.originalPrice}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddNewItemDashboard;
