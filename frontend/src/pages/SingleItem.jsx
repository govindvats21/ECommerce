import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverURL } from "../App";
import Nav from "../components/Nav";

import RelatedItems from "../components/RelatedItems";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setItemsInMyCity } from "../redux/userSlice";
import Footer from "../components/Footer";
import Highlights from "../components/Highlights";

const SingleItem = () => {
  const dispatch = useDispatch();
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const { itemsInMyCity } = useSelector((state) => state.user);

  const handleItem = async () => {
    try {
      // single item fetch
      const res = await axios.get(
        `${serverURL}/api/item/get-item-by/${itemId}`,
        { withCredentials: true }
      );
      setItem(res.data);

      // main image set
      setMainImage(res.data?.images[0]?.image1);

    } catch (error) {
      console.log(error);
    }
  };
console.log(item);

  useEffect(() => {
    handleItem();
  }, [itemId]);

  const discountAmount = item?.originalPrice - item?.discountPrice;
  const discountPercentage = item?.originalPrice
    ? Math.round((discountAmount / item?.originalPrice) * 100)
    : 0;

  if (!item) return <p className="text-center mt-40">Loading...</p>;

  return (
    <>
      <div>
        <Nav />




        <div className="flex flex-col md:flex-row gap-12 mt-28 px-6 md:px-30">
        {/* mobile device */}
 <div className=" md:hidden flex flex-col  gap-6 w-full md:w-1/2">
           

            {/* Main Image */}
           <div className="flex-1 border max-w-100 max-h-96 border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-white p-5">
              <img src={mainImage} alt="main" className=" object-contain w-full h-96" />
            </div>
 {/* Thumbnail Images */}
            <div className="flex flex-row gap-3">
              {item?.images[0]?.image1 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image1)}
                >
                  <img
                    src={item.images[0].image1}
                    alt="thumb-1"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image2 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image2)}
                >
                  <img
                    src={item.images[0].image2}
                    alt="thumb-2"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image3 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image3)}
                >
                  <img
                    src={item.images[0].image3}
                    alt="thumb-3"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image4 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image4)}
                >
                  <img
                    src={item.images[0].image4}
                    alt="thumb-4"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Desktop */}
          {/* 📷 Left Section - Images */}
          <div className=" hidden md:block md:flex   gap-6 w-full md:w-1/2">
            {/* Thumbnail Images */}
            <div className="flex flex-col gap-3">
              {item?.images[0]?.image1 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image1)}
                >
                  <img
                    src={item.images[0].image1}
                    alt="thumb-1"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image2 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image2)}
                >
                  <img
                    src={item.images[0].image2}
                    alt="thumb-2"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image3 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image3)}
                >
                  <img
                    src={item.images[0].image3}
                    alt="thumb-3"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}

              {item?.images[0]?.image4 && (
                <div
                  className="cursor-pointer"
                  onClick={() => setMainImage(item.images[0].image4)}
                >
                  <img
                    src={item.images[0].image4}
                    alt="thumb-4"
                    className="w-16 h-16 md:w-22 md:h-21 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Main Image */}
           <div className="flex-1 border max-w-100 max-h-96 border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-white p-5">
              <img src={mainImage} alt="main" className=" object-contain w-full h-96" />
            </div>
          </div>




          {/* 📝 Right Section - Info */}
          <div className="w-full md:w-1/2 space-y-3">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {item?.name}
            </h1>

            {/* Price Section */}
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">
                ₹{item?.discountPrice}
              </p>
              <p className="text-sm text-gray-500">
                MRP:{" "}
                <span className="line-through">₹{item?.originalPrice}</span>{" "}
                {discountPercentage}%
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{item?.description}</p>

            <Highlights category={item?.category} />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className="w-full sm:w-1/2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 rounded-md"
                onClick={() =>
                  dispatch(
                    addToCart({
                      id: item._id,
                      name: item.name,
                      shop: item.shop,
                      price: item.discountPrice,
                      quantity: 1,
                      image: item?.images[0]?.image1,
                    })
                  )
                }
              >
                Add to Cart
              </button>
              <button className="w-full sm:w-1/2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <RelatedItems
          data={itemsInMyCity?.filter(
            (i) => i._id !== itemId && i.category == item.category
          )}
        />
      </div>
      <Footer />
    </>
  );
};

export default SingleItem;
