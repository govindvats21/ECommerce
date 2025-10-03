import React, { useState } from "react";
import Nav from "../components/Nav";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/userSlice";
import Footer from "../components/Footer";
import { FaShoppingCart } from "react-icons/fa";

const AllProducts = () => {
  const { itemsInMyCity } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1️⃣ Extract unique categories for filter checkboxes
  const categories = [...new Set(itemsInMyCity.map((item) => item.category))];

  // 2️⃣ State management for filters, sort, pagination, mobile toggle
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle
  const itemsPerPage = 12; // Pagination limit

  // 3️⃣ Handle category checkbox toggle
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  let items = itemsInMyCity?.map((i) => i);

  {
    Math.round(
      ((items?.originalPrice - items?.discountPrice) / items?.originalPrice) * 100
    );
  }

  console.log(items);
  // 4️⃣ Filter products based on selected categories & price range
  let filteredItems = itemsInMyCity
    .filter(
      (item) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category)
    )
    .filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

  // 5️⃣ Sort products
  if (sortBy === "low-high") {
    filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
  } else if (sortBy === "high-low") {
    filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    filteredItems = [...filteredItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // 6️⃣ Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
<div className=" min-h-screen px-4 md:px-10 lg:px-20 pt-20">
      {/* Navigation */}
      <Nav />

      <div className="flex flex-col md:flex-row gap-5 mt-6">
        {/* ================== Sidebar Filters ================== */}
        <aside className="hidden md:block w-64 p-5 bg-white rounded-xl shadow-md space-y-6 sticky  h-fit">
          <h2 className="font-semibold text-lg">Filters</h2>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Category</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {categories?.map((cat, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 text-sm cursor-pointer hover:text-green-600"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    className="accent-green-600"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Price</h3>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-full accent-green-600 mt-1"
            />
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-green-600 mt-1"
            />
          </div>
        </aside>

        {/* ================== Mobile Filter Toggle ================== */}
        <div className="block md:hidden mb-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {showFilters && (
            <div className="mt-2 p-4 bg-white rounded-md shadow-md space-y-4 transition-all">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {categories?.map((cat, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 text-sm cursor-pointer hover:text-green-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="accent-green-600"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-medium mb-2">Price</h3>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="w-full accent-green-600 mt-1"
                />
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-full accent-green-600 mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================== Main Content ================== */}
        <main className="flex-1">
          {/* Top Bar: Title + Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <h1 className="text-2xl font-semibold">ALL PRODUCTS</h1>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">{filteredItems.length}</span>{" "}
                items
              </p>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
              >
                <option value="">Sort by: Featured</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076509.png"
                alt="No products"
                className="w-20 mb-3 opacity-70"
              />
              <p>No products found with selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {paginatedItems.map((item) => (
                    <div
      className="w-[180px] md:w-[200px] rounded-lg border border-gray-200 bg-white p-2 flex flex-col gap-1 cursor-pointer"
                  onClick={() => navigate(`/single-item/${item._id}`)}
                >
                  {/* Product Image with Discount Badge */}
<div className="relative w-full h-24 md:h-32 flex items-center justify-center overflow-hidden rounded-md bg-white">
                    <img
                      src={
                        item?.images?.[0]?.image1 ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item?.name}
                     className="object-contain max-h-full"
                    />
                    {item?.originalPrice && item?.discountPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {Math.round(
                          ((item.originalPrice - item.discountPrice) /
                            item.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      {item?.category}
                    </p>
                    <h2 className="text-gray-800 font-semibold text-sm line-clamp-2 hover:text-green-600 cursor-pointer">
                      {item?.name}
                    </h2>

                    <div className="mt-1 flex flex-col justify-between">
                      <span className="block text-base font-bold text-gray-900">
                        ₹{item?.discountPrice}
                      </span>
                      <span className="flex items-center gap-5 px-2">
 {item?.originalPrice && (
                        <p className="text-xs text-gray-500">
                          MRP:{" "}
                          <span className="line-through">
                            ₹{item.originalPrice}
                          </span>
                          

      <span className="text-red-500 text-xs md:text-sm font-semibold">Save ₹{item.originalPrice - item.discountPrice}</span>

                          


                        </p>
                      )}
                      </span>
                     
                    </div>

                    {/* Add to Cart */}
                    <button
                      className="w-full h-8 rounded-md border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 text-sm font-semibold flex items-center justify-center mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          addToCart({
                            id: item._id,
                            name: item.name,
                            shop: item.shop,
                            price: item.price,
                            quantity: 1,
                            image: item?.images?.[0]?.image1,
                          })
                        );
                      }}
                    >
                      <FaShoppingCart size={12} className="mr-1" />
                      Add 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } transition`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
      <Footer />

    </>
    
  );
};

export default AllProducts;
