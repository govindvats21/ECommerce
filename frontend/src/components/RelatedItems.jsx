import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";

const RelatedItems = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-16 px-4 md:px-10 lg:px-20">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Related Products
      </h1>

      {/* Grid of cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl max-w-55 border  border-gray-200 shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col overflow-hidden"
          >
            {/* Image */}
            <div
              className="h-40 w-full overflow-hidden cursor-pointer flex items-center justify-center bg-gray-100"
              onClick={() => navigate(`/single-item/${item._id}`)}
            >
              <img
                src={item?.images[0]?.image1}
                alt={item?.name}
                className="h-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="p-4 flex flex-col flex-1">
              {/* Category */}
              <p className="text-gray-500 text-xs md:text-sm mb-1 line-clamp-1">
                {item?.category}
              </p>

              {/* Name */}
              <h2
                className="text-gray-700 font-medium text-sm md:text-base line-clamp-2 mb-2 cursor-pointer hover:text-green-600"
                onClick={() => navigate(`/single-item/${item._id}`)}
              >
                {item?.name}
              </h2>

              {/* Price & Add to Cart */}
              <div className="mt-auto flex items-center justify-between">
                <span className="text-gray-900 font-bold text-base md:text-lg">
                  ₹{item?.price}
                </span>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-medium rounded-md px-3 py-2 flex items-center gap-1 transition"
                  onClick={() =>
                    dispatch(
                      addToCart({
                        id: item._id,
                        name: item.name,
                        shop: item.shop,
                        price: item.price,
                        quantity: 1,
                        image: item?.images[0]?.image1,
                      })
                    )
                  }
                >
                  <CiShoppingCart size={18} />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedItems;
