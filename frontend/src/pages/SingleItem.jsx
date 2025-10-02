import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverURL } from "../App";
import Nav from "../components/Nav";
import { FiTruck, FiUserCheck } from "react-icons/fi";
import { TbReplaceFilled } from "react-icons/tb";
import { RiShieldCheckLine } from "react-icons/ri";
import RelatedItems from "../components/RelatedItems";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setItemsInMyCity } from "../redux/userSlice";
import Footer from "../components/Footer";

const SingleItem = () => {
  const dispatch = useDispatch()
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const {itemsInMyCity} = useSelector((state)=>state.user)

const handleItem = async () => {
    try {
      // single item fetch
      const res = await axios.get(`${serverURL}/api/item/get-item-by/${itemId}`, { withCredentials: true });
      setItem(res.data);

      // main image set
      setMainImage(res.data?.images[0]?.image1);

      // agar itemsInMyCity empty ho aur user login nahi hai toh default city fetch
      // if (!itemsInMyCity?.length && !userData) {
      //   const cityRes = await axios.get(`${serverURL}/api/item/items-in-city?city=Delhi`, { withCredentials: true });
      //   dispatch(setItemsInMyCity(cityRes.data.items));
      // }
    } catch (error) {
      console.log(error);
    }
  };

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
      
        {/* 📷 Left Section - Images */}
        <div className="flex flex-row  gap-6 w-full md:w-1/2">
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
<div className="flex-1 border max-w-100 max-h-89 border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-white p-5">
  <img
    src={mainImage}
    alt="main"
    className=" object-contain"
  />
</div>

        </div>

        {/* 📝 Right Section - Info */}
        <div className="w-full md:w-1/2 space-y-3">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{item?.name}</h1>

          {/* Price Section */}
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">₹{item?.discountPrice}</p>
            <p className="text-sm text-gray-500">
              MRP: <span className="line-through">₹{item?.originalPrice}</span> {discountPercentage}%
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {item?.description}
          </p>

          {/* Product Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-gray-700">
            <span className="flex flex-col items-center gap-1">
              <FiTruck className="text-xl text-green-600" /> Free Delivery
            </span>
            <span className="flex flex-col items-center gap-1">
              <TbReplaceFilled className="text-xl text-green-600" /> 30 Days Replacement
            </span>
            <span className="flex flex-col items-center gap-1">
              <FiUserCheck className="text-xl text-green-600" /> 100% Original
            </span>
            <span className="flex flex-col items-center gap-1">
              <RiShieldCheckLine className="text-xl text-green-600" /> 1 Year Warranty
            </span>
          </div>

          {/* Highlights */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-2">Highlights</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 text-sm">
              <li>Premium build quality</li>
              <li>Lightweight & durable</li>
              <li>Fast delivery & easy returns</li>
              <li>1 Year warranty covered</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="w-full sm:w-1/2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 rounded-md" 
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



      <RelatedItems data= {
        itemsInMyCity?.filter((i)=>(
    i._id !== itemId && i.category == item.category

))}
      />
    </div>
      <Footer />
    
    </>
  
    
  );
};

export default SingleItem;