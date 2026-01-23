import React, { useState } from "react";
import Nav from "../components/Nav";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/userSlice";
import Footer from "../components/Footer";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { BiFilterAlt, BiSliderAlt } from "react-icons/bi";

const AllProducts = () => {
  const { itemsInMyCity } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState([0, 250000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const itemsPerPage = 15;

  const clean = (val) => Number(String(val || 0).replace(/[^0-9.]/g, ""));

  // 1. Unique Categories nikalna
  const categories = itemsInMyCity
    ? [...new Set(itemsInMyCity.map((item) => item.category))]
    : [];

  // 2. ✨ Dynamic Brand Logic:
  // Ye sirf un categories ke brands dikhayega jo 'selectedCategories' mein hain.
  const availableBrands =
    itemsInMyCity && selectedCategories.length > 0
      ? [
          ...new Set(
            itemsInMyCity
              .filter((i) => selectedCategories.includes(i.category))
              .map((i) => i.brand)
              .filter(Boolean),
          ),
        ]
      : [];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setSelectedBrand(""); // Category badalne par brand reset
    setCurrentPage(1);
  };

  // --- Filtering Logic ---
  let filteredItems = (itemsInMyCity || []).filter((item) => {
    const itemPrice = clean(item.discountPrice || item.price || 0);
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);
    const priceMatch = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
    const brandMatch = !selectedBrand || item.brand === selectedBrand;

    return categoryMatch && priceMatch && brandMatch;
  });

  // --- Sorting Logic ---
  if (sortBy === "low-high")
    filteredItems.sort(
      (a, b) =>
        clean(a.discountPrice || a.price) - clean(b.discountPrice || b.price),
    );
  if (sortBy === "high-low")
    filteredItems.sort(
      (a, b) =>
        clean(b.discountPrice || b.price) - clean(a.discountPrice || a.price),
    );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-[#f8f8f8] min-h-screen font-sans antialiased">
      <Nav />

      <div className="pt-4 px-3 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic uppercase">
            {selectedBrand ? `${selectedBrand} Collection` : "Our Collection"}
            <span className="text-gray-400 font-semibold text-lg ml-2 not-italic">
              ({filteredItems.length})
            </span>
          </h1>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm outline-none cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value="">Sort By</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-5">
              {/* Category Filter */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
                  <BiFilterAlt size={16} /> Categories
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedBrand("");
                      setCurrentPage(1);
                    }}
                    className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${selectedCategories.length === 0 ? "bg-black text-white shadow-lg shadow-black/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    All Items
                  </button>
                  {categories.map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryChange(cat)}
                      className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${selectedCategories.includes(cat) ? "bg-black text-white shadow-lg shadow-black/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Brand Filter - Only shows when category is selected */}
              {selectedCategories.length > 0 && availableBrands.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2 ">
                    <BiFilterAlt size={16} /> Brands
                  </h3>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button
                      onClick={() => setSelectedBrand("")}
                      className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${!selectedBrand ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                    >
                      All Brands
                    </button>
                    {availableBrands.map((brand, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedBrand(brand)}
                        className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${selectedBrand === brand ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
                  <BiSliderAlt size={16} /> Max Price
                </h3>
                <input
                  type="range"
                  min={0}
                  max={250000}
                  step={5000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[14px] font-black text-black">
                    ₹{priceRange[1].toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Limit
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {paginatedItems.map((item) => {
                const displayImg = item?.images?.[0] || item?.image;
                const sPrice = item.discountPrice || item.price;
                const nPrice = clean(sPrice);
                const nOriginal = clean(item.originalPrice);
                const discount =
                  nOriginal > nPrice
                    ? Math.round(((nOriginal - nPrice) / nOriginal) * 100)
                    : 0;
                const saveAmount = nOriginal - nPrice;

                return (
                  <div
                    key={item._id}
                    className="group bg-white rounded-[1.5rem] p-3 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div
                      className="relative aspect-square overflow-hidden rounded-xl cursor-pointer flex items-center justify-center"
                      onClick={() => navigate(`/single-item/${item._id}`)}
                    >
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-black px-2 py-1 rounded-lg z-10 shadow-sm">
                          {discount}% OFF
                        </span>
                      )}

                      <img
                        src={displayImg}
                        alt={item.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            addToCart({
                              ...item,
                              id: item._id,
                              price: nPrice,
                              quantity: 1,
                              image: displayImg,
                            }),
                          );
                        }}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-black hover:text-white"
                      >
                        <HiOutlineShoppingBag size={20} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="mt-4 px-2 flex flex-col flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          {item.category}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase italic">
                          {item.brand}
                        </p>
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mt-1 min-h-[12px]">
                        {item.name}
                      </h3>

                      <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[18px] font-black text-gray-900 tracking-tight">
                            ₹{sPrice}
                          </span>
                          {discount > 0 && (
                            <span className="text-xs text-gray-400 line-through font-semibold">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>
                        {/* ✨ GREEN SAVE TEXT */}
                        {discount > 0 && (
                          <p className="text-[11px] text-green-600 font-bold mt-0.5">
                            You save ₹{saveAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
              <div className="flex justify-center gap-3 mt-16 mb-12">
                {Array.from(
                  { length: Math.ceil(filteredItems.length / itemsPerPage) },
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo(0, 0);
                      }}
                      className={`w-11 h-11 rounded-xl text-sm font-black shadow-sm transition-all ${currentPage === i + 1 ? "bg-black text-white scale-110 shadow-black/20" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProducts;
